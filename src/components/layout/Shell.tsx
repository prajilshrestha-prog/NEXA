import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { useTheme } from "../../contexts/ThemeContext";
import { AICoreAssistant } from "./AICoreAssistant";

export function Shell() {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen overflow-hidden flex font-sans transition-colors duration-1000">
      <Sidebar />
      <main className="flex-1 overflow-y-auto w-full relative z-10 pb-20 md:pb-0">
        {/* Global ambient background effects */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          <div
            className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 transition-colors duration-1000"
            style={{ backgroundColor: "var(--color-nexa-glow1)" }}
          ></div>
          <div
            className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 transition-colors duration-1000"
            style={{ backgroundColor: "var(--color-nexa-glow2)" }}
          ></div>
        </div>
        <Outlet />
      </main>
      <AICoreAssistant />
      <BottomNav />
    </div>
  );
}
