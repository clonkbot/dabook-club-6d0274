import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  ArrowLeft,
  MessageCircle,
  Shuffle,
  HelpCircle,
  Gamepad2,
  ChefHat,
  Send,
  Copy,
  Check,
  Search,
  X,
  Loader2,
  Crown,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  BookOpen,
} from "lucide-react";

interface ClubWorkspaceProps {
  clubId: Id<"clubs">;
  onBack: () => void;
}

type Tab = "chat" | "picking" | "questions" | "game" | "food";

export function ClubWorkspace({ clubId, onBack }: ClubWorkspaceProps) {
  const club = useQuery(api.clubs.get, { clubId });
  const messages = useQuery(api.messages.list, { clubId });
  const sendMessage = useMutation(api.messages.send);
  const searchBooks = useAction(api.books.search);
  const getOrCreateBook = useMutation(api.books.getOrCreate);
  const setCurrentBook = useMutation(api.clubs.setCurrentBook);
  const advancePicker = useMutation(api.clubs.advancePicker);
  const updatePickerOrder = useMutation(api.clubs.updatePickerOrder);

  const generateQuestions = useAction(api.ai.generateQuestions);
  const generateFood = useAction(api.ai.generateFoodRecommendations);
  const generateGames = useAction(api.ai.generateGames);

  const questionsContent = useQuery(
    api.ai.getContent,
    club?.currentBookId
      ? { clubId, bookId: club.currentBookId, type: "questions" }
      : "skip"
  );
  const foodContent = useQuery(
    api.ai.getContent,
    club?.currentBookId
      ? { clubId, bookId: club.currentBookId, type: "food" }
      : "skip"
  );
  const gamesContent = useQuery(
    api.ai.getContent,
    club?.currentBookId
      ? { clubId, bookId: club.currentBookId, type: "games" }
      : "skip"
  );

  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messageInput, setMessageInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [bookSearch, setBookSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [generatingContent, setGeneratingContent] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && activeTab === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    await sendMessage({ clubId, content: messageInput.trim() });
    setMessageInput("");
  };

  const handleCopyInviteCode = () => {
    if (club?.inviteCode) {
      navigator.clipboard.writeText(club.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookSearch = async () => {
    if (!bookSearch.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchBooks({ query: bookSearch });
      setSearchResults(results);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBook = async (book: any) => {
    try {
      const bookId = await getOrCreateBook({
        googleBooksId: book.googleBooksId,
        title: book.title,
        authors: book.authors,
        coverUrl: book.coverUrl,
        description: book.description,
        pageCount: book.pageCount,
      });
      await setCurrentBook({ clubId, bookId });
      setShowBookSearch(false);
      setBookSearch("");
      setSearchResults([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateContent = async (type: "questions" | "food" | "games") => {
    if (!club?.currentBook) return;
    setGeneratingContent(type);
    try {
      const args = {
        clubId,
        bookId: club.currentBookId!,
        bookTitle: club.currentBook.title,
        bookAuthor: club.currentBook.authors[0] || "Unknown",
      };

      if (type === "questions") await generateQuestions(args);
      else if (type === "food") await generateFood(args);
      else if (type === "games") await generateGames(args);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingContent(null);
    }
  };

  const handleAdvancePicker = async () => {
    try {
      await advancePicker({ clubId });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMovePickerUp = async (index: number) => {
    if (!club || index <= 0) return;
    const newOrder = [...club.pickerOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    await updatePickerOrder({ clubId, pickerOrder: newOrder });
  };

  const handleMovePickerDown = async (index: number) => {
    if (!club || index >= club.pickerOrder.length - 1) return;
    const newOrder = [...club.pickerOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await updatePickerOrder({ clubId, pickerOrder: newOrder });
  };

  if (!club) {
    return (
      <div className="min-h-screen bg-[#FDF6EC] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C4806A]" />
      </div>
    );
  }

  const tabs = [
    { id: "chat" as Tab, label: "Chat", icon: MessageCircle },
    { id: "picking" as Tab, label: "Picking", icon: Shuffle },
    { id: "questions" as Tab, label: "Questions", icon: HelpCircle },
    { id: "game" as Tab, label: "Game", icon: Gamepad2 },
    { id: "food" as Tab, label: "Food", icon: ChefHat },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDF6EC]/95 backdrop-blur-sm border-b border-[#C4806A]/10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 text-[#6B3A2A]/60 hover:text-[#6B3A2A] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-lg text-[#6B3A2A] truncate">{club.name}</h1>
              <p className="text-[#6B3A2A]/50 text-xs">
                {club.members.length} member{club.members.length !== 1 && "s"}
              </p>
            </div>
            <button
              onClick={handleCopyInviteCode}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#D4A843]/20 rounded-lg text-[#6B3A2A] text-sm font-medium min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="font-mono tracking-wider">{club.inviteCode}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="sticky top-[61px] z-40 bg-[#FDF6EC]/95 backdrop-blur-sm border-b border-[#C4806A]/10 overflow-x-auto">
        <div className="flex min-w-max px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all min-h-[48px] whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[#6B3A2A] border-b-2 border-[#D4A843]"
                  : "text-[#6B3A2A]/50 hover:text-[#6B3A2A]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 flex flex-col">
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              {messages?.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-[#C4806A]/30 mx-auto mb-3" />
                  <p className="text-[#6B3A2A]/50">No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages?.map((msg: { _id: string; userName: string; createdAt: number; content: string }) => (
                <div
                  key={msg._id}
                  className="bg-white rounded-2xl p-3 border border-[#C4806A]/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-[#6B3A2A] text-sm">{msg.userName}</span>
                    <span className="text-[#6B3A2A]/40 text-xs">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-[#6B3A2A]/80 text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="sticky bottom-0 bg-[#FDF6EC] border-t border-[#C4806A]/10 p-4"
            >
              <div className="flex gap-2 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] min-h-[48px]"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] p-3 rounded-xl transition-all disabled:opacity-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Picking Tab */}
        {activeTab === "picking" && (
          <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full space-y-6">
            {/* Current Book */}
            <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
              <h3 className="font-serif text-lg text-[#6B3A2A] mb-3">Currently Reading</h3>
              {club.currentBook ? (
                <div className="flex gap-4">
                  {club.currentBook.coverUrl && (
                    <img
                      src={club.currentBook.coverUrl}
                      alt={club.currentBook.title}
                      className="w-20 h-28 object-cover rounded-lg shadow-md flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-xl text-[#6B3A2A] mb-1">
                      {club.currentBook.title}
                    </h4>
                    <p className="text-[#6B3A2A]/70 text-sm mb-2">
                      by {club.currentBook.authors.join(", ")}
                    </p>
                    {club.currentBook.amazonUrl && (
                      <a
                        href={club.currentBook.amazonUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#C4806A] text-sm font-medium hover:underline"
                      >
                        Buy on Amazon <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[#6B3A2A]/50 text-sm">No book selected yet</p>
              )}
            </div>

            {/* Current Picker */}
            <div className="bg-[#D4A843]/10 rounded-2xl p-5 border border-[#D4A843]/30">
              <h3 className="font-serif text-lg text-[#6B3A2A] mb-2">Currently Picking</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#D4A843] rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-[#6B3A2A]" />
                </div>
                <div>
                  <p className="font-semibold text-[#6B3A2A] text-lg">{club.currentPickerName}</p>
                  <p className="text-[#6B3A2A]/60 text-sm">It's their turn to choose!</p>
                </div>
              </div>

              {club.isOwner && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setShowBookSearch(true)}
                    className="flex-1 bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-3 rounded-xl transition-all min-h-[48px]"
                  >
                    Pick a Book
                  </button>
                  <button
                    onClick={handleAdvancePicker}
                    className="px-4 border-2 border-[#6B3A2A]/30 hover:border-[#6B3A2A] text-[#6B3A2A] font-medium rounded-xl transition-all min-h-[48px]"
                  >
                    Next Picker
                  </button>
                </div>
              )}
            </div>

            {/* Picker Order */}
            <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
              <h3 className="font-serif text-lg text-[#6B3A2A] mb-3">Picker Rotation</h3>
              <div className="space-y-2">
                {club.members
                  .sort((a: { userId: string }, b: { userId: string }) => {
                    const aIndex = club.pickerOrder.indexOf(a.userId as any);
                    const bIndex = club.pickerOrder.indexOf(b.userId as any);
                    return aIndex - bIndex;
                  })
                  .map((member: { _id: string; userId: string; name: string }, index: number) => {
                    const isCurrentPicker =
                      club.pickerOrder[club.currentPickerIndex] === member.userId;
                    return (
                      <div
                        key={member._id}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          isCurrentPicker ? "bg-[#D4A843]/10" : "bg-[#FDF6EC]"
                        }`}
                      >
                        <span className="w-6 h-6 rounded-full bg-[#C4806A]/20 flex items-center justify-center text-xs text-[#6B3A2A] font-medium">
                          {index + 1}
                        </span>
                        <span
                          className={`flex-1 ${
                            isCurrentPicker ? "font-semibold text-[#6B3A2A]" : "text-[#6B3A2A]/70"
                          }`}
                        >
                          {member.name}
                          {isCurrentPicker && " 👈"}
                        </span>
                        {club.isOwner && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMovePickerUp(index)}
                              disabled={index === 0}
                              className="p-1.5 text-[#6B3A2A]/40 hover:text-[#6B3A2A] disabled:opacity-30 min-h-[32px] min-w-[32px] flex items-center justify-center"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMovePickerDown(index)}
                              disabled={index === club.members.length - 1}
                              className="p-1.5 text-[#6B3A2A]/40 hover:text-[#6B3A2A] disabled:opacity-30 min-h-[32px] min-w-[32px] flex items-center justify-center"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Questions Tab */}
        {activeTab === "questions" && (
          <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
            {!club.currentBook ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#C4806A]/10">
                <HelpCircle className="w-12 h-12 text-[#C4806A]/30 mx-auto mb-3" />
                <p className="text-[#6B3A2A]/50">Select a book to get discussion questions</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
                  <h3 className="font-serif text-lg text-[#6B3A2A] mb-2">
                    Discussion Questions for
                  </h3>
                  <p className="text-[#6B3A2A]/70 italic">{club.currentBook.title}</p>
                </div>

                {questionsContent ? (
                  <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
                    <div className="prose prose-sm max-w-none text-[#6B3A2A]/80 whitespace-pre-wrap">
                      {questionsContent.content}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateContent("questions")}
                    disabled={generatingContent === "questions"}
                    className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    {generatingContent === "questions" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Discussion Questions"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Game Tab */}
        {activeTab === "game" && (
          <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
            {!club.currentBook ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#C4806A]/10">
                <Gamepad2 className="w-12 h-12 text-[#C4806A]/30 mx-auto mb-3" />
                <p className="text-[#6B3A2A]/50">Select a book to get game ideas</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
                  <h3 className="font-serif text-lg text-[#6B3A2A] mb-2">Book Club Games for</h3>
                  <p className="text-[#6B3A2A]/70 italic">{club.currentBook.title}</p>
                </div>

                {gamesContent ? (
                  <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
                    <div className="prose prose-sm max-w-none text-[#6B3A2A]/80 whitespace-pre-wrap">
                      {gamesContent.content}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateContent("games")}
                    disabled={generatingContent === "games"}
                    className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    {generatingContent === "games" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Game Ideas"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Food Tab */}
        {activeTab === "food" && (
          <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
            {!club.currentBook ? (
              <div className="text-center py-12 bg-white/50 rounded-2xl border border-[#C4806A]/10">
                <ChefHat className="w-12 h-12 text-[#C4806A]/30 mx-auto mb-3" />
                <p className="text-[#6B3A2A]/50">Select a book to get food & drink ideas</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
                  <h3 className="font-serif text-lg text-[#6B3A2A] mb-2">
                    Food & Drink Pairings for
                  </h3>
                  <p className="text-[#6B3A2A]/70 italic">{club.currentBook.title}</p>
                </div>

                {foodContent ? (
                  <div className="bg-white rounded-2xl p-5 border border-[#C4806A]/10">
                    <div className="prose prose-sm max-w-none text-[#6B3A2A]/80 whitespace-pre-wrap">
                      {foodContent.content}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateContent("food")}
                    disabled={generatingContent === "food"}
                    className="w-full bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[52px]"
                  >
                    {generatingContent === "food" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Food Ideas"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="px-4 py-4 border-t border-[#C4806A]/10 text-center">
        <p className="text-[#6B3A2A]/30 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      {/* Book Search Modal */}
      {showBookSearch && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#FDF6EC]">
          <header className="sticky top-0 z-50 bg-[#FDF6EC] border-b border-[#C4806A]/10 p-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => {
                  setShowBookSearch(false);
                  setBookSearch("");
                  setSearchResults([]);
                }}
                className="p-2 text-[#6B3A2A]/60 hover:text-[#6B3A2A] -ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-serif text-xl text-[#6B3A2A]">Search Books</h2>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleBookSearch()}
                placeholder="Search by title or author..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#C4806A]/30 bg-white text-[#6B3A2A] placeholder-[#6B3A2A]/40 focus:outline-none focus:ring-2 focus:ring-[#D4A843] min-h-[48px]"
                autoFocus
              />
              <button
                onClick={handleBookSearch}
                disabled={!bookSearch.trim() || isSearching}
                className="bg-[#D4A843] hover:bg-[#C4976E] text-[#6B3A2A] px-4 rounded-xl transition-all disabled:opacity-50 min-h-[48px] min-w-[48px] flex items-center justify-center"
              >
                {isSearching ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {searchResults.map((book) => (
              <button
                key={book.googleBooksId}
                onClick={() => handleSelectBook(book)}
                className="w-full bg-white rounded-2xl p-4 border border-[#C4806A]/10 hover:border-[#C4806A]/30 transition-all text-left"
              >
                <div className="flex gap-4">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded-lg shadow-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-24 bg-[#C4806A]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-[#C4806A]/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-lg text-[#6B3A2A] line-clamp-2">
                      {book.title}
                    </h4>
                    <p className="text-[#6B3A2A]/70 text-sm mb-1">
                      by {book.authors.join(", ")}
                    </p>
                    {book.pageCount && (
                      <p className="text-[#6B3A2A]/50 text-xs">{book.pageCount} pages</p>
                    )}
                  </div>
                </div>
              </button>
            ))}

            {searchResults.length === 0 && !isSearching && bookSearch && (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-[#C4806A]/30 mx-auto mb-3" />
                <p className="text-[#6B3A2A]/50">No books found. Try a different search.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
