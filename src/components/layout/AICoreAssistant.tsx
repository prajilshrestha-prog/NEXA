import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X, Terminal, Globe, Brain } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
});

// Singleton conversation simulation if persistent memory wasn't strictly necessary for a demo
// but we want state across routes
let sessionHistory: { role: "user" | "model"; parts: { text: string }[] }[] =
  [];

export function AICoreAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { role: "ai" | "user"; content: string }[]
  >([
    {
      role: "ai",
      content:
        "NEXA AI assistant initialized. How can I help you create today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    // Provide contextual AI greetings based on route
    let ctxMessage = "";
    switch (location.pathname) {
      case "/gallery":
        ctxMessage =
          "You are exploring the Creator Gallery. Looking for inspiration?";
        break;
      case "/creator-hub":
        ctxMessage =
          "Creator Hub active. I can help analyze your recent engagement metrics.";
        break;
      case "/opportunities":
        ctxMessage =
          "Searching for roles or projects? I can help refine your pitch.";
        break;
      case "/profile":
        ctxMessage =
          "Profile configuration open. Need help writing an engaging bio?";
        break;
    }

    if (ctxMessage && !isOpen) {
      setMessages((prev) => {
        if (prev[prev.length - 1]?.content === ctxMessage) return prev;
        return [...prev, { role: "ai", content: ctxMessage }];
      });
    }
  }, [location.pathname, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    sessionHistory.push({ role: "user", parts: [{ text: userMessage }] });
    setInput("");
    setIsTyping(true);

    // Commands first
    const currentInput = userMessage.toLowerCase();
    if (
      currentInput.includes("hub") ||
      currentInput.includes("analytics")
    ) {
      setTimeout(() => navigate("/creator-hub"), 1500);
    } else if (
      currentInput.includes("job") ||
      currentInput.includes("opportunity")
    ) {
      setTimeout(() => navigate("/opportunities"), 1500);
    } else if (
      currentInput.includes("gallery") ||
      currentInput.includes("showcase")
    ) {
      setTimeout(() => navigate("/gallery"), 1500);
    }

    try {
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: sessionHistory,
        config: {
          systemInstruction:
            "You are the NEXA AI assistant for a creator platform. You help users write content, understand analytics, find jobs, and create better videos/images. Be concise, professional, and helpful. Format responses with markdown.",
        },
      });

      let aiResponse = "";
      setMessages((prev) => [...prev, { role: "ai", content: "" }]);

      for await (const chunk of responseStream) {
        aiResponse += chunk.text;
        setMessages((prev) => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].content = aiResponse;
          return newMessages;
        });
      }

      sessionHistory.push({ role: "model", parts: [{ text: aiResponse }] });
    } catch (e) {
      console.error("AI Error:", e);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content =
          "Neural link anomaly detected. Intelligence syncing suspended temporarily.";
        return newMessages;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 rounded-full bg-[var(--color-nexa-accent)] flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300 hover:scale-110 ${isOpen ? "opacity-0 pointer-events-none scale-0" : "opacity-100 scale-100"}`}
      >
        <Sparkles size={24} className="text-white relative z-10" />
        <div className="absolute inset-0 rounded-full animate-ping bg-[var(--color-nexa-accent)] opacity-40"></div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
            className="fixed bottom-24 md:bottom-8 right-6 z-50 w-[350px] sm:w-[450px] h-[600px] max-h-[85vh] rounded-[32px] glass flex flex-col overflow-hidden border border-[var(--color-nexa-accent)]/30 shadow-[0_10px_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-[var(--color-glass-border)] flex items-center justify-between bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-2 text-[var(--color-nexa-accent-light)]">
                <Terminal size={18} />
                <span className="font-bold text-sm tracking-widest uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>{" "}
                  NEXA AI
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--color-nexa-text-muted)] hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-hide bg-gradient-to-b from-transparent to-black/30"
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "ai" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[90%] p-4 rounded-3xl text-sm ${
                      msg.role === "ai"
                        ? "bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] text-[var(--color-nexa-text)] rounded-bl-none"
                        : "bg-gradient-to-br from-[var(--color-nexa-accent)] to-[#4f46e5] text-white rounded-br-none shadow-[0_5px_20px_rgba(99,102,241,0.3)]"
                    }`}
                  >
                    <div className="markdown-body">
                      {msg.role === "ai" ? (
                        <Markdown>{msg.content}</Markdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-3xl rounded-bl-none p-4 flex gap-2 w-16 items-center justify-center">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                    <span
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            {messages.length < 3 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide w-full">
                <button
                  onClick={() => {
                    setInput("Traverse to the Omniverse");
                    handleSend();
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-nexa-accent)]/30 bg-[var(--color-nexa-accent)]/10 text-[10px] font-bold uppercase tracking-widest text-[var(--color-nexa-accent-light)] hover:bg-[var(--color-nexa-accent)]/20 transition-colors"
                >
                  <Globe size={12} /> Traverse Reality
                </button>
                <button
                  onClick={() => {
                    setInput("Sync with Universal Consciousness");
                    handleSend();
                  }}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--color-nexa-accent)]/30 bg-[var(--color-nexa-accent)]/10 text-[10px] font-bold uppercase tracking-widest text-[var(--color-nexa-accent-light)] hover:bg-[var(--color-nexa-accent)]/20 transition-colors"
                >
                  <Brain size={12} /> Sync Mind
                </button>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-glass-border)] bg-black/60 backdrop-blur-xl">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Interact with Universal Mind..."
                  className="w-full bg-white/5 border border-[var(--color-glass-border)] rounded-full py-3.5 pl-5 pr-14 text-sm text-[var(--color-nexa-text)] placeholder-[var(--color-nexa-text-muted)] focus:outline-none focus:border-[var(--color-nexa-accent)] focus:bg-white/10 transition-colors shadow-inner"
                  disabled={isTyping}
                />
                <button
                  onClick={handleSend}
                  disabled={isTyping || !input.trim()}
                  className="absolute right-2 w-9 h-9 rounded-full bg-[var(--color-nexa-accent)] flex items-center justify-center text-white hover:bg-white transition-colors hover:text-black focus:outline-none disabled:opacity-50"
                >
                  <Sparkles size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
