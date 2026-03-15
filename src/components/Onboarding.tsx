import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BookOpen, ArrowRight, ArrowLeft, Check, Loader2 } from "lucide-react";

interface QuizAnswers {
  readingFrequency: string;
  favoriteGenres: string[];
  bookLength: string;
  readingGoal: string;
  clubExperience: string;
  discussionStyle: string;
  snackPreference: string;
  availability: string;
}

const questions = [
  {
    id: "readingFrequency",
    question: "How often do you typically read?",
    options: [
      "Daily bookworm 📚",
      "A few times a week",
      "When I find the right book",
      "Just starting my reading journey",
    ],
  },
  {
    id: "favoriteGenres",
    question: "What genres make your heart sing? (Pick up to 3)",
    multiSelect: true,
    options: [
      "Literary Fiction",
      "Romance",
      "Mystery & Thriller",
      "Historical Fiction",
      "Fantasy & Sci-Fi",
      "Memoir & Biography",
      "Self-Help",
      "Contemporary Fiction",
    ],
  },
  {
    id: "bookLength",
    question: "What's your ideal book length?",
    options: [
      "Quick reads (under 250 pages)",
      "Just right (250-400 pages)",
      "The longer, the better!",
      "I go with the story, not the pages",
    ],
  },
  {
    id: "readingGoal",
    question: "What's your reading goal this year?",
    options: [
      "Read more consistently",
      "Explore new genres",
      "Find my next favorite author",
      "Connect with other readers",
    ],
  },
  {
    id: "clubExperience",
    question: "Have you been in a book club before?",
    options: [
      "Yes, I'm a book club veteran!",
      "Once or twice",
      "This is my first time",
      "I've wanted to join one forever",
    ],
  },
  {
    id: "discussionStyle",
    question: "How do you like to discuss books?",
    options: [
      "Deep dives into themes & symbolism",
      "Character analysis & relationships",
      "Casual chat about what we liked",
      "A mix of everything!",
    ],
  },
  {
    id: "snackPreference",
    question: "What's your ideal book club snack vibe?",
    options: [
      "Wine & cheese, please 🍷",
      "Coffee & pastries ☕",
      "Tea & cookies 🫖",
      "Whatever matches the book!",
    ],
  },
  {
    id: "availability",
    question: "When do you usually have time for book club?",
    options: [
      "Weekday evenings",
      "Weekend afternoons",
      "Weekend evenings",
      "Flexible—I make it work!",
    ],
  },
];

export function Onboarding() {
  const profile = useQuery(api.profiles.get);
  const createProfile = useMutation(api.profiles.create);
  const completeOnboarding = useMutation(api.profiles.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    favoriteGenres: [],
  });

  const handleNameSubmit = async () => {
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await createProfile({ name: name.trim() });
      setStep(1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: string, multiSelect?: boolean) => {
    if (multiSelect) {
      const current = (answers[questionId as keyof QuizAnswers] as string[]) || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : current.length < 3
        ? [...current, value]
        : current;
      setAnswers({ ...answers, [questionId]: updated });
    } else {
      setAnswers({ ...answers, [questionId]: value });
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await completeOnboarding({
        quizAnswers: answers as QuizAnswers,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestion = questions[step - 1];
  const progress = step === 0 ? 0 : (step / (questions.length + 1)) * 100;

  // Name step
  if (step === 0 && !profile) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4A843]/20 rounded-2xl mb-6">
              <BookOpen className="w-8 h-8 text-[#6B3A2A]" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-[#6B3A2A] mb-3">
              Welcome to dabook.club!
            </h1>
            <p className="text-[#6B3A2A]/60 mb-8">
              Let's get to know you a little better
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#6B3A2A] mb-2 text-left">
                What should we call you?
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-4 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] focus:border-transparent text-lg min-h-[52px]"
                onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              />
            </div>

            <button
              onClick={handleNameSubmit}
              disabled={!name.trim() || isLoading}
              className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz steps
  if (step >= 1 && step <= questions.length) {
    const currentAnswer = answers[currentQuestion.id as keyof QuizAnswers];
    const isAnswered = currentQuestion.multiSelect
      ? (currentAnswer as string[])?.length > 0
      : !!currentAnswer;

    return (
      <div className="min-h-screen bg-[#FDF6EC] flex flex-col">
        {/* Progress bar */}
        <div className="px-4 pt-4 md:pt-6">
          <div className="max-w-md mx-auto">
            <div className="h-2 bg-[#C4806A]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D4A843] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[#6B3A2A]/50 text-xs mt-2 text-right">
              {step} of {questions.length}
            </p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-4 py-8">
          <div className="w-full max-w-md mx-auto">
            <h2 className="font-serif text-2xl md:text-3xl text-[#6B3A2A] mb-6 text-center">
              {currentQuestion.question}
            </h2>

            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option) => {
                const isSelected = currentQuestion.multiSelect
                  ? (currentAnswer as string[])?.includes(option)
                  : currentAnswer === option;

                return (
                  <button
                    key={option}
                    onClick={() =>
                      handleAnswer(currentQuestion.id, option, currentQuestion.multiSelect)
                    }
                    className={`w-full text-left px-4 py-4 rounded-xl border-2 transition-all min-h-[52px] flex items-center gap-3 ${
                      isSelected
                        ? "border-[#D4A843] bg-[#D4A843]/10"
                        : "border-[#C4806A]/20 bg-white hover:border-[#C4806A]/40"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "border-[#D4A843] bg-[#D4A843]"
                          : "border-[#C4806A]/40"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className="text-[#6B3A2A] text-sm md:text-base">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex-1 py-4 rounded-xl border-2 border-[#C4806A]/30 text-[#6B3A2A] font-medium hover:border-[#C4806A] transition-all flex items-center justify-center gap-2 min-h-[52px]"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={() => setStep(step + 1)}
                disabled={!isAnswered}
                className="flex-1 bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[52px]"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Complete step
  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-[#D4A843]/20 rounded-full mb-6">
          <Check className="w-10 h-10 text-[#D4A843]" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl text-[#6B3A2A] mb-3">
          You're all set!
        </h1>
        <p className="text-[#6B3A2A]/60 mb-8">
          We've got your reading preferences. Time to find your perfect book club!
        </p>

        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-h-[52px]"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <span>Enter dabook.club</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
