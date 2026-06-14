import { NavLink } from "react-router-dom";
import { Home, Search, PlusSquare, MessageSquare, User } from "lucide-react";
import { motion } from "motion/react";
import { useCommunicationStore } from "../../store/communicationStore";

const mobileNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Search", path: "/explore" },
  { icon: PlusSquare, label: "Create", path: "/create", primary: true },
  { icon: MessageSquare, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const unreadCounts = useCommunicationStore((state) => state.unreadCounts);
  const totalUnreadMessages = Object.values(unreadCounts).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#05050a]/90 backdrop-blur-2xl border-t border-[var(--color-glass-border)] z-50 px-4 pb-safe flex items-center justify-around">
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className="relative flex flex-col items-center justify-center w-auto h-full"
        >
          {({ isActive }) => {
            if (item.primary) {
              return (
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-[0_0_20px_rgba(107,33,168,0.5)] transform -translate-y-2">
                  <item.icon size={24} className="text-white" strokeWidth={2} />
                </div>
              );
            }

            return (
              <div
                className={`p-2 transition-colors relative ${isActive ? "text-white" : "text-white/50"}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-b-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.path === "/messages" && totalUnreadMessages > 0 && (
                  <div className="absolute top-1 right-1 w-3 h-3 bg-rose-500 rounded-full border border-[#05050a] animate-pulse" />
                )}
              </div>
            );
          }}
        </NavLink>
      ))}
    </nav>
  );
}
