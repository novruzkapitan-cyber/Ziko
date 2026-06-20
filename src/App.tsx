import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Award, 
  Sparkles, 
  Lightbulb, 
  Compass, 
  Atom, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  RotateCcw, 
  MessageSquare, 
  Dices, 
  ExternalLink,
  ChevronRight, 
  User, 
  PenLine,
  ChevronDown,
  Info,
  BadgeAlert,
  Home
} from 'lucide-react';
import { SubjectId, Subject, Question, ChatMessage, UserStats, Badge } from './types';
import { SUBJECTS, PRESET_QUESTIONS, ALL_BADGES } from './data/questions';
import Scratchpad from './components/Scratchpad';
import ExplanationText from './components/ExplanationText';

export default function App() {
  // Current active subject and topic
  const [selectedSubject, setSelectedSubject] = useState<Subject>(SUBJECTS[0]);
  const [selectedTopic, setSelectedTopic] = useState<string>('Bütün Mövzular');
  
  // Quiz states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState<{ [key: string]: boolean }>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState<boolean>(false);
  
  // AI states
  const [currentExplanation, setCurrentExplanation] = useState<string>('');
  const [isExplainingLoading, setIsExplainingLoading] = useState<boolean>(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [aiGenerateCount, setAiGenerateCount] = useState<number>(3);
  
  // Live Chat with AI Tutor States
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Salam! Mən sənin 6-cı sinif Bilik Dostunam 🦊. Bu gün riyaziyyat məsələlərini, dərslikdəki çətin bölmələri, ƏBOB/EKOB-u və ya digər sualları birlikdə həll edə bilərik! Sol tərəfdən fənn seç, testləri cavablandır, başa düşmədiyin yer olanda isə mənə yaz!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userQuery, setUserQuery] = useState<string>('');
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  
  // Interactive UI panels
  const [showScratchpad, setShowScratchpad] = useState<boolean>(true);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [showBadgeNotification, setShowBadgeNotification] = useState<Badge | null>(null);
  const [stats, setStats] = useState<UserStats>({
    points: 10,
    xp: 20,
    level: 1,
    badges: [],
    completedQuizzesCount: 0,
    subjectProgress: {
      math: { solved: 0, correct: 0 },
      lang: { solved: 0, correct: 0 },
      science: { solved: 0, correct: 0 },
      history: { solved: 0, correct: 0 }
    }
  });

  // Chat window automatic scroll
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load questions when subject or topic changes
  useEffect(() => {
    resetQuizState();
  }, [selectedSubject, selectedTopic]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Load preset questions initially or when selecting topic
  const resetQuizState = () => {
    let filtered = PRESET_QUESTIONS.filter(q => q.subject === selectedSubject.id);
    if (selectedTopic !== 'Bütün Mövzular') {
      filtered = filtered.filter(q => q.topic === selectedTopic);
    }
    
    // Sort so preset is always there or shuffle slightly
    setQuestions(filtered);
    setCurrentIdx(0);
    setAnswers({});
    setSubmitted({});
    setIsQuizCompleted(false);
    setCurrentExplanation('');
  };

  // Handle Option selection
  const selectOption = (questionId: string, optionIndex: number) => {
    if (submitted[questionId]) return; // locked already
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit Answer & Update Stats
  const submitAnswer = (q: Question) => {
    const chosen = answers[q.id];
    if (chosen === undefined || submitted[q.id]) return;

    setSubmitted(prev => ({ ...prev, [q.id]: true }));
    const isCorrect = chosen === q.correctIndex;

    // Update stats and progress
    const xpEarned = isCorrect ? 15 : 5;
    const pointsEarned = isCorrect ? 5 : 1;

    setStats(prev => {
      const subjectProg = prev.subjectProgress[selectedSubject.id] || { solved: 0, correct: 0 };
      const newSolved = subjectProg.solved + 1;
      const newCorrect = subjectProg.correct + (isCorrect ? 1 : 0);
      
      const newXp = prev.xp + xpEarned;
      const newLevel = Math.floor(newXp / 100) + 1;

      // Unlocks badge logic
      let potentialBadges = [...prev.badges];
      
      return {
        ...prev,
        xp: newXp,
        points: prev.points + pointsEarned,
        level: newLevel > prev.level ? newLevel : prev.level,
        subjectProgress: {
          ...prev.subjectProgress,
          [selectedSubject.id]: { solved: newSolved, correct: newCorrect }
        }
      };
    });

    // Check for specific badges
    triggerBadgeCheck(isCorrect);

    // Automatically prompt AI Köməkçi in chat if they make a mistake to suggest help
    if (!isCorrect) {
      setTimeout(() => {
        addTutorSystemPrompt(q, chosen);
      }, 500);
    }
  };

  const triggerBadgeCheck = (isLastCorrect: boolean) => {
    if (unlockedBadges.length === 0) {
      unlockBadge('first_quiz');
    }
    if (isLastCorrect && selectedSubject.id === 'math') {
      const solvedCount = (stats.subjectProgress.math?.correct || 0) + 1;
      if (solvedCount >= 3) {
        unlockBadge('math_champion');
      }
    }
  };

  const unlockBadge = (badgeId: string) => {
    if (unlockedBadges.includes(badgeId)) return;
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    if (badge) {
      setUnlockedBadges(prev => [...prev, badgeId]);
      setShowBadgeNotification(badge);
      setStats(prev => ({
        ...prev,
        badges: [...prev.badges, badge]
      }));
      // Auto close badge alert after 4 seconds
      setTimeout(() => {
        setShowBadgeNotification(null);
      }, 5000);
    }
  };

  // Add contextual hint or message from AI in chat automatically
  const addTutorSystemPrompt = (q: Question, chosenIndex: number) => {
    const tutorMsg: ChatMessage = {
      id: `sys_hint_${Date.now()}`,
      sender: 'assistant',
      text: `Görürəm "${q.question}" sualında bir qədər çətinlik çəkdin. Sən "${q.options[chosenIndex]}" variantını seçdin, lakin düzgün cavab "${q.options[q.correctIndex]}" olmalı idi. İzahını bir yerdə oxuyaq və ya bu barədə sualını bura yaz, sənə çox asan dildə başa salım! ✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      questionContext: {
        questionText: q.question,
        submittedAnswer: q.options[chosenIndex],
        correctAnswer: q.options[q.correctIndex]
      }
    };
    setMessages(prev => [...prev, tutorMsg]);
  };

  // Call the robust step-by-step explain endpoint (/api/explain)
  const explainQuestion = async (q: Question) => {
    if (isExplainingLoading) return;
    setIsExplainingLoading(true);
    setCurrentExplanation('');

    const chosen = answers[q.id];

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          chosenIndex: chosen,
          subject: selectedSubject.name,
          topic: q.topic
        })
      });

      if (!res.ok) throw new Error("Şəbəkə xətası baş verdi.");
      const data = await res.json();
      setCurrentExplanation(data.explanation);

      // Award "Learning Enthusiasm" badge if explanatory clicked
      unlockBadge('explainer_master');
    } catch (error: any) {
      console.error(error);
      setCurrentExplanation("Üzr daxil, hazırda Süni İntellekt izah motoru ilə bağlantı qurmaq mümkün olmadı. Əlavə izah üçün sağdakı Bilik Dostundan soruşa bilərsən!");
    } finally {
      setIsExplainingLoading(false);
    }
  };

  // Call the Dynamic question generator endpoint
  const generateDynamicQuestions = async () => {
    if (isGeneratingQuestions) return;
    setIsGeneratingQuestions(true);
    setCurrentExplanation('');

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subjectId: selectedSubject.id,
          topic: selectedTopic === 'Bütün Mövzular' ? selectedSubject.topics[1] || 'Ümumi' : selectedTopic,
          count: aiGenerateCount
        })
      });

      if (!res.ok) throw new Error("Sualları çəkmək mümkün olmadı");
      const data = await res.json();

      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIdx(0);
        setAnswers({});
        setSubmitted({});
        setIsQuizCompleted(false);

        // Add encouraging notice to chat
        setMessages(prev => [
          ...prev,
          {
            id: `gen_notice_${Date.now()}`,
            sender: 'assistant',
            text: `Əla! Süni İntellekt köməyi ilə sənin üçün "${selectedTopic}" mövzusunda ${data.questions.length} tamamilə yeni səviyyəli test hazırladım! Sual vərəqini həll etməyə gəl başlayaq. Uğurlar! 🚀`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (e) {
      console.error("error generating", e);
      alert("Süni İntellekt vasitəsilə test yaradıla bilmədi. İnternet əlaqəsini kontrol edin və yenidən cəhd edin.");
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Send interactive custom questions to active chatbot tutor
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userQuery.trim() || isChatLoading) return;

    const textToSend = userQuery;
    setUserQuery('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Calculate current question context in case they ask about it
    const activeQ = questions[currentIdx];
    const userChosen = activeQ ? answers[activeQ.id] : undefined;
    const context = activeQ ? {
      questionText: activeQ.question,
      submittedAnswer: userChosen !== undefined ? activeQ.options[userChosen] : undefined,
      correctAnswer: activeQ.options[activeQ.correctIndex]
    } : undefined;

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/ask-tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: newMessages.slice(-8), // send last 8 messages for memory context
          context
        })
      });

      if (!res.ok) throw new Error("Cavab alınmadı");

      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          id: `assistant_${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "Bağışla, hazırda serverdən cavab ala bilmədim. Amma sən müstəqil olaraq testlərə davam edə bilərsən!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Current Active Question helper
  const activeQuestion = questions[currentIdx];
  const totalCorrectInSession = Object.keys(submitted).filter(qid => {
    const q = questions.find(item => item.id === qid);
    return q && answers[qid] === q.correctIndex;
  }).length;

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-[#4A443F] flex flex-col selection:bg-[#CB997E]/30 selection:text-[#4A443F]" id="root-portal-app">
      
      {/* BADGE POPUP NOTIFICATION */}
      {showBadgeNotification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm bg-white border-2 border-[#E8E2D2] p-5 rounded-2xl shadow-xl flex gap-4 items-center animate-bounce duration-500" id="badge-unlocked-toast">
          <div className="w-12 h-12 rounded-full bg-[#E8E2D2] flex items-center justify-center text-3xl">
            🏆
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#8C927D] uppercase tracking-wider">Unikal Medal Qazanıldı!</div>
            <div className="text-sm font-bold text-[#4A443F]">{showBadgeNotification.title}</div>
            <div className="text-xs text-[#A0968A] mt-0.5">{showBadgeNotification.description}</div>
          </div>
        </div>
      )}

      {/* TOP HEADER STATUS BAR */}
      <header className="h-16 border-b border-[#E8E2D2] flex items-center justify-between px-6 bg-white/70 backdrop-blur-md sticky top-0 z-30" id="portal-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#8C927D] rounded-xl flex items-center justify-center text-white font-black text-lg">6</div>
          <div>
            <h1 className="text-sm font-bold leading-none text-[#4A443F]">6-cı Sinif Dərs-Dostu</h1>
            <span className="text-[10px] text-[#A0968A] font-medium">Azərbaycan Respublikası Dərsliklərinə Tam Uyğun Portal</span>
          </div>
        </div>

        {/* Gamification Bar */}
        <div className="flex items-center gap-6" id="gamification-status">
          <div className="hidden sm:flex items-center gap-2 bg-[#F5F2EA] px-3 py-1.5 rounded-xl border border-[#E8E2D2]">
            <Award className="text-[#CB997E]" size={16} />
            <span className="text-xs font-bold text-[#4A443F]">Səviyyə {stats.level}</span>
            <div className="w-16 h-2 bg-[#E8E2D2] rounded-full overflow-hidden ml-1">
              <div 
                className="h-full bg-[#8C927D] transition-all duration-300"
                style={{ width: `${stats.xp % 100}%` }}
              />
            </div>
            <span className="text-[9px] font-mono text-[#A0968A]">{stats.xp} XP</span>
          </div>

          <div className="flex items-center gap-1 bg-[#F5F2EA] px-3 py-1.5 rounded-xl border border-[#E8E2D2]">
            <Sparkles className="text-yellow-500 fill-yellow-400" size={14} />
            <span className="text-xs font-bold text-[#4A443F]">{stats.points} Xal</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-[#4A443F]">Şagird Rejimi</div>
              <div className="text-[10px] text-[#A0968A] italic">VI Sinif • Kurikulum 2026</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#D9AE8E] border-2 border-white flex items-center justify-center text-white font-bold shadow-sm">
              VI
            </div>
          </div>
        </div>
      </header>

      {/* CORE PORTAL LAYOUT */}
      <div className="flex-grow flex flex-col lg:flex-row" id="main-portal-body">
        
        {/* SIDEBAR: SUBJECTS & TOPICS */}
        <aside className="w-full lg:w-72 bg-[#F5F2EA] lg:border-r border-[#E8E2D2] p-5 flex flex-col gap-4 shrink-0" id="portal-sidebar">
          
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#A0968A] font-bold mb-2.5 px-1">FƏNLƏR ÜZRƏ SINAQLAR</div>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2" id="subjects-container">
              {SUBJECTS.map((sub) => {
                const isSelected = selectedSubject.id === sub.id;
                let subIcon = <BookOpen size={16} />;
                if (sub.id === 'math') subIcon = <Calculator size={16} />;
                if (sub.id === 'science') subIcon = <Atom size={16} />;
                if (sub.id === 'history') subIcon = <Compass size={16} />;

                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubject(sub);
                      setSelectedTopic('Bütün Mövzular');
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all font-medium text-xs flex items-center gap-3 border ${
                      isSelected 
                        ? 'bg-[#8C927D] text-white border-[#8C927D] shadow-md shadow-[#8C927D]/20' 
                        : 'bg-white hover:bg-[#E8E2D2]/50 text-[#4A443F] border-[#E8E2D2]'
                    }`}
                    id={`sub-select-${sub.id}`}
                  >
                    <span className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                      {subIcon}
                    </span>
                    <span className="truncate">{sub.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DƏRSLİK KİTAB LINKLƏRİ - Reference requirement */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D2] flex flex-col gap-2" id="trims-references">
            <div className="text-[10px] font-bold text-[#8C927D] uppercase tracking-wider flex items-center gap-1.5">
              <Info size={12} />
              Trims.edu.az Riyaziyyat dərslikləri
            </div>
            <p className="text-[10px] text-[#A0968A] leading-relaxed">
              Bu tətbiqdəki suallar birbaşa Təhsil Portalının rəsmi 6-cı sinif PDF dərsliklərinə tam uyğun dərəcələndirilmişdir:
            </p>
            <div className="grid grid-cols-1 gap-1.5 text-[10px] font-medium" id="pdf-links">
              <a 
                href="https://www.trims.edu.az/noduploads/book/quot-riyaziyyat-quot-fanni-uzra-6-ci-sinif-ucun-darslik-1-ci-hissa-1758003051-837.pdf" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between text-[#CB997E] hover:underline p-1.5 bg-[#FDFCF8] rounded border border-dashed border-[#E8E2D2]"
              >
                <span>Riyaziyyat (1-ci hissə)</span>
                <ExternalLink size={10} />
              </a>
              <a 
                href="https://www.trims.edu.az/noduploads/book/quot-riyaziyyat-quot-fanni-uzra-6-ci-sinif-ucun-darslik-2-ci-hissa-1758003258-217.pdf" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between text-[#CB997E] hover:underline p-1.5 bg-[#FDFCF8] rounded border border-dashed border-[#E8E2D2]"
              >
                <span>Riyaziyyat (2-ci hissə)</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* TOPICS ACCORDION SECTION */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[#A0968A] font-bold mb-2.5 px-1">MÖVZULAR</div>
            <div className="flex flex-col gap-1 max-h-[160px] lg:max-h-none overflow-y-auto pr-1" id="topics-list">
              {selectedSubject.topics.map((top) => {
                const isSelected = selectedTopic === top;
                return (
                  <button
                    key={top}
                    onClick={() => setSelectedTopic(top)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#E8E2D2] text-[#4A443F] font-semibold' 
                        : 'hover:bg-[#E8E2D2]/30 text-[#4A443F]'
                    }`}
                    id={`topic-item-${top.replace(/\s+/g, '-')}`}
                  >
                    <span className="truncate">{top}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#8C927D]"></span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI TEST GENERATOR CARD */}
          <div className="mt-auto bg-gradient-to-br from-[#8C927D]/10 to-[#CB997E]/15 p-4 rounded-2xl border-2 border-[#8C927D]/20 flex flex-col gap-3" id="ai-generator-widget">
            <div>
              <div className="text-[10px] font-bold text-[#8C927D] uppercase tracking-wider">AĞILLI SÜNİ İNTELLEKT</div>
              <h4 className="text-xs font-extrabold text-[#4A443F] mt-1 leading-tight">Mövzu üzrə Yeni Testlər Yarat!</h4>
              <p className="text-[10px] text-[#A0968A] mt-1">Dərslik mövzularına uyğun tam yeni sualları AI bizim üçün hazırlasın.</p>
            </div>

            <div className="flex gap-2 items-center justify-between bg-white/70 p-1 rounded-lg border border-[#E8E2D2]">
              <span className="text-[10px] font-medium text-[#4A443F] pl-2">Sual sayı:</span>
              <div className="flex gap-1">
                {[3, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setAiGenerateCount(num)}
                    className={`w-7 h-6 rounded text-[10px] font-bold transition-all ${
                      aiGenerateCount === num ? 'bg-[#8C927D] text-white' : 'hover:bg-slate-200 text-[#4A443F]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateDynamicQuestions}
              disabled={isGeneratingQuestions}
              className="w-full py-2.5 px-3 bg-[#CB997E] hover:bg-[#b07d62] text-white text-xs font-bold rounded-xl shadow-md shadow-[#CB997E]/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              id="ai-generate-btn"
            >
              {isGeneratingQuestions ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Hazırlanır...</span>
                </>
              ) : (
                <>
                  <Dices size={14} />
                  <span>Süni İntellekt Testləri Yarat</span>
                </>
              )}
            </button>
          </div>

        </aside>

        {/* MIDDLE SECTION: MAIN QUIZ INTERFACE & SCRATCHPAD */}
        <main className="flex-grow p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-4xl mx-auto w-full overflow-y-auto" id="portal-main">
          
          {/* SUBJECT BANNER */}
          <div className="bg-gradient-to-r from-[#F5F2EA] to-white border border-[#E8E2D2] rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm" id="subject-banner">
            <div>
              <div className="text-[10px] font-bold text-[#8C927D] uppercase tracking-widest">{selectedSubject.name}</div>
              <h2 className="text-base font-bold text-[#4A443F] mt-0.5">{selectedTopic}</h2>
              <p className="text-xs text-[#A0968A] mt-1 max-w-2xl">{selectedSubject.description}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={resetQuizState}
                className="p-2 bg-white hover:bg-[#F5F2EA] rounded-xl border border-[#E8E2D2] text-xs text-[#4A443F] font-semibold flex items-center gap-1.5 transition-colors"
                title="Sınağı yenilə"
                id="reset-quiz-btn"
              >
                <RotateCcw size={14} />
                <span>Yenidən Başla</span>
              </button>
            </div>
          </div>

          {/* ACTIVE QUIZ PORTAL CARD */}
          {questions.length > 0 ? (
            <div className="bg-white border-2 border-[#E8E2D2] rounded-2xl overflow-hidden shadow-sm flex flex-col" id="active-quiz-panel">
              
              {/* QUIZ PANEL HEADER */}
              <div className="bg-[#F5F2EA] px-5 py-3.5 border-b border-[#E8E2D2] flex justify-between items-center" id="quiz-panel-header">
                <span className="text-xs font-extrabold text-[#8C927D] uppercase tracking-wider">
                  SUAL {currentIdx + 1} / {questions.length} 
                  {questions[currentIdx]?.isAiGenerated && (
                    <span className="ml-2 px-2 py-0.5 bg-[#CB997E]/20 text-[#CB997E] text-[9px] font-bold rounded-full border border-[#CB997E]/30">AI Hazırladı</span>
                  )}
                </span>
                
                {/* Dots indicator */}
                <div className="flex gap-1">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      disabled={false}
                      onClick={() => {
                        setCurrentIdx(i);
                        setCurrentExplanation('');
                      }}
                      className={`w-6 h-6 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                        currentIdx === i
                          ? 'bg-[#8C927D] text-white'
                          : submitted[questions[i].id]
                            ? answers[questions[i].id] === questions[i].correctIndex
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                            : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                      id={`page-dot-${i}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {/* QUIZ CARD BODY */}
              <div className="p-6 md:p-8 flex-grow flex flex-col gap-6" id="quiz-card-body">
                
                {/* The Question Text */}
                <div>
                  <span className="text-[10px] text-[#A0968A] font-bold uppercase tracking-wide">Mövzu: {activeQuestion.topic}</span>
                  <h3 className="text-lg md:text-xl font-bold text-[#4A443F] mt-1.5 leading-relaxed" id="question-text">
                    {activeQuestion.question}
                  </h3>
                </div>

                {/* Vertical Choices Options */}
                <div className="grid grid-cols-1 gap-3" id="quiz-options-group">
                  {activeQuestion.options.map((opt, oIdx) => {
                    const optionLetters = ['A', 'B', 'C', 'D'];
                    const isSelected = answers[activeQuestion.id] === oIdx;
                    const isQSubmitted = submitted[activeQuestion.id];
                    const isCorrect = activeQuestion.correctIndex === oIdx;
                    
                    let buttonStyle = 'border-[#E8E2D2] hover:border-[#8C927D] bg-white';
                    let letterStyle = 'bg-[#F5F2EA] text-[#8C927D]';

                    if (isSelected && !isQSubmitted) {
                      buttonStyle = 'border-[#8C927D] bg-[#FDFCF8] ring-2 ring-[#8C927D]/25';
                      letterStyle = 'bg-[#8C927D] text-white';
                    } else if (isQSubmitted) {
                      if (isCorrect) {
                        buttonStyle = 'border-emerald-500 bg-emerald-50/70 text-emerald-900';
                        letterStyle = 'bg-emerald-500 text-white';
                      } else if (isSelected) {
                        buttonStyle = 'border-rose-400 bg-rose-50 text-rose-900';
                        letterStyle = 'bg-rose-500 text-white';
                      } else {
                        buttonStyle = 'border-[#E8E2D2] opacity-70 bg-white';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => selectOption(activeQuestion.id, oIdx)}
                        disabled={isQSubmitted}
                        className={`flex items-center justify-between p-4 border-2 rounded-xl transition-all text-left ${buttonStyle}`}
                        id={`opt-btn-${oIdx}`}
                      >
                        <span className="flex items-center gap-4">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm ${letterStyle}`}>
                            {optionLetters[oIdx]}
                          </span>
                          <span className="text-sm font-medium">{opt}</span>
                        </span>
                        
                        {isQSubmitted && isCorrect && (
                          <span className="text-emerald-600 flex items-center gap-1 text-xs font-bold shrink-0">
                            <CheckCircle2 size={16} />
                            <span>Düzgün</span>
                          </span>
                        )}
                        {isQSubmitted && isSelected && !isCorrect && (
                          <span className="text-rose-500 flex items-center gap-1 text-xs font-bold shrink-0">
                            <XCircle size={16} />
                            <span>Səhv</span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit and Helper Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-100" id="quiz-controls">
                  
                  {/* Lock in solution */}
                  <button
                    onClick={() => submitAnswer(activeQuestion)}
                    disabled={answers[activeQuestion.id] === undefined || submitted[activeQuestion.id]}
                    className="px-6 py-3 bg-[#8C927D] disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#767b6a] transition-all"
                    id="confirm-btn"
                  >
                    Cavabı təsdiqlə
                  </button>

                  {/* Ask AI to explain this question */}
                  <button
                    onClick={() => explainQuestion(activeQuestion)}
                    className="px-5 py-3 bg-white hover:bg-[#F5F2EA] border-2 border-[#E8E2D2] text-[#4A443F] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                    id="explain-to-me-btn"
                  >
                    <Lightbulb className="text-amber-500 fill-amber-300 animate-pulse" size={15} />
                    <span>Mənə asan dildə izah et 💡</span>
                  </button>

                  {/* Next question routing */}
                  {currentIdx < questions.length - 1 ? (
                    <button
                      onClick={() => {
                        setCurrentIdx(prev => prev + 1);
                        setCurrentExplanation('');
                      }}
                      className="px-5 py-3 ml-auto bg-[#F5F2EA] hover:bg-[#E8E2D2] text-[#4A443F] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-[#E8E2D2]"
                      id="next-question-btn"
                    >
                      <span>Növbəti mərhələ</span>
                      <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsQuizCompleted(true)}
                      disabled={Object.keys(submitted).length < questions.length}
                      className="px-5 py-3 ml-auto bg-[#CB997E] hover:bg-[#b07d62] text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-40"
                      id="finish-session-btn"
                    >
                      Sınağı Sonlandır 🎉
                    </button>
                  )}
                </div>

              </div>

              {/* DYNAMIC DETAILED ADAPTIVE EXPLANATION CONTAINER */}
              {(currentExplanation || isExplainingLoading) && (
                <div className="border-t-2 border-[#E8E2D2] bg-[#FDFCF8] p-6 lg:p-8" id="ai-explanation-drawer">
                  <div className="flex items-center gap-2.5 mb-4 pb-2 border-b border-[#E8E2D2]/60 bg-[#F5F2EA]/50 p-2 rounded-xl">
                    <span className="text-xl">💡</span>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#4A443F]">Süni İntellekt Dərs İzahı</h4>
                      <p className="text-[10px] text-[#A0968A]">Bilik Dostundan təfsilatlı vizual addım-addım həll düsturu</p>
                    </div>
                  </div>

                  {isExplainingLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-4 border-[#8C927D]/40 border-t-[#8C927D] rounded-full animate-spin" />
                      <p className="text-xs italic text-[#A0968A]">Mehriban müəllim izahı hazırlayır, səbrli ol...</p>
                    </div>
                  ) : (
                    <div className="prose max-w-none">
                      <ExplanationText text={currentExplanation} />
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border-2 border-[#E8E2D2] rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 shadow-sm" id="empty-state-quiz">
              <span className="text-5xl">🎒</span>
              <h3 className="text-lg font-bold text-[#4A443F]">Bu mövzu üzrə daxili sual tapılmadı</h3>
              <p className="text-xs text-[#A0968A] max-w-md">
                Amma heç narahat olma! Aşağıdakı düyməyə sıxaraq Süni İntellektin dərhal dərslik əsasında mükəmməl suallar hazırlamasını təmin edə bilərsən!
              </p>
              <button
                onClick={generateDynamicQuestions}
                disabled={isGeneratingQuestions}
                className="py-3 px-6 bg-[#8C927D] hover:bg-[#767b6a] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-colors"
                id="empty-ai-generate-btn"
              >
                <Dices size={15} />
                <span>AI Mövzu Sualları Yarat</span>
              </button>
            </div>
          )}

          {/* RESULTS CARD IF SESSION IS COMPLETED */}
          {isQuizCompleted && (
            <div className="bg-amber-50/50 border-2 border-[#CB997E]/30 rounded-2xl p-6 md:p-8 flex flex-col gap-5 shadow-sm" id="results-panel">
              <div className="flex gap-4 items-center">
                <span className="text-4xl">🏆</span>
                <div>
                  <h3 className="text-base font-extrabold text-[#4A443F]">Təbrik edirik! Sınağı tamamladın.</h3>
                  <p className="text-xs text-[#A0968A]">Göstərdiyin nəticələr sənin üçün yadda saxlanıldı.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" id="results-dashboard-stats">
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D2] text-center">
                  <div className="text-[10px] text-[#A0968A] font-bold uppercase">Sual sayı</div>
                  <div className="text-lg font-bold text-[#4A443F] mt-1">{questions.length}</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D2] text-center">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase">Düzgün</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">{totalCorrectInSession}</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D2] text-center">
                  <div className="text-[10px] font-bold text-rose-500 uppercase">Səhv</div>
                  <div className="text-lg font-bold text-rose-500 mt-1">{questions.length - totalCorrectInSession}</div>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#E8E2D2] text-center">
                  <div className="text-[10px] font-bold text-[#CB997E] uppercase">Uğur Nisbəti</div>
                  <div className="text-lg font-bold text-[#CB997E] mt-1">
                    {Math.round((totalCorrectInSession / questions.length) * 100) || 0}%
                  </div>
                </div>
              </div>

              {totalCorrectInSession === questions.length && (
                <div className="bg-white p-3.5 rounded-xl border-l-4 border-amber-400 text-xs italic text-[#4A443F] flex gap-2 items-center">
                  <Sparkles className="text-amber-500" size={16} />
                  <span>Möhtəşəm! Sən bütün sualları mükəmməl düzgün həll etdiyin üçün xüsusi <strong>"Mükəmməl Nəticə"</strong> medalına layiq görüldün!</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={resetQuizState}
                  className="px-5 py-3 bg-[#8C927D] hover:bg-[#767b6a] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                  id="results-retry-btn"
                >
                  <RotateCcw size={14} />
                  <span>Sınağı Yenidən Başla</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedTopic('Bütün Mövzular');
                    resetQuizState();
                  }}
                  className="px-5 py-3 bg-white hover:bg-slate-100 border-2 border-[#E8E2D2] text-slate-700 font-bold text-xs rounded-xl transition-colors"
                  id="results-more-subjects"
                >
                  Digər Mövzulara Keç
                </button>
              </div>
            </div>
          )}

          {/* DYNAMIC SCRATCHPAD WRITING TOOL */}
          <div className="flex flex-col gap-2" id="drafting-canvas-section">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-[#8C927D] uppercase tracking-wider flex items-center gap-1.5">
                <PenLine size={13} strokeWidth={2.5} />
                HƏLLÜMÜZ ÜÇÜN RİYAZİ QARALAMA DƏFTƏRİ
              </span>
              <button
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="text-xs font-bold text-[#CB997E] hover:underline"
                id="toggle-scratchpad-btn"
              >
                {showScratchpad ? 'Yazı Lövhəsini Gizlə' : 'Yazı Lövhəsini Aç'}
              </button>
            </div>
            
            {showScratchpad && (
              <Scratchpad onUseBadge={() => unlockBadge('canvas_artist')} />
            )}
          </div>

        </main>

        {/* RIGHT SIDEBAR: CHAT HELPER PINNED "BİLİK DOSTU" */}
        <aside className="w-full lg:w-80 bg-white lg:border-l border-[#E8E2D2] flex flex-col shrink-0 h-[600px] lg:h-auto" id="tutor-chat-panel">
          
          <div className="p-4 border-b border-[#E8E2D2] bg-[#FDFCF8] flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-full flex items-center justify-center text-xl shadow-inner">
              🦊
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#4A443F]">Sual-Cavab Bilik Dostu</h3>
              <p className="text-[9px] text-[#A0968A]">Süni İntellekt Dərs və Mövzu köməkçisi</p>
            </div>
            <div className="ml-auto bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span>
              Aktiv
            </div>
          </div>

          {/* Chat Messages flow */}
          <div className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50/50" id="chat-messages-container">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2 flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
                id={`chat-bubble-${msg.id}`}
              >
                <div 
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-[#8C927D] text-white rounded-br-none shadow-sm' 
                      : 'bg-white text-[#4A443F] border border-[#E8E2D2] rounded-bl-none shadow-sm'
                  }`}
                >
                  {/* Context preview in message bubble, if any */}
                  {msg.questionContext && (
                    <div className="mb-2 pb-1.5 border-b border-[#E8E2D2]/60 text-[10px] font-medium text-slate-500 max-w-xs break-all truncate">
                      📌 Sual: "{msg.questionContext.questionText}"
                    </div>
                  )}
                  
                  {/* Render paragraphs or preformatted elements safely */}
                  <div className="whitespace-pre-line font-medium">{msg.text}</div>
                </div>
                <span className="text-[8px] font-medium text-[#A0968A] px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-2 mr-auto items-start max-w-[80%]">
                <div className="bg-white p-3 rounded-2xl border border-[#E8E2D2] text-xs text-slate-500 rounded-bl-none shadow-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="block w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                  </div>
                  <span className="italic">Bilik Dostu düşünür...</span>
                </div>
              </div>
            )}
            
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Helper micro inputs */}
          <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-1.5 justify-start" id="quick-chat-prompts">
            <span className="text-[9px] text-[#A0968A] w-full mb-1">Tez cavab üçün kliklə:</span>
            {[
              'Bunu mənə asan dildə dərhal izah et.',
              'ƏBOB-u tapmaq prinsipini izah et.',
              'Kəsrlərin bölünməsini öyrət.'
            ].map((pStr, i) => (
              <button
                key={i}
                onClick={() => {
                  setUserQuery(pStr);
                }}
                className="text-[9px] font-bold text-[#CB997E] bg-[#CB997E]/10 hover:bg-[#CB997E]/15 px-2 py-1 rounded-full border border-[#CB997E]/15 transition-all text-left truncate max-w-full"
              >
                {pStr}
              </button>
            ))}
          </div>

          {/* Input Chat form */}
          <div className="p-4 border-t border-[#E8E2D2] bg-[#FDFCF8]" id="chat-input-form-wrapper">
            <form onSubmit={sendChatMessage} className="relative">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Nəyi başa düşmədin? Məndən soruş..." 
                className="w-full pl-3 pr-10 py-3 bg-white border border-[#E8E2D2] rounded-xl text-xs outline-none focus:border-[#8C927D] text-[#4A443F]"
                id="chat-user-input"
              />
              <button 
                type="submit"
                disabled={!userQuery.trim() || isChatLoading}
                className="absolute right-2.5 top-2.5 text-[#8C927D] hover:scale-110 disabled:opacity-30 transition-transform cursor-pointer font-bold text-sm"
                id="chat-send-btn"
              >
                🚀
              </button>
            </form>
          </div>

        </aside>

      </div>

      {/* COMPACT FOOTER */}
      <footer className="bg-[#F5F2EA] border-t border-[#E8E2D2] py-4 px-6 flex flex-wrap gap-4 items-center justify-between text-[10px] text-[#A0968A] mt-auto font-medium" id="portal-footer">
        <div>
          © 2026 VI Sinif Tədris və Öyrənmə Köməkçisi. Metodik vəsaitlər daxilində hazırlanmışdır.
        </div>
        <div className="flex gap-4">
          <a href="https://www.trims.edu.az" target="_blank" rel="noreferrer" className="hover:underline text-[#8C927D]">Trims.edu.az Portal</a>
          <span>•</span>
          <span className="text-[#4A443F]">Süni İntellekt (Gemini 3.5) Dəstəklidir</span>
        </div>
      </footer>

    </div>
  );
}
