import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState, Suspense, lazy } from "react";
import { Shell } from "./components/layout/Shell";
import { Auth } from "./pages/Auth";
import { SupabaseSetup } from "./pages/SupabaseSetup";
import { UpdatePassword } from "./pages/UpdatePassword";
import { useAppStore } from "./store/useAppStore";
import { hasSupabaseConfig, supabase } from "./lib/supabase";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Loader2 } from "lucide-react";
import { CallOverlay } from "./components/chat/CallOverlay";

const Home = lazy(() =>
  import("./pages/Home").then((m) => ({ default: m.Home })),
);
const Create = lazy(() =>
  import("./pages/Create").then((m) => ({ default: m.Create })),
);
const Notifications = lazy(() =>
  import("./pages/Notifications").then((m) => ({ default: m.Notifications })),
);
const Profile = lazy(() =>
  import("./pages/Profile").then((m) => ({ default: m.Profile })),
);
const Explore = lazy(() =>
  import("./pages/Explore").then((m) => ({ default: m.Explore })),
);
const Messages = lazy(() =>
  import("./pages/Messages").then((m) => ({ default: m.Messages })),
);
const Reels = lazy(() =>
  import("./pages/Reels").then((m) => ({ default: m.Reels })),
);
const Settings = lazy(() =>
  import("./pages/Settings").then((m) => ({ default: m.Settings })),
);
const StoryViewer = lazy(() =>
  import("./pages/StoryViewer").then((m) => ({ default: m.StoryViewer })),
);

const Portfolio = lazy(() =>
  import("./pages/Portfolio").then((m) => ({ default: m.Portfolio })),
);
const NexaAI = lazy(() =>
  import("./pages/NexaAI").then((m) => ({ default: m.NexaAI })),
);
const CreatorHub = lazy(() =>
  import("./pages/CreatorHub").then((m) => ({ default: m.CreatorHub })),
);
const Opportunities = lazy(() =>
  import("./pages/Opportunities").then((m) => ({ default: m.Opportunities })),
);

// Placeholder for un-implemented routes
const Placeholder = ({ title }: { title: string }) => (
  <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[var(--color-nexa-dark)]">
    <div className="glass p-12 rounded-[32px] border border-[var(--color-nexa-accent)]/20 shadow-[0_0_40px_rgba(99,102,241,0.1)] flex flex-col items-center max-w-md text-center">
      <div className="w-20 h-20 bg-[var(--color-nexa-accent)]/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <div className="w-2 h-2 bg-[var(--color-nexa-accent)] rounded-full"></div>
      </div>
      <h2 className="text-2xl font-display font-bold tracking-tight mb-4 text-white">
        {title}
      </h2>
      <p className="text-[var(--color-nexa-text-muted)] text-sm">
        We are building new creator features. Check back soon.
      </p>
    </div>
  </div>
);

const ViewLoader = () => (
  <div className="w-full h-[50vh] flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-8 h-8 text-[var(--color-nexa-accent)] animate-spin" />
    <span className="text-xs tracking-widest text-[#888] uppercase font-bold mt-2">
      Loading Workspace...
    </span>
  </div>
);

export default function App() {
  const [loadingAuth, setLoadingAuth] = useState(true);
  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser =
    useAppStore((state) => state.setCurrentUser) || (() => {});
  const initRealtime =
    useAppStore((state) => state.initRealtime) || (() => () => {});

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setLoadingAuth(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session error:", error);
        if (
          error.message.includes("Refresh Token") ||
          error.name.includes("AuthSessionMissingError")
        ) {
          supabase.auth.signOut().catch(() => {});
          setCurrentUser(null);
        }
        setLoadingAuth(false);
        return;
      }
      if (session?.user) {
        useAppStore.getState().initializeSession(session.user.id).finally(() => setLoadingAuth(false));
      } else {
        setLoadingAuth(false);
      }
    });

    // Listen to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // @ts-ignore
      if (_event === "TOKEN_REFRESH_FAILED") {
        supabase.auth.signOut().catch(() => {});
        setCurrentUser(null);
      } else if (session?.user) {
        useAppStore.getState().initializeSession(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    // Init Live DB Listeners safely
    let cleanupRealtime: (() => void) | undefined;
    try {
      if (initRealtime) cleanupRealtime = initRealtime();
    } catch (e) {
      console.error("Realtime init error:", e);
    }

    return () => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
      if (typeof cleanupRealtime === "function") {
        cleanupRealtime();
      }
    };
  }, [setCurrentUser, initRealtime]);

  if (!hasSupabaseConfig) {
    return <SupabaseSetup />;
  }

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <ViewLoader />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        {!currentUser ? (
          <Routes>
            <Route path="*" element={<Auth />} />
          </Routes>
        ) : (
          <>
            <CallOverlay />
            <Suspense
              fallback={
                <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                  <ViewLoader />
                </div>
              }
            >
              <Routes>
                <Route element={<Shell />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/create" element={<Create />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/u/:username" element={<Profile />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/nexa-ai" element={<NexaAI />} />
                  <Route path="/creator-hub" element={<CreatorHub />} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/reels" element={<Reels />} />
                  <Route path="/story/:id" element={<StoryViewer />} />
                  <Route path="/messages" element={<Messages />} />
                  <Route path="/messages/:id" element={<Messages />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </Suspense>
          </>
        )}
      </Router>
    </ErrorBoundary>
  );
}
