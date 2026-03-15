import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  BookOpen,
  Plus,
  Users,
  LogOut,
  Settings,
  Copy,
  Check,
  X,
  Loader2,
  Crown,
  ExternalLink,
} from "lucide-react";

interface DashboardProps {
  onOpenClub: (clubId: Id<"clubs">) => void;
}

export function Dashboard({ onOpenClub }: DashboardProps) {
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.get);
  const clubs = useQuery(api.clubs.list);
  const createClub = useMutation(api.clubs.create);
  const joinClub = useMutation(api.clubs.join);
  const generateRecommendations = useAction(api.ai.generateRecommendations);

  const [activeTab, setActiveTab] = useState<"clubs" | "picks" | "account">("clubs");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const handleCreateClub = async () => {
    if (!newClubName.trim()) return;
    setIsLoading(true);
    try {
      await createClub({ name: newClubName.trim() });
      setNewClubName("");
      setShowCreateModal(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClub = async () => {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    try {
      await joinClub({ inviteCode: inviteCode.trim() });
      setInviteCode("");
      setShowJoinModal(false);
    } catch (e: any) {
      alert(e.message || "Failed to join club");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadRecommendations = async () => {
    if (!profile) return;
    setLoadingRecs(true);
    try {
      const recs = await generateRecommendations({ userId: profile.userId });
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecs(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDF6EC]/95 backdrop-blur-sm border-b border-[#C4806A]/10">
        <div className="px-4 py-4 max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#6B3A2A]" />
            <span className="font-serif text-xl text-[#6B3A2A] font-bold">dabook.club</span>
          </div>
          <button
            onClick={() => signOut()}
            className="p-2 text-[#6B3A2A]/60 hover:text-[#6B3A2A] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[65px] z-40 bg-[#FDF6EC]/95 backdrop-blur-sm border-b border-[#C4806A]/10">
        <div className="px-4 max-w-2xl mx-auto">
          <div className="flex gap-1">
            {[
              { id: "clubs", label: "My Clubs" },
              { id: "picks", label: "Picks" },
              { id: "account", label: "Account" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all min-h-[44px] ${
                  activeTab === tab.id
                    ? "text-[#6B3A2A] border-b-2 border-[#D4A843]"
                    : "text-[#6B3A2A]/50 hover:text-[#6B3A2A]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Clubs Tab */}
        {activeTab === "clubs" && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Plus className="w-5 h-5" />
                Create Club
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex-1 border-2 border-[#C4806A]/30 hover:border-[#C4806A] text-[#6B3A2A] font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px]"
              >
                <Users className="w-5 h-5" />
                Join Club
              </button>
            </div>

            {clubs === undefined ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#C4806A] mx-auto" />
              </div>
            ) : clubs.length === 0 ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#C4806A]/10">
                <BookOpen className="w-12 h-12 text-[#C4806A]/50 mx-auto mb-3" />
                <h3 className="font-serif text-xl text-[#6B3A2A] mb-2">No clubs yet</h3>
                <p className="text-[#6B3A2A]/60 text-sm">
                  Create your first book club or join one with an invite code
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clubs.map((club: any) => (
                  <button
                    key={club._id}
                    onClick={() => onOpenClub(club._id)}
                    className="w-full bg-white rounded-2xl p-4 border border-[#C4806A]/10 hover:border-[#C4806A]/30 transition-all text-left min-h-[80px]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-[#D4A843]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-[#6B3A2A]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-serif text-lg text-[#6B3A2A] truncate">{club.name}</h3>
                          {club.role === "owner" && (
                            <Crown className="w-4 h-4 text-[#D4A843] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[#6B3A2A]/60 text-sm">
                          {club.memberCount} member{club.memberCount !== 1 && "s"}
                          {club.currentBook && ` · Reading: ${club.currentBook.title}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Picks Tab */}
        {activeTab === "picks" && (
          <div className="space-y-4">
            <div className="text-center py-6 bg-white/50 rounded-2xl border border-[#C4806A]/10">
              <h3 className="font-serif text-xl text-[#6B3A2A] mb-2">Personalized Picks</h3>
              <p className="text-[#6B3A2A]/60 text-sm mb-4">
                Get AI-powered book recommendations based on your preferences
              </p>
              <button
                onClick={handleLoadRecommendations}
                disabled={loadingRecs}
                className="bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mx-auto min-h-[48px]"
              >
                {loadingRecs ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Get Recommendations"
                )}
              </button>
            </div>

            {recommendations.length > 0 && (
              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 border border-[#C4806A]/10"
                  >
                    <h4 className="font-serif text-lg text-[#6B3A2A] mb-1">{rec.title}</h4>
                    <p className="text-[#6B3A2A]/70 text-sm mb-2">by {rec.author}</p>
                    <p className="text-[#6B3A2A]/60 text-sm mb-3">{rec.reason}</p>
                    <a
                      href={rec.amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#C4806A] text-sm font-medium hover:underline min-h-[44px]"
                    >
                      View on Amazon <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Account Tab */}
        {activeTab === "account" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-[#D4A843]/20 rounded-full flex items-center justify-center">
                  <span className="font-serif text-2xl text-[#6B3A2A]">
                    {profile?.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-xl text-[#6B3A2A]">{profile?.name}</h3>
                  <p className="text-[#6B3A2A]/60 text-sm">
                    Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "recently"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
              <h4 className="font-serif text-lg text-[#6B3A2A] mb-3">Subscription</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#6B3A2A] font-medium">Book Club Membership</p>
                  <p className="text-[#6B3A2A]/60 text-sm">$4.99/month</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  Active
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[52px]"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-6 border-t border-[#C4806A]/10 text-center">
        <p className="text-[#6B3A2A]/30 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      {/* Create Club Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-[#FDF6EC] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-[#6B3A2A]">Create a Book Club</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-[#6B3A2A]/60 hover:text-[#6B3A2A] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={newClubName}
              onChange={(e) => setNewClubName(e.target.value)}
              placeholder="Club name"
              className="w-full px-4 py-4 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] mb-4 min-h-[52px]"
            />
            <button
              onClick={handleCreateClub}
              disabled={!newClubName.trim() || isLoading}
              className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Club"}
            </button>
          </div>
        </div>
      )}

      {/* Join Club Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <div className="bg-[#FDF6EC] rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-[#6B3A2A]">Join a Book Club</h3>
              <button
                onClick={() => setShowJoinModal(false)}
                className="p-2 text-[#6B3A2A]/60 hover:text-[#6B3A2A] min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Enter invite code"
              className="w-full px-4 py-4 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] mb-4 text-center text-xl tracking-widest font-mono min-h-[52px]"
              maxLength={6}
            />
            <button
              onClick={handleJoinClub}
              disabled={inviteCode.length !== 6 || isLoading}
              className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px]"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Club"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
