import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { formatDistanceToNow } from "date-fns";

export function Notifications() {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.currentUser);
  const notifications = useAppStore((state) => state.notifications) || [];
  const friendRequests = useAppStore((state) => state.friendRequests) || [];
  const fetchNotifications =
    useAppStore((state) => state.fetchNotifications) || (async () => {});
  const fetchFriendRequests =
    useAppStore((state) => state.fetchFriendRequests) || (async () => {});
  const markNotificationsAsRead =
    useAppStore((state) => state.markNotificationsAsRead) || (async () => {});
  const acceptFriendRequest = useAppStore((state) => state.acceptFriendRequest);
  const declineFriendRequest = useAppStore((state) => state.declineFriendRequest);
  const users = useAppStore((state) => state.users) || {};

  useEffect(() => {
    fetchNotifications();
    fetchFriendRequests();
  }, [fetchNotifications, fetchFriendRequests]);

  const getIconForType = (type: string) => {
    switch (type) {
      case "like":
        return <Heart size={20} className="text-pink-400" />;
      case "comment":
        return <MessageCircle size={20} className="text-blue-400" />;
      case "follow":
        return <UserPlus size={20} className="text-purple-400" />;
      case "friend_request":
        return <UserPlus size={20} className="text-amber-400" />;
      case "message":
        return <Bell size={20} className="text-emerald-400" />;
      default:
        return <Bell size={20} className="text-white/40" />;
    }
  };

  const getBgForType = (type: string) => {
    switch (type) {
      case "like":
        return "bg-pink-400/10 border-pink-400/20";
      case "comment":
        return "bg-blue-400/10 border-blue-400/20";
      case "follow":
        return "bg-purple-400/10 border-purple-400/20";
      case "friend_request":
        return "bg-amber-400/10 border-amber-400/20";
      case "message":
        return "bg-emerald-400/10 border-emerald-400/20";
      default:
        return "bg-white/10 border-white/20";
    }
  };

  const getTitleForType = (type: string) => {
    switch (type) {
      case "like":
        return "New Like";
      case "comment":
        return "New Comment";
      case "follow":
        return "New Follower";
      case "friend_request":
        return "Friend Request";
      case "message":
        return "New Message";
      default:
        return "Notification";
    }
  };

  const getDescForType = (type: string, actorName: string) => {
    switch (type) {
      case "like":
        return `${actorName} liked your post.`;
      case "comment":
        return `${actorName} commented on your post.`;
      case "follow":
        return `${actorName} started following your work.`;
      case "friend_request":
        return `${actorName} sent you a friend request.`;
      case "message":
        return `${actorName} sent you a message.`;
      default:
        return `${actorName} interacted with you.`;
    }
  };

  return (
    <div className="w-full h-full p-4 md:p-8 max-w-3xl mx-auto space-y-8 overflow-y-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Activity
        </h1>
        <button
          onClick={() => markNotificationsAsRead()}
          className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
        >
          Mark all as read
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-white/5 pb-2">
        <button className="text-xs font-bold uppercase tracking-[0.2em] border-b-2 border-indigo-500 pb-2 px-1 text-indigo-400">
          All
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-white/40 text-center py-12 font-mono text-sm">
            No activity recorded.
          </p>
        ) : (
          notifications.map((notif) => {
            const actor = users[notif.fromUserId];
            return (
              <div
                key={notif.id}
                className={`flex gap-4 p-4 rounded-3xl transition-colors cursor-pointer ${
                  notif.read
                    ? "hover:bg-white/5"
                    : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getBgForType(notif.type)}`}
                >
                  {getIconForType(notif.type)}
                </div>

                <div className="flex-1 min-w-0" onClick={() => {
                  if (notif.type === "message") {
                    navigate("/messages");
                  } else if (actor) {
                    navigate(`/u/${actor.username}`);
                  }
                }}>
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm">
                      {getTitleForType(notif.type)}
                    </h4>
                    <span className="text-[10px] text-white/40 uppercase tracking-widest whitespace-nowrap">
                      {formatDistanceToNow(new Date(notif.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-white/60 mt-1 line-clamp-2">
                    {getDescForType(notif.type, actor?.name || "Someone")}
                  </p>
                  
                  {notif.type === "friend_request" && (() => {
                    const req = friendRequests.find(r => r.senderId === notif.fromUserId && r.receiverId === currentUser?.id && r.status === "pending");
                    if (req) {
                      return (
                        <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => acceptFriendRequest(req.id)} className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Accept</button>
                          <button onClick={() => declineFriendRequest(req.id)} className="px-4 py-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Decline</button>
                        </div>
                      );
                    } else if (friendRequests.find(r => r.senderId === notif.fromUserId && r.receiverId === currentUser?.id && r.status === "accepted")) {
                      return <div className="text-[10px] text-emerald-400 uppercase tracking-widest mt-2 font-bold">Accepted</div>;
                    } else if (friendRequests.find(r => r.senderId === notif.fromUserId && r.receiverId === currentUser?.id && r.status === "declined")) {
                      return <div className="text-[10px] text-rose-400 uppercase tracking-widest mt-2 font-bold">Declined</div>;
                    }
                    return null;
                  })()}
                </div>

                {!notif.read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0"></div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
