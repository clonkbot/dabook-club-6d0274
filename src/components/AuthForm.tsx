import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BookOpen, ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: "signIn" | "signUp";
  onBack: () => void;
  onToggleMode: () => void;
}

export function AuthForm({ mode, onBack, onToggleMode }: AuthFormProps) {
  const { signIn } = useAuthActions();
  const createProfile = useMutation(api.profiles.create);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("flow", mode);

      await signIn("password", formData);

      if (mode === "signUp" && name) {
        // Create profile after successful signup
        setTimeout(async () => {
          try {
            await createProfile({ name });
          } catch (e) {
            console.error("Profile creation error:", e);
          }
        }, 500);
      }
    } catch (e: any) {
      setError(e.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 md:py-6">
        <div className="max-w-md mx-auto flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#6B3A2A] hover:text-[#C4806A] transition-colors p-2 -ml-2 min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-start justify-center px-4 pt-8 md:pt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#D4A843]/20 rounded-2xl mb-4">
              <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-[#6B3A2A]" />
            </div>
            <h1 className="font-serif text-2xl md:text-3xl text-[#6B3A2A] mb-2">
              {mode === "signIn" ? "Welcome back!" : "Join the club"}
            </h1>
            <p className="text-[#6B3A2A]/60 text-sm md:text-base">
              {mode === "signIn"
                ? "Sign in to access your book clubs"
                : "Create your account to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signUp" && (
              <div>
                <label className="block text-sm font-medium text-[#6B3A2A] mb-1.5">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="How should we call you?"
                  className="w-full px-4 py-3.5 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition-all min-h-[48px]"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#6B3A2A] mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3.5 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition-all min-h-[48px]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#6B3A2A] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent transition-all min-h-[48px]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#6B3A2A]/50 hover:text-[#6B3A2A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{mode === "signIn" ? "Signing in..." : "Creating account..."}</span>
                </>
              ) : (
                <span>{mode === "signIn" ? "Sign In" : "Create Account"}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onToggleMode}
              className="text-[#6B3A2A]/70 hover:text-[#6B3A2A] text-sm transition-colors min-h-[44px] px-4"
            >
              {mode === "signIn" ? (
                <>Don't have an account? <span className="font-semibold text-[#C4806A]">Sign up</span></>
              ) : (
                <>Already have an account? <span className="font-semibold text-[#C4806A]">Sign in</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-4 py-6 text-center">
        <p className="text-[#6B3A2A]/30 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
