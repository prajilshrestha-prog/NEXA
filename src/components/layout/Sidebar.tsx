import { NavLink } from "react-router-dom";
import {
  Home,
  Film,
  PlusSquare,
  User,
  Compass,
  Users,
  Search,
  Settings,
  Sparkles,
  Box,
  Globe,
  Radio,
  UserCircle2,
  Brain,
  Network,
  Activity,
  Infinity as InfinityIcon,
  LogOut,
  Bell,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { useAppStore } from "../../store/useAppStore";
import { useCommunicationStore } from "../../store/communicationStore";
import { supabase } from "../../lib/supabase";

const topNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/explore" },
  { icon: PlusSquare, label: "Create", path: "/create" },
  { icon: Film, label: "Reels", path: "/reels" },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
];

const creatorItems = [
  { icon: Box, label: "Portfolio", path: "/portfolio" },
  { icon: Activity, label: "Creator Hub", path: "/creator-hub" },
  { icon: Users, label: "Opportunities", path: "/opportunities" },
];

const personalItems = [
  { icon: UserCircle2, label: "Profile", path: "/profile" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar() {
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser =
    useAppStore((state) => state.setCurrentUser) || (() => {});
  const unreadCounts = useCommunicationStore((state) => state.unreadCounts);

  const totalUnreadMessages = Object.values(unreadCounts).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r border-[var(--color-glass-border)] bg-[var(--color-nexa-dark)]/40 backdrop-blur-3xl shrink-0 z-20 transition-colors duration-1000">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--color-nexa-accent)] to-[var(--color-nexa-accent-light)] flex items-center justify-center transition-colors">
          <Sparkles size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-2xl tracking-tight text-[var(--color-nexa-text)]">
          NEXA
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide relative z-10">
        <div className="text-[10px] font-semibold text-[var(--color-nexa-accent)] uppercase tracking-[0.3em] mb-4 px-3 flex items-center gap-2">
          <span className="w-1 h-3 rounded-full bg-[var(--color-nexa-accent)]"></span>{" "}
          Platform
        </div>
        {topNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? "text-[var(--color-nexa-text)]"
                  : "text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)] glass-hover"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)] rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <div className="relative">
                  <item.icon
                    size={18}
                    className={`relative z-10 ${isActive ? "text-[var(--color-nexa-accent-light)]" : ""}`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  {item.path === "/messages" && totalUnreadMessages > 0 && (
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-[var(--color-nexa-dark)] z-20 flex items-center justify-center animate-pulse" />
                  )}
                </div>
                <span
                  className={`flex-1 relative z-10 text-sm font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
                {item.path === "/messages" && totalUnreadMessages > 0 && (
                  <span className="relative z-10 text-xs font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-md min-w-[1.25rem] text-center">
                    {totalUnreadMessages > 99 ? "99+" : totalUnreadMessages}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-8 mb-4 px-3 text-[10px] font-semibold text-[var(--color-nexa-accent)] uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-1 h-3 rounded-full bg-rose-500"></span> Creator Space
        </div>
        {creatorItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? "text-[var(--color-nexa-text)] bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)]"
                  : "text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)] glass-hover"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={`${isActive ? "text-rose-400" : ""}`}
                  strokeWidth={1.5}
                />
                <span
                  className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        <div className="mt-8 mb-4 px-3 text-[10px] font-semibold text-[var(--color-nexa-accent)] uppercase tracking-[0.3em] flex items-center gap-2">
          <span className="w-1 h-3 rounded-full bg-emerald-500"></span>{" "}
          Account & Settings
        </div>
        {personalItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                isActive
                  ? "text-[var(--color-nexa-text)] bg-[var(--color-glass-surface)] border border-[var(--color-glass-border)]"
                  : "text-[var(--color-nexa-text-muted)] hover:text-[var(--color-nexa-text)] glass-hover"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={18}
                  className={`${isActive ? "text-[var(--color-nexa-accent-light)]" : ""}`}
                  strokeWidth={1.5}
                />
                <span
                  className={`text-sm font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {currentUser && (
        <div className="p-4 border-t border-[var(--color-glass-border)] flex items-center justify-between">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-glass-surface-hover)] transition-colors flex-1"
          >
            <img
              src={
                currentUser.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`
              }
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-[var(--color-glass-border)]"
            />
            <div className="truncate pr-2">
              <div className="font-semibold text-sm text-[var(--color-nexa-text)] truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-[var(--color-nexa-text-muted)] truncate">
                {currentUser.username}
              </div>
            </div>
          </NavLink>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setCurrentUser(null);
            }}
            className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
