import { useConvexAuth } from "convex/react";
import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthForm } from "./components/AuthForm";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { ClubWorkspace } from "./components/ClubWorkspace";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

type View = "landing" | "auth" | "onboarding" | "dashboard" | "club";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.get);
  const [view, setView] = useState<View>("landing");
  const [selectedClubId, setSelectedClubId] = useState<Id<"clubs"> | null>(null);
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");

  // Determine the current view based on auth state and profile
  const currentView = (): View => {
    if (!isAuthenticated) {
      return view === "auth" ? "auth" : "landing";
    }
    if (profile === undefined) return "landing"; // Still loading
    if (!profile) return "onboarding"; // Need to create profile
    if (!profile.onboardingComplete) return "onboarding";
    if (selectedClubId) return "club";
    return "dashboard";
  };

  const handleGetStarted = () => {
    setAuthMode("signUp");
    setView("auth");
  };

  const handleSignIn = () => {
    setAuthMode("signIn");
    setView("auth");
  };

  const handleBackToLanding = () => {
    setView("landing");
  };

  const handleOpenClub = (clubId: Id<"clubs">) => {
    setSelectedClubId(clubId);
    setView("club");
  };

  const handleBackToDashboard = () => {
    setSelectedClubId(null);
    setView("dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#C4806A] border-t-transparent mb-4"></div>
          <p className="text-[#6B3A2A] font-serif text-lg">Loading your book club...</p>
        </div>
      </div>
    );
  }

  const activeView = currentView();

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {activeView === "landing" && (
        <LandingPage onGetStarted={handleGetStarted} onSignIn={handleSignIn} />
      )}
      {activeView === "auth" && (
        <AuthForm
          mode={authMode}
          onBack={handleBackToLanding}
          onToggleMode={() => setAuthMode(authMode === "signIn" ? "signUp" : "signIn")}
        />
      )}
      {activeView === "onboarding" && <Onboarding />}
      {activeView === "dashboard" && (
        <Dashboard onOpenClub={handleOpenClub} />
      )}
      {activeView === "club" && selectedClubId && (
        <ClubWorkspace clubId={selectedClubId} onBack={handleBackToDashboard} />
      )}
    </div>
  );
}
