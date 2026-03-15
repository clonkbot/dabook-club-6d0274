import { BookOpen, Users, MessageCircle, Sparkles, ChefHat, Gamepad2 } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const features = [
    {
      icon: Users,
      title: "Private Clubs",
      description: "Create intimate spaces for your reading circle with simple invite codes",
    },
    {
      icon: MessageCircle,
      title: "Real-time Chat",
      description: "Discuss books, share reactions, and connect with your club anytime",
    },
    {
      icon: Sparkles,
      title: "AI Discussion Questions",
      description: "Get thoughtful, tailored questions to spark meaningful conversations",
    },
    {
      icon: ChefHat,
      title: "Food & Drink Pairings",
      description: "Curated refreshment ideas that complement your current read",
    },
    {
      icon: Gamepad2,
      title: "Book Club Games",
      description: "Fun activities to bring your meetings to life",
    },
    {
      icon: BookOpen,
      title: "Easy Book Picking",
      description: "Simple rotation system so everyone gets their turn to pick",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D4A843]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-72 h-72 bg-[#C4806A]/10 rounded-full blur-3xl"></div>
        </div>

        <nav className="relative z-10 px-4 py-4 md:py-6 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <BookOpen className="w-7 h-7 md:w-8 md:h-8 text-[#6B3A2A]" />
            <span className="font-serif text-xl md:text-2xl text-[#6B3A2A] font-bold tracking-tight">dabook.club</span>
          </div>
          <button
            onClick={onSignIn}
            className="text-[#6B3A2A] hover:text-[#C4806A] transition-colors text-sm md:text-base font-medium py-2 px-4"
          >
            Sign In
          </button>
        </nav>

        <div className="relative z-10 px-4 pt-8 pb-16 md:pt-16 md:pb-24 text-center max-w-4xl mx-auto">
          <div className="inline-block mb-4 md:mb-6 px-4 py-1.5 bg-[#C4806A]/15 rounded-full">
            <span className="text-[#6B3A2A] text-xs md:text-sm font-medium">✨ For book-loving women everywhere</span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#6B3A2A] leading-tight mb-4 md:mb-6">
            Your cozy corner for<br />
            <span className="relative">
              <span className="relative z-10">book club magic</span>
              <span className="absolute bottom-1 md:bottom-2 left-0 right-0 h-3 md:h-4 bg-[#D4A843]/30 -z-0"></span>
            </span>
          </h1>

          <p className="text-[#6B3A2A]/70 text-base md:text-xl max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4">
            Create private spaces for your reading circle. Chat, pick books, get AI-powered
            discussion questions, and make every meeting memorable.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 px-8 rounded-full transition-all transform hover:scale-105 shadow-lg hover:shadow-xl min-h-[52px]"
            >
              Start Your Club — $4.99/mo
            </button>
            <p className="text-[#6B3A2A]/50 text-sm">No commitment. Cancel anytime.</p>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="px-4 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="font-serif text-2xl md:text-4xl text-[#6B3A2A] mb-3 md:mb-4">
            Everything your book club needs
          </h2>
          <p className="text-[#6B3A2A]/60 text-sm md:text-base max-w-xl mx-auto">
            Simple, thoughtful tools designed for real book club moments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 md:p-6 border border-[#C4806A]/10 hover:border-[#C4806A]/30 transition-all hover:shadow-lg group"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 bg-[#D4A843]/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#D4A843]/30 transition-colors">
                <feature.icon className="w-5 h-5 md:w-6 md:h-6 text-[#6B3A2A]" />
              </div>
              <h3 className="font-serif text-lg md:text-xl text-[#6B3A2A] mb-2">{feature.title}</h3>
              <p className="text-[#6B3A2A]/60 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-4 py-12 md:py-20">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl shadow-xl border border-[#C4806A]/20 overflow-hidden">
            <div className="bg-gradient-to-r from-[#C4806A] to-[#D4A843] p-6 md:p-8 text-center">
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">Book Club Membership</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl md:text-5xl font-bold text-white">$4.99</span>
                <span className="text-white/80">/month</span>
              </div>
            </div>

            <div className="p-6 md:p-8">
              <ul className="space-y-3 mb-6 md:mb-8">
                {[
                  "Create unlimited book clubs",
                  "Invite members with simple codes",
                  "Real-time group chat",
                  "AI discussion questions",
                  "Food & drink pairings",
                  "Book club games",
                  "Book picking rotation",
                  "Amazon affiliate book links",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#D4A843] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[#6B3A2A]/80 text-sm md:text-base">{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onGetStarted}
                className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all min-h-[52px]"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 md:py-12 border-t border-[#C4806A]/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#6B3A2A]/50" />
            <span className="font-serif text-lg text-[#6B3A2A]/50">dabook.club</span>
          </div>
          <p className="text-[#6B3A2A]/40 text-xs md:text-sm mb-2">
            Made with love for book clubs everywhere
          </p>
          <p className="text-[#6B3A2A]/30 text-xs">
            Requested by @web-user · Built by @clonkbot
          </p>
        </div>
      </footer>
    </div>
  );
}
