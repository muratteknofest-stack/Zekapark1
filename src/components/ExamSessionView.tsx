import React, { useState, useEffect, useRef } from 'react';
import { BaseQuestion, ExamResult, CognitiveCategory, DifficultyLevel } from '../types';
import { generateQuestion } from '../features/questions/generators';
import { QuestionRenderer } from '../features/questions/renderers/QuestionRenderer';
import { OptionRenderer } from '../features/questions/renderers/OptionRenderer';
import { VisualCountdownTimer } from './VisualCountdownTimer';
import { dataService } from '../services/data-service';
import { sound } from '../lib/sound';
import {
  Trophy,
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Home,
  RotateCcw,
  Sparkles,
  BarChart3,
  Award,
  Timer,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExamSessionViewProps {
  onNavigateHome: () => void;
}

const TOTAL_QUESTIONS = 15;

export const ExamSessionView: React.FC<ExamSessionViewProps> = ({ onNavigateHome }) => {
  const [inExam, setInExam] = useState(false);
  const [questions, setQuestions] = useState<BaseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  // Duration & Strict Mode settings
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [isStrictMode, setIsStrictMode] = useState<boolean>(true);

  // Timer & pacing state
  const [totalSeconds, setTotalSeconds] = useState<number>(20 * 60);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(20 * 60);
  const [overtimeSeconds, setOvertimeSeconds] = useState<number>(0);
  const [endedByTimeout, setEndedByTimeout] = useState<boolean>(false);

  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const timerRef = useRef<any>(null);

  // Check if an active exam was stored in LocalStorage
  useEffect(() => {
    const saved = dataService.getActiveExam();
    if (saved && saved.status === 'in_progress' && saved.questions?.length > 0) {
      setQuestions(saved.questions);
      setCurrentIndex(saved.currentIndex || 0);
      setAnswers(saved.answers || {});
      setFlags(saved.flags || {});
      const total = saved.totalSeconds || 20 * 60;
      setTotalSeconds(total);
      setRemainingSeconds(saved.remainingSeconds !== undefined ? saved.remainingSeconds : total);
      setInExam(true);
    }
  }, []);

  // Autosave active exam on state change
  useEffect(() => {
    if (inExam && !examResult && questions.length > 0) {
      dataService.saveActiveExam({
        status: 'in_progress',
        questions,
        currentIndex,
        answers,
        flags,
        totalSeconds,
        remainingSeconds,
      });
    }
  }, [inExam, examResult, questions, currentIndex, answers, flags, totalSeconds, remainingSeconds]);

  // Countdown timer with Strict Mode support
  useEffect(() => {
    if (inExam && !examResult) {
      timerRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            if (isStrictMode) {
              clearInterval(timerRef.current);
              finishExam(true);
              return 0;
            } else {
              setOvertimeSeconds((ot) => ot + 1);
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [inExam, examResult, isStrictMode]);

  const startNewExam = () => {
    sound.playClick();
    const categories: CognitiveCategory[] = [
      'pattern',
      'matrix',
      'spatial',
      'logic',
      'attention',
      'visual_perception',
      'numerical',
      'memory',
    ];

    const qList: BaseQuestion[] = [];
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      const cat = categories[i % categories.length];
      const diff = Math.min(6, Math.floor(i / 3) + 2) as DifficultyLevel;
      const q = generateQuestion({
        category: cat,
        difficulty: diff,
        seed: 700000 + i * 997,
      });
      qList.push(q);
    }

    const initialSecs = durationMinutes * 60;
    setTotalSeconds(initialSecs);
    setRemainingSeconds(initialSecs);
    setOvertimeSeconds(0);
    setEndedByTimeout(false);
    setQuestions(qList);
    setCurrentIndex(0);
    setAnswers({});
    setFlags({});
    setExamResult(null);
    setShowFinishConfirm(false);
    setInExam(true);
  };

  const handleSelectOption = (optId: string) => {
    const q = questions[currentIndex];
    if (!q) return;
    sound.playClick();
    setAnswers((prev) => ({
      ...prev,
      [q.id]: optId,
    }));
  };

  const toggleFlag = () => {
    const q = questions[currentIndex];
    if (!q) return;
    sound.playClick();
    setFlags((prev) => ({
      ...prev,
      [q.id]: !prev[q.id],
    }));
  };

  const finishExam = (timeoutTriggered = false) => {
    sound.playLevelUp();
    dataService.clearActiveExam();

    if (timeoutTriggered) {
      setEndedByTimeout(true);
    }

    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;

    const breakdown: Record<CognitiveCategory, { total: number; correct: number }> = {
      visual_perception: { total: 0, correct: 0 },
      pattern: { total: 0, correct: 0 },
      matrix: { total: 0, correct: 0 },
      spatial: { total: 0, correct: 0 },
      logic: { total: 0, correct: 0 },
      attention: { total: 0, correct: 0 },
      memory: { total: 0, correct: 0 },
      numerical: { total: 0, correct: 0 },
    };

    questions.forEach((q) => {
      const userChoice = answers[q.id];
      const cat = q.category;
      if (!breakdown[cat]) breakdown[cat] = { total: 0, correct: 0 };
      breakdown[cat].total += 1;

      if (!userChoice) {
        blankCount += 1;
      } else if (userChoice === q.correctOptionId) {
        correctCount += 1;
        breakdown[cat].correct += 1;
        dataService.updateSkillMastery(cat, true, q.difficulty);
      } else {
        wrongCount += 1;
        dataService.addMistake(q);
        dataService.updateSkillMastery(cat, false, q.difficulty);
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);
    const xpReward = correctCount * 15 + 50; // Exam completion bonus
    dataService.addXP(xpReward);
    dataService.recordPracticeSession(Math.max(5, Math.round((totalSeconds - remainingSeconds + overtimeSeconds) / 60)));

    const result: ExamResult = {
      examId: `exam-${Date.now()}`,
      title: `${durationMinutes} Dk. BİLSEM Deneme Sınavı`,
      date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      blankAnswers: blankCount,
      scorePercentage,
      totalTimeSeconds: Math.max(1, totalSeconds - remainingSeconds + overtimeSeconds),
      categoryBreakdown: breakdown,
    };

    dataService.saveExamResult(result);
    setExamResult(result);
    setShowFinishConfirm(false);

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch {}
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flags).filter(Boolean).length;
  const remainingQuestionsCount = Math.max(0, questions.length - answeredCount);
  const secondsPerRemainingQuestion =
    remainingQuestionsCount > 0 && remainingSeconds > 0
      ? Math.round(remainingSeconds / remainingQuestionsCount)
      : 0;

  // 1. INTRO / START SCREEN
  if (!inExam && !examResult) {
    const pastResults = dataService.getExamResults();
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <Trophy className="w-6 h-6 text-rose-600" />
              <span>BİLSEM Deneme Sınavı Merkezi</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Gerçek sınav formatına uygun, süreli ve tüm bilişsel alanları kapsayan deneme sınavı.
            </p>
          </div>
        </div>

        {/* Hero Card with Duration and Strict Mode Settings */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-purple-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold">
              Resmi Sınav Simülatörü
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif]">
              15 Soruluk Tam Kapsamlı Deneme
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200">
              Gerçek BİLSEM tempo ve sınav disiplinini simüle etmek için görsel geri sayım ve opsiyonel katı mod.
            </p>
          </div>

          {/* Exam Duration Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
              Sınav Süresi Seçimi
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-lg">
              {[
                { mins: 15, label: '15 Dakika', sub: '60 sn / soru (Hızlı)' },
                { mins: 20, label: '20 Dakika', sub: '80 sn / soru (Standart)' },
                { mins: 25, label: '25 Dakika', sub: '100 sn / soru (Rahat)' },
              ].map((opt) => (
                <button
                  key={opt.mins}
                  onClick={() => {
                    sound.playClick();
                    setDurationMinutes(opt.mins);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    durationMinutes === opt.mins
                      ? 'border-rose-400 bg-rose-500/20 text-white font-bold ring-2 ring-rose-500/40'
                      : 'border-indigo-800 bg-indigo-950/50 text-indigo-200 hover:border-indigo-700'
                  }`}
                >
                  <span className="block text-sm font-extrabold">{opt.label}</span>
                  <span className="text-[10px] text-indigo-300 block">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Strict Mode Toggle */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-lg flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Katı Süre Modu (Strict Mode)</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  isStrictMode ? 'bg-rose-500 text-white' : 'bg-white/20 text-slate-300'
                }`}>
                  {isStrictMode ? 'AKTİF' : 'PASİF'}
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                {isStrictMode
                  ? 'Resmi kural: Süre bittiğinde sınav otomatik kapanır ve hemen teslim edilir.'
                  : 'Serbest tempo: Süre bitince ek süre sayacı başlar, soruları tamamlayabilirsin.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setIsStrictMode(!isStrictMode);
              }}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isStrictMode ? 'bg-rose-500' : 'bg-white/30'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isStrictMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Start Exam Button */}
          <div>
            <button
              onClick={startNewExam}
              className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base shadow-lg shadow-rose-500/25 transition-all cursor-pointer active:scale-98 flex items-center gap-2"
            >
              <span>Deneme Sınavını Başlat ({durationMinutes} Dk)</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Past Exam Results History */}
        {pastResults.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <span>Önceki Sınav Performansların</span>
            </h3>

            <div className="space-y-3">
              {pastResults.map((res, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{res.title}</h4>
                    <span className="text-xs text-slate-500">{res.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <span className="text-emerald-600">{res.correctAnswers} Doğru</span>
                    <span className="text-rose-500">{res.wrongAnswers} Yanlış</span>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-mono">
                      %{res.scorePercentage} Başarı
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. EXAM REPORT CARD / RESULTS
  if (examResult) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-24 space-y-6 animate-fadeIn">
        <div className="text-center space-y-2">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-md ${
            endedByTimeout ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-600'
          }`}>
            {endedByTimeout ? <Timer className="w-8 h-8" /> : <Award className="w-8 h-8" />}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
            Deneme Sınavı Karnen
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{examResult.title} • {examResult.date}</p>
        </div>

        {/* Timeout Notification Notice */}
        {endedByTimeout && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm font-semibold flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>Katı Süre Modu Kapsamında: Sınav süresi dolduğu için testiniz otomatik olarak teslim alındı.</span>
          </div>
        )}

        {/* Score Grid */}
        <div className="grid grid-cols-4 gap-2.5 text-center">
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 block">Doğru</span>
            <strong className="text-xl font-bold text-emerald-600">{examResult.correctAnswers}</strong>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 block">Yanlış</span>
            <strong className="text-xl font-bold text-rose-500">{examResult.wrongAnswers}</strong>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 block">Boş</span>
            <strong className="text-xl font-bold text-slate-400">{examResult.blankAnswers}</strong>
          </div>
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-200 shadow-xs">
            <span className="text-[11px] text-indigo-700 block">Puan</span>
            <strong className="text-xl font-bold text-indigo-700">%{examResult.scorePercentage}</strong>
          </div>
        </div>

        {/* Time and Duration Badge */}
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-between text-xs sm:text-sm font-bold text-indigo-950">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Kullanılan Süre: {formatTime(examResult.totalTimeSeconds)}</span>
          </div>
          <span className="font-mono text-indigo-700">
            Ort. {Math.round(examResult.totalTimeSeconds / examResult.totalQuestions)} sn / soru
          </span>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Bilişsel Kategori Analizi</h4>
          <div className="space-y-2 text-xs">
            {Object.entries(examResult.categoryBreakdown).map(([cat, rawStats]) => {
              const stats = rawStats as { total: number; correct: number };
              if (stats.total === 0) return null;
              const catPct = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={cat} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                  <span className="font-semibold text-slate-700 capitalize">
                    {cat.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{stats.correct} / {stats.total}</span>
                    <span className="font-bold text-indigo-700 font-mono w-10 text-right">%{catPct}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={startNewExam}
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Yeni Deneme Çöz</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="w-full py-3.5 rounded-2xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  // 3. ACTIVE RUNNING EXAM
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 pb-24 space-y-4">
      {/* Top HUD: Visual Countdown Timer, Flag, Finish Button */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
              Soru {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-semibold hidden sm:inline">
              Cevaplanan: {answeredCount} / {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Flag for Review */}
            <button
              onClick={toggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                flags[currentQ.id]
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flag className={`w-3.5 h-3.5 ${flags[currentQ.id] ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span className="hidden sm:inline">{flags[currentQ.id] ? 'İşaretlendi' : 'Bayrak Ekle'}</span>
            </button>

            {/* Finish Exam Button */}
            <button
              onClick={() => setShowFinishConfirm(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Sınavı Bitir
            </button>
          </div>
        </div>

        {/* Visual Countdown Timer Bar */}
        <VisualCountdownTimer
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          isStrictMode={isStrictMode}
          isOvertime={remainingSeconds <= 0 && overtimeSeconds > 0}
          overtimeSeconds={overtimeSeconds}
          label="Sınav Süresi"
        />

        {/* Live Pacing Assistant Banner */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {secondsPerRemainingQuestion > 0
                ? `Kalan sorular için önerilen tempo: soru başına ~${secondsPerRemainingQuestion} sn`
                : 'Tüm soruları yanıtladın, bayraklı sorularını kontrol edebilirsin.'}
            </span>
          </div>
          {flaggedCount > 0 && (
            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
              {flaggedCount} Bayraklı Soru
            </span>
          )}
        </div>
      </div>

      {/* Question Navigator Palette (1-15) */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <div className="flex items-center justify-between gap-1.5 min-w-[340px]">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isFlagged = !!flags[q.id];
            const isCurrent = currentIndex === idx;

            let btnStyle = 'bg-slate-100 text-slate-600 border-slate-200';
            if (isCurrent) {
              btnStyle = 'ring-2 ring-indigo-500 bg-indigo-600 text-white font-extrabold border-indigo-600';
            } else if (isFlagged) {
              btnStyle = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
            } else if (isAnswered) {
              btnStyle = 'bg-indigo-100 text-indigo-800 border-indigo-300 font-bold';
            }

            return (
              <button
                key={q.id}
                onClick={() => {
                  sound.playClick();
                  setCurrentIndex(idx);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs flex items-center justify-center border transition-all cursor-pointer shrink-0 relative ${btnStyle}`}
              >
                {idx + 1}
                {isFlagged && !isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 absolute -top-0.5 -right-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
            Soru {currentIndex + 1} / {questions.length}
          </span>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {currentQ.prompt}
          </h2>
        </div>

        {/* Visual Question Area */}
        <div className="py-2">
          <QuestionRenderer question={currentQ} />
        </div>

        {/* Answer Options Grid (CONFIDENTIAL: No immediate feedback!) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {currentQ.options.map((opt) => (
            <OptionRenderer
              key={opt.id}
              option={opt}
              isSelected={answers[currentQ.id] === opt.id}
              onSelect={() => handleSelectOption(opt.id)}
              disabled={false}
              showCorrect={false}
            />
          ))}
        </div>

        {/* Bottom Pagination Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentIndex((prev) => Math.max(0, prev - 1));
            }}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Önceki</span>
          </button>

          <span className="text-xs text-slate-500 font-medium">
            {answeredCount} / {questions.length} Cevaplandı
          </span>

          <button
            onClick={() => {
              sound.playClick();
              if (currentIndex + 1 < questions.length) {
                setCurrentIndex((prev) => prev + 1);
              } else {
                setShowFinishConfirm(true);
              }
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white shadow-xs cursor-pointer hover:bg-indigo-700"
          >
            <span>{currentIndex + 1 < questions.length ? 'Sonraki' : 'Sınavı Bitir'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Finish Confirmation Modal */}
      {showFinishConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Sınavı Tamamlamak İstiyor musun?</h3>
              <p className="text-xs text-slate-500 mt-1">
                {questions.length - answeredCount > 0 ? (
                  <strong className="text-rose-600">
                    Henüz cevaplamadığın {questions.length - answeredCount} soru var!
                  </strong>
                ) : (
                  'Tüm soruları cevapladın. Sonuçlarını görmek için onayla.'
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFinishConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Sınava Dön
              </button>
              <button
                onClick={finishExam}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Evet, Bitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
