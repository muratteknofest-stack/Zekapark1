import React, { useState } from 'react';
import { UserProfile, DailyStudyPlan, SkillMastery, MistakeItem } from '../types';
import {
  Sparkles,
  Flame,
  Star,
  Compass,
  Trophy,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target,
  Brain,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { sound } from '../lib/sound';
import { DailyStreakCard } from './DailyStreakCard';
import { DailyGoalProgressCard } from './DailyGoalProgressCard';
import { StreakMilestonesModal } from './StreakMilestonesModal';
import { BadgesSection } from './BadgesSection';
import { StudyReminderSettingsModal } from './StudyReminderSettingsModal';
import { WeeklyProgressChartCard } from './WeeklyProgressChartCard';
import { TodayPersonalizedStudyPlanCard } from './TodayPersonalizedStudyPlanCard';
import { reminderService } from '../services/reminder-service';
import { STREAK_MILESTONES } from '../services/data-service';
import { Bell, Clock, Settings, Crown, Medal } from 'lucide-react';

interface StudentDashboardProps {
  user: UserProfile;
  dailyPlan: DailyStudyPlan;
  masteries: SkillMastery[];
  mistakes: MistakeItem[];
  onUserUpdate?: (updatedUser: UserProfile) => void;
  onStartPractice: (category?: any) => void;
  onStartAdaptive: () => void;
  onStartExam: () => void;
  onOpenMistakes: () => void;
  onNavigate: (route: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  dailyPlan,
  masteries,
  mistakes,
  onUserUpdate,
  onStartPractice,
  onStartAdaptive,
  onStartExam,
  onOpenMistakes,
  onNavigate,
}) => {
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderConfig, setReminderConfig] = useState(() => reminderService.getConfig());

  React.useEffect(() => {
    return reminderService.subscribeToConfig((cfg) => {
      setReminderConfig(cfg);
    });
  }, []);

  const nextLevelXP = user.level * 250;
  const currentLevelBaseXP = (user.level - 1) * 250;
  const progressInLevel = Math.max(0, user.xp - currentLevelBaseXP);
  const xpNeededInLevel = nextLevelXP - currentLevelBaseXP;
  const progressPercentage = Math.min(100, Math.round((progressInLevel / xpNeededInLevel) * 100));

  const unresolvedMistakes = mistakes.filter((m) => !m.resolved);

  // Check if any streak rewards are waiting to be claimed
  const claimedDays = user.claimedStreakDays || [3];
  const hasClaimableRewards = STREAK_MILESTONES.some(
    (m) => user.streak >= m.day && !claimedDays.includes(m.day)
  );

  // Strongest and weakest skills
  const sortedSkills = [...masteries].sort((a, b) => b.mastery - a.mastery);
  const strongSkill = sortedSkills[0];
  const weakSkill = sortedSkills[sortedSkills.length - 1];

  // Daily Goal question tracking
  const targetQuestions = user.dailyGoalQuestions || dailyPlan?.targetQuestions || 10;
  const todayQuestions = user.todayQuestionsSolved ?? dailyPlan?.completedQuestions ?? 7;
  const goalProgressPercent = Math.min(100, Math.round((todayQuestions / targetQuestions) * 100));
  const isGoalReached = todayQuestions >= targetQuestions;
  const remainingQuestions = Math.max(0, targetQuestions - todayQuestions);
  const targetMinutes = user.dailyGoalMinutes || 15;
  const todayMinutesSpent = user.todayMinutesSpent || 8;

  const handleUserUpdate = (updatedUser: UserProfile) => {
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24 lg:pb-12">
      {/* Top Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white p-6 sm:p-8 shadow-xl shadow-indigo-600/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar and Greeting */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/25 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif]">
                  Merhaba, {user.name}!
                </h1>
                <span className="bg-amber-400 text-amber-950 font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  Sv. {user.level}
                </span>
              </div>
              <p className="text-indigo-100 text-sm mt-1">
                Bugün zihnini geliştirmek için harika bir gün! 🚀
              </p>
            </div>
          </div>

          {/* Quick Metrics: Streak (Clickable to open Streak Modal) & Daily Goal */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                sound.playClick();
                setShowStreakModal(true);
              }}
              title="Seri detaylarını ve ödüllerini gör"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 flex items-center gap-3 cursor-pointer transition-all active:scale-95 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center relative">
                <Flame className="w-6 h-6 text-orange-400 fill-orange-400 group-hover:scale-110 transition-transform" />
                {hasClaimableRewards && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-indigo-700 animate-ping" />
                )}
              </div>
              <div>
                <span className="text-xs text-indigo-200 block font-medium flex items-center gap-1">
                  Seri
                  {hasClaimableRewards && (
                    <span className="text-[10px] text-amber-300 font-extrabold">
                      • Ödül!
                    </span>
                  )}
                </span>
                <strong className="text-lg font-bold flex items-center gap-1">
                  {user.streak} Gün
                </strong>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                document.getElementById('daily-goal-progress-card')?.scrollIntoView({ behavior: 'smooth' });
              }}
              title="Günlük hedef detaylarını ve ilerleme çubuğunu gör"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl px-4 py-3 border border-white/20 flex flex-col justify-center gap-1.5 cursor-pointer transition-all active:scale-95 text-left group min-w-[145px] sm:min-w-[170px]"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Target className="w-6 h-6 text-emerald-300 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-xs text-indigo-200 block font-medium flex items-center justify-between gap-1">
                    <span>Günlük Hedef</span>
                    <span className="text-[10px] text-emerald-300 font-extrabold">%{goalProgressPercent}</span>
                  </span>
                  <strong className="text-sm sm:text-base font-bold text-white block">
                    {todayQuestions} / {targetQuestions} Soru
                  </strong>
                </div>
              </div>
              {/* Mini visual progress bar */}
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-500"
                  style={{ width: `${goalProgressPercent}%` }}
                />
              </div>
            </button>
          </div>
        </div>
        
        {/* Quick Study Suggestion */}
        {weakSkill && (
          <div className="mt-5 p-4 bg-white/10 rounded-2xl border border-white/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400 text-amber-950 rounded-xl flex items-center justify-center shadow-inner">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-indigo-200 font-medium block">Akıllı Sistem Önerisi</span>
                <p className="text-sm font-bold text-white">Hızlı Çalışma: {weakSkill.categoryName} Pratiği Yap</p>
              </div>
            </div>
            <button
              onClick={() => onStartPractice(weakSkill.category)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Hemen Başla
            </button>
          </div>
        )}

        {/* Visual Daily Study Goal Progress Bar ("Öğrencinin Günlük Çalışma Hedefine Ne Kadar Yaklaştığını Gösteren Görsel İlerleme Çubuğu") */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 transition-transform ${
                  isGoalReached
                    ? 'bg-gradient-to-tr from-emerald-400 to-teal-300 text-emerald-950 shadow-emerald-400/20'
                    : 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {isGoalReached ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Target className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-['Outfit',sans-serif]">
                    Günlük Çalışma Hedefin
                  </h3>
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                      isGoalReached
                        ? 'bg-emerald-400 text-emerald-950 border-emerald-300'
                        : 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-current" />
                    <span>
                      {isGoalReached
                        ? '🎉 Hedef Tamamlandı!'
                        : `%{goalProgressPercent} Tamamlandı`}
                    </span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-100 mt-0.5">
                  {isGoalReached ? (
                    <span className="text-emerald-200 font-medium">
                      Harika bir disiplin! Bugünkü hedefini başarıyla tamamladın (+50 XP Bonusu Cepte) 🏆
                    </span>
                  ) : (
                    <>
                      Bugün <strong className="text-white font-bold">{todayQuestions} / {targetQuestions} soru</strong> çözdün. Hedefe ulaşmak için son{' '}
                      <strong className="text-emerald-300 font-extrabold underline decoration-emerald-400">
                        {remainingQuestions} soru
                      </strong>{' '}
                      kaldı!
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <button
                onClick={() => {
                  sound.playClick();
                  onStartPractice();
                }}
                className={`px-4 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 ${
                  isGoalReached
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/20'
                    : 'bg-emerald-400 hover:bg-emerald-300 text-emerald-950 shadow-emerald-500/25'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isGoalReached ? 'Pratiğe Devam Et' : 'Hedefi Tamamla'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Large Visual Progress Bar Track */}
          <div className="relative pt-1 pb-1">
            <div className="w-full h-4 sm:h-5 bg-black/25 rounded-full overflow-hidden p-0.5 border border-white/20 relative shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden shadow-xs ${
                  isGoalReached
                    ? 'bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-300'
                }`}
                style={{ width: `${Math.max(5, goalProgressPercent)}%` }}
              >
                {/* Dynamic Gloss Shimmer Wave */}
                <div className="absolute inset-0 bg-white/30 rounded-full opacity-60 animate-pulse" />
              </div>
            </div>

            {/* Milestone Checkpoints along the progress bar */}
            <div className="flex items-center justify-between text-[11px] text-indigo-200 font-bold mt-2 px-1">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-300 shadow-2xs" />
                <span>Başlangıç (0)</span>
              </span>
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    goalProgressPercent >= 50 ? 'bg-emerald-300 shadow-2xs' : 'bg-white/30'
                  }`}
                />
                <span>Yarı Yol ({Math.round(targetQuestions * 0.5)} Soru)</span>
              </span>
              <span
                className={`flex items-center gap-1 ${
                  isGoalReached ? 'text-emerald-300 font-extrabold' : ''
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isGoalReached ? 'bg-emerald-300 shadow-2xs' : 'bg-white/30'
                  }`}
                />
                <span>
                  Hedef ({targetQuestions} Soru) {isGoalReached ? '✓' : '🎯'}
                </span>
              </span>
            </div>
          </div>

          {/* Micro Stats Bar: Soru Sayısı, Süre ve Hedef İpucu */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  Çözülen Soru:{' '}
                  <strong className="text-white font-bold">
                    {todayQuestions} / {targetQuestions}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-teal-300" />
                <span>
                  Süre:{' '}
                  <strong className="text-white font-bold">
                    {todayMinutesSpent} / {targetMinutes} dk
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <Trophy className="w-3.5 h-3.5" />
                <span>Hedef Bonusu: +50 XP</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                document.getElementById('daily-goal-progress-card')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[11px] text-amber-300 hover:text-white underline underline-offset-2 transition-colors font-bold cursor-pointer flex items-center gap-1"
            >
              <span>Detaylı Hedef Ayarları & Simülasyon</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/15">
          <div className="flex items-center justify-between text-xs text-indigo-100 font-semibold mb-1.5">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span>Seviye {user.level} İlerlemesi</span>
            </span>
            <div className="flex items-center gap-2.5">
              <span>
                {progressInLevel} / {xpNeededInLevel} XP (%{progressPercentage})
              </span>
              <button
                onClick={() => {
                  document.getElementById('progress-panel')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-bold text-amber-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
              >
                Haftalık Grafiği Gör ↓
              </button>
            </div>
          </div>
          <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Daily Goal Progress Bar Card */}
      <DailyGoalProgressCard
        user={user}
        dailyPlan={dailyPlan}
        onUserUpdate={handleUserUpdate}
        onStartPractice={() => onStartPractice()}
      />

      {/* Enriched Weekly Questions Comparison & Progress Card */}
      <WeeklyProgressChartCard
        user={user}
        onStartPractice={() => onStartPractice()}
      />

      {/* Gamified Daily Streak Counter & Milestone Rewards Card */}
      <DailyStreakCard
        user={user}
        onUserUpdate={handleUserUpdate}
        onStartPractice={() => onStartPractice()}
        onOpenDetailsModal={() => {
          sound.playClick();
          setShowStreakModal(true);
        }}
      />

      {/* Streak Milestones & Rewards Modal */}
      <StreakMilestonesModal
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        user={user}
        onUserUpdate={handleUserUpdate}
        onStartPractice={() => {
          setShowStreakModal(false);
          onStartPractice();
        }}
      />

      {/* Study Reminder & Daily Goal Alert Bar */}
      <div
        id="study-reminder-dashboard-card"
        className="bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 rounded-3xl p-4 sm:p-5 border border-amber-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
            <Bell className="w-6 h-6" />
            {reminderConfig.enabled && user.todayMinutesSpent < user.dailyGoalMinutes && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold text-amber-900 font-['Outfit',sans-serif]">
                Çalışma Hatırlatıcısı
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                  reminderConfig.enabled
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {reminderConfig.enabled ? `Aktif (${reminderConfig.reminderTime})` : 'Devre Dışı'}
              </span>
              {user.todayMinutesSpent < user.dailyGoalMinutes ? (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {user.dailyGoalMinutes - user.todayMinutesSpent} dk Kalan Hedef
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Hedef Tamamlandı! ✨
                </span>
              )}
            </div>
            <p className="text-xs text-slate-700 leading-tight">
              {user.todayMinutesSpent < user.dailyGoalMinutes ? (
                <>
                  Bugün <strong>{user.todayMinutesSpent} dk</strong> pratik yaptın. Hedefine ulaşmak ve <strong>{user.streak} günlük</strong> serini korumak için gün içinde bildirim gönderilir.
                </>
              ) : (
                <>
                  Tebrikler! Bugün <strong>{user.todayMinutesSpent} / {user.dailyGoalMinutes} dk</strong> hedefini tamamladın. Zihnin bugün süper çalıştı!
                </>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              reminderService.testReminderNow(user);
            }}
            title="Hatırlatıcı uyarısını ve sesini hemen simüle et"
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-900 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Şimdi Test Et</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setShowReminderModal(true);
            }}
            title="Hatırlatıcı saatini ve bildirim izinlerini ayarla"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-300" />
            <span>Ayarlar</span>
          </button>
        </div>
      </div>

      {/* Study Reminder Settings Modal */}
      <StudyReminderSettingsModal
        user={user}
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onConfigSaved={(cfg) => setReminderConfig(cfg)}
      />

      {/* Today's AI-Personalized Study Plan Card ("Bugünün Çalışma Planı") */}
      <TodayPersonalizedStudyPlanCard
        user={user}
        masteries={masteries}
        mistakes={mistakes}
        onStartPractice={onStartPractice}
        onStartAdaptive={onStartAdaptive}
        onOpenMistakes={onOpenMistakes}
        onUserUpdate={onUserUpdate}
      />

      {/* 4 Main Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Bugünkü Çalışma */}
        <button
          onClick={() => onStartPractice()}
          className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-left shadow-lg shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Play className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h4 className="font-extrabold text-base">Bugünkü Çalışma</h4>
            <p className="text-xs text-indigo-100 mt-0.5">Kategorilere göre 10 soru çöz</p>
          </div>
        </button>

        {/* 2. Akıllı Antrenman */}
        <button
          onClick={onStartAdaptive}
          className="p-5 rounded-3xl bg-gradient-to-br from-purple-600 to-violet-700 text-white text-left shadow-lg shadow-purple-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
          </div>
          <div>
            <h4 className="font-extrabold text-base">Akıllı Antrenman</h4>
            <p className="text-xs text-purple-100 mt-0.5">Zayıf becerilerine odaklı adaptif pratik</p>
          </div>
        </button>

        {/* 3. Deneme Sınavı */}
        <button
          onClick={onStartExam}
          className="p-5 rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 text-white text-left shadow-lg shadow-rose-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base">Deneme Sınavı</h4>
            <p className="text-xs text-rose-100 mt-0.5">15 Soruluk Süreli BİLSEM Denemesi</p>
          </div>
        </button>

        {/* 4. Hatalarım (Mistake Notebook) */}
        <button
          onClick={onOpenMistakes}
          className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-left shadow-lg shadow-amber-500/15 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex flex-col justify-between min-h-[140px] relative"
        >
          {unresolvedMistakes.length > 0 && (
            <span className="absolute top-4 right-4 bg-white text-amber-800 text-xs font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {unresolvedMistakes.length} Bekleyen
            </span>
          )}
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-base">Hata Defteri & Analiz</h4>
            <p className="text-xs text-amber-100 mt-0.5">Beceri dağılım grafiği & tekrar çöz</p>
          </div>
        </button>
      </div>

      {/* Gamified Leaderboard ("Günün En İyileri & BİLSEM Ligi") Teaser Banner */}
      <div
        id="leaderboard-teaser-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 sm:p-6 shadow-md border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/30 text-amber-300 font-extrabold text-xs flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              Günün En İyileri & BİLSEM Ligi
            </span>
            <span className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Canlı Akran Sıralaması
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h3 className="text-lg sm:text-xl font-extrabold font-['Outfit',sans-serif]">
              Senin Sıran: <span className="text-amber-400 font-mono">#4. Sıra</span> (115 XP)
            </h3>
            <span className="text-xs text-slate-300 hidden sm:inline">
              • Lider: Cesur Kartal 🦅 (185 XP)
            </span>
          </div>

          <p className="text-xs text-slate-300 max-w-xl">
            İlk 3 podyumuna girmek ve madalya kazanmak için yalnızca birkaç soru çözmen yeterli! Diğer öğrencileri alkışla ve rekabete katıl.
          </p>

          {/* Mini Peer Avatars Preview */}
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 text-[11px]">Podyumdakiler:</span>
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <span className="px-2 py-0.5 rounded-lg bg-white/10 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                🥇 Cesur Kartal 🦅
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-200 border border-slate-400/30 flex items-center gap-1">
                🥈 Bilge Baykuş 🦉
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-white/10 text-amber-200 border border-amber-600/30 flex items-center gap-1">
                🥉 Hızlı Kaplan 🐯
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('leaderboard');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-amber-400/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span>Liderlik Panosunu Aç</span>
          </button>
        </div>
      </div>

      {/* Interactive Cognitive Terms Glossary Showcase Card */}
      <div
        id="glossary-teaser-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-indigo-950 text-white p-5 sm:p-6 shadow-md border border-teal-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Bilişsel Terimler Sözlüğü
            </span>
            <span className="text-xs text-teal-300 font-semibold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Canlı Simülatörler
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold font-['Outfit',sans-serif]">
            Zorlandığın Kavramların Mantığını Dokunarak Öğren!
          </h3>

          <p className="text-xs text-slate-300 max-w-xl">
            Matris, Rotasyon, Ayna Simetrisi, Şekil Analojisi ve Kağıt Katlama gibi BİLSEM sınavlarında en çok karıştırılan terimlerin canlı simülasyonları ve pratik çözüm ipuçları.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-emerald-200 border border-emerald-400/20 font-medium">
              🔄 90° & 180° Rotasyon
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-teal-200 border border-teal-400/20 font-medium">
              🪞 Dikey & Yatay Simetri
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/10 text-amber-200 border border-amber-400/20 font-medium">
              📐 2x2 & 3x3 Matris
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => {
              sound.playClick();
              onNavigate('glossary');
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-400/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Sözlüğü Keşfet</span>
          </button>
        </div>
      </div>

      {/* Badges Section (Soru Sayısı & Hata Defteri Başarıları) */}
      <BadgesSection
        user={user}
        mistakes={mistakes}
        onUserUpdate={handleUserUpdate}
        onOpenMistakes={onOpenMistakes}
        onStartPractice={() => onStartPractice()}
      />

      {/* Cognitive Mastery Skill Map */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-['Outfit',sans-serif] flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              <span>Bilişsel Yetenek Haritası</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Her kategorideki performansına göre güncellenen ustalık skorları (0 - 100)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {strongSkill && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                En Güçlü: {strongSkill.categoryName} (%{strongSkill.mastery})
              </span>
            )}
            {weakSkill && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Geliştirilmeli: {weakSkill.categoryName} (%{weakSkill.mastery})
              </span>
            )}
          </div>
        </div>

        {/* Skill Bars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {masteries.map((m) => (
            <div
              key={m.category}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {m.categoryName}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-700">
                    %{m.mastery}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({m.attemptCount} Soru)
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    m.mastery >= 75
                      ? 'bg-emerald-500'
                      : m.mastery >= 60
                      ? 'bg-indigo-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${m.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
