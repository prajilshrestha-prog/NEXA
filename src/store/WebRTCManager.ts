import { supabase } from "../lib/supabase";
import { useAppStore } from "./useAppStore";
import { useCommunicationStore } from "./communicationStore";

class WebRTCManager {
  private peerConnections: Record<string, RTCPeerConnection> = {};
  private iceCandidateIntervals: Record<string, NodeJS.Timeout> = {};

  // STUN/TURN configuration
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
    iceCandidatePoolSize: 10,
  };

  async initiateCall(
    sessionId: string,
    partnerId: string,
    type: "audio" | "video",
  ) {
    console.log(`[WebRTC] CALL START (type: ${type}) to ${partnerId}`);
    // Acquire media
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      console.log("MEDIA GRANTED");
      useCommunicationStore.getState().setLocalStream(stream);
      this.sendSignal(partnerId, {
        type: "offer_request",
        sessionId,
        callType: type,
        ts: Date.now()
      });
    } catch (e: any) {
      console.error("Failed to acquire media", e);
      alert("Could not access camera/microphone: " + e.message + "\n\nPlease ensure permissions are granted.");
      useCommunicationStore.getState().endCall();
    }
  }

  async acceptCall(
    sessionId: string,
    partnerId: string,
    type: "audio" | "video",
  ) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      useCommunicationStore.getState().setLocalStream(stream);

      this.sendSignal(partnerId, { type: "accept", sessionId, ts: Date.now() });
      // Also the peer who initiated will start the peer connection (createOffer)
    } catch (e) {
      console.error("Failed to acquire media on accept", e);
      useCommunicationStore.getState().endCall();
    }
  }

  async startPeerConnection(
    partnerId: string,
    isInitiator: boolean,
    type: "audio" | "video",
  ) {
    if (this.peerConnections[partnerId]) {
      this.peerConnections[partnerId].close();
    }

    const pc = new RTCPeerConnection(this.rtcConfig);
    this.peerConnections[partnerId] = pc;

    // Add local stream tracks
    const { currentCall } = useCommunicationStore.getState();
    if (currentCall.localStream) {
      currentCall.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentCall.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const state = useCommunicationStore.getState();
      const currentRemoteStream = state.currentCall.remoteStream;
      
      if (currentRemoteStream) {
         event.streams[0].getTracks().forEach(track => {
            if (!currentRemoteStream.getTracks().find(t => t.id === track.id)) {
               currentRemoteStream.addTrack(track);
            }
         });
         state.setRemoteStream(currentRemoteStream); // trigger re-render
      } else {
         state.setRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.queueIceCandidate(partnerId, event.candidate);
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`[WebRTC] CALL OFFER created for ${partnerId}`);
      this.sendSignal(partnerId, { type: "sdp", sdp: pc.localDescription });
    }
  }

  // Batching ICE candidates into db
  private pendingCandidates: Record<string, RTCIceCandidate[]> = {};
  private queueIceCandidate(partnerId: string, candidate: RTCIceCandidate) {
    if (!this.pendingCandidates[partnerId])
      this.pendingCandidates[partnerId] = [];
    this.pendingCandidates[partnerId].push(candidate);

    if (!this.iceCandidateIntervals[partnerId]) {
      this.iceCandidateIntervals[partnerId] = setTimeout(() => {
        const candidates = this.pendingCandidates[partnerId];
        this.pendingCandidates[partnerId] = [];
        this.sendSignal(partnerId, { type: "ice", candidates });
        delete this.iceCandidateIntervals[partnerId];
      }, 500);
    }
  }

  private processedSignals = new Set<string>();

  private pendingRemoteIceCandidates: Record<string, RTCIceCandidate[]> = {};

  async handleSignal(from: string, data: any) {
    const { type, sessionId, callType, sdp, candidates } = data;
    
    // Hash or stringify to prevent duplicate processing from broadcast + DB fallback
    const signalHash = JSON.stringify(data);
    if (this.processedSignals.has(signalHash)) return;
    this.processedSignals.add(signalHash);
    
    // Cleanup old hashes periodically to avoid memory leak
    if (this.processedSignals.size > 1000) {
      this.processedSignals.clear();
    }

    const { currentCall } = useCommunicationStore.getState();

    if (type === "offer_request") {
      useCommunicationStore
        .getState()
        .handleIncomingCall(sessionId, from, callType);
    } else if (type === "accept") {
      useCommunicationStore.getState().handleCallAccepted(sessionId, from);
    } else if (type === "busy") {
      useCommunicationStore.getState().handleCallEnded(sessionId);
    } else if (type === "end") {
      useCommunicationStore
        .getState()
        .handleCallEnded(sessionId || currentCall.sessionId);
    } else if (type === "sdp") {
      const pc = this.peerConnections[from];
      if (!pc) {
        // If we receive SDP before WebRTC is fully setup on our side (e.g., waiting for getUserMedia)
        // We'll create it now as receiver
        await this.startPeerConnection(
          from,
          false,
          currentCall.type || "audio",
        );
      }
      const currentPc = this.peerConnections[from];
      if (currentPc) {
        await currentPc.setRemoteDescription(new RTCSessionDescription(sdp));
        
        // Process any queued remote ICE candidates now that remote description is set
        if (this.pendingRemoteIceCandidates[from]) {
          this.pendingRemoteIceCandidates[from].forEach(async (candidate) => {
             try { await currentPc.addIceCandidate(candidate); } catch(e) { console.error("Error adding queued ice candidate", e); }
          });
          delete this.pendingRemoteIceCandidates[from];
        }

        if (currentPc.remoteDescription?.type === "offer") {
          const answer = await currentPc.createAnswer();
          await currentPc.setLocalDescription(answer);
          console.log(`[WebRTC] CALL ANSWER created for ${from}`);
          this.sendSignal(from, {
            type: "sdp",
            sdp: currentPc.localDescription,
          });
        } else if (currentPc.remoteDescription?.type === "answer") {
          console.log(`[WebRTC] CALL CONNECTED to ${from}`);
        }
      }
    } else if (type === "ice") {
      console.log(`[WebRTC] ICE RECEIVED from ${from}`);
      const pc = this.peerConnections[from];
      if (pc) {
        candidates.forEach(async (candidate: any) => {
          try {
            const rtcCandidate = new RTCIceCandidate(candidate);
            if (pc.remoteDescription) {
               await pc.addIceCandidate(rtcCandidate);
            } else {
               if (!this.pendingRemoteIceCandidates[from]) this.pendingRemoteIceCandidates[from] = [];
               this.pendingRemoteIceCandidates[from].push(rtcCandidate);
            }
          } catch (e) {
            console.error("Error adding received ice candidate", e);
          }
        });
      } else {
         if (!this.pendingRemoteIceCandidates[from]) this.pendingRemoteIceCandidates[from] = [];
         candidates.forEach((candidate: any) => {
            this.pendingRemoteIceCandidates[from].push(new RTCIceCandidate(candidate));
         });
      }
    }
  }

  sendSignal(to: string, signalData: any) {
    const from = useAppStore.getState().currentUser?.id;
    if (!from) return;

    // Fast path: Broadcast
    import("./RealtimeManager").then((m) => {
      m.realtimeManager.broadcastCallSignal(to, signalData.type, signalData);
    });

    // Fallback to supabase insert on webrtc_signals Table since broadcast sometimes drops medium-sized packets
    const { currentCall } = useCommunicationStore.getState();
    supabase
      .from("webrtc_signals")
      .insert({
        call_id: currentCall.sessionId || signalData.sessionId || "00000000-0000-0000-0000-000000000000",
        sender_id: from,
        receiver_id: to,
        signal_type: signalData.type,
        signal: signalData,
      })
      .then(() => {
         console.log("SIGNAL SENT");
      });
  }

  endCall(partnerId: string | null) {
    console.log(`[WebRTC] CALL ENDED with ${partnerId}`);
    if (partnerId && this.peerConnections[partnerId]) {
      this.peerConnections[partnerId].close();
      delete this.peerConnections[partnerId];
    }
    if (partnerId) {
      this.sendSignal(partnerId, { type: "end", sessionId: useCommunicationStore.getState().currentCall.sessionId, ts: Date.now() });
    }
    // Stop all intervals
    for (const t in this.iceCandidateIntervals) {
      clearTimeout(this.iceCandidateIntervals[t]);
    }
    this.iceCandidateIntervals = {};
  }
}

export const wrtcManager = new WebRTCManager();
