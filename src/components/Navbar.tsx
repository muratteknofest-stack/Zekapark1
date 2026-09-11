import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, StudyReminderConfig } from '../types';
import {
  Sparkles,
  Flame,
  Star,
  Volume2,
  VolumeX,
  Bell,
  LogIn,
  LogOut,
  User,
  Menu,
  X,
  ArrowRight,
  Brain,
  Zap,
  HelpCircle,
  MessageSquare,
  Scale,
  CheckCircle2,
  Hexagon,
  GraduationCap,
} from 'lucide-react';
import { sound } from '../lib/sound';
import { reminderService } from '../services/reminder-service';
import { Logo } from './Logo';

interface NavbarProps {
  currentUser: UserProfile;
  onSwitchPersona?: (role: UserRole) => void;
  onNavigateHome: () => void;
  onNavigate: (route: string) => void;
  currentRoute: string;
  onOpenReminderSettings?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchPersona,
  onNavigateHome,
  onNavigate,
  currentRoute,
  onOpenReminderSettings,
  onLogout,
}) => {
  const [soundOn, setSoundOn] = useState(currentUser.soundEnabled);
  const [reminderConfig, setReminderConfig] = useState<StudyReminderConfig>(() =>
    reminderService.getConfig()
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    return reminderService.subscribeToConfig((cfg) => {
      setReminderConfig(cfg);
    });
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.enabled = next;
    currentUser.soundEnabled = next;
    if (next) sound.playClick();
  };

  const isGoalPending =
    currentUser.todayMinutesSpent < currentUser.dailyGoalMinutes;

  // Smooth scroll handler for landing page anchors
  const handleScrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    sound.playClick();

    if (currentRoute !== 'landing') {
      onNavigate('landing');
      setTimeout(() => {
        const target = document.getElementById(sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 120);
    } else {
      const target = document.getElementById(sectionId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const isLanding = currentRoute === 'landing';
  const isLogin = currentRoute === 'login';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <Logo
          size="md"
          showText={true}
          showTagline={true}
          onClick={() => {
            sound.playClick();
            if (isLanding) {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              onNavigate('landing');
            }
          }}
        />

        {/* --- CASE 1: LANDING PAGE TOP MENU --- */}
        {isLanding && (
          <>
            {/* Desktop Navigation Links for Home Page */}
            <nav className="hidden xl:flex items-center gap-1 text-xs font-bold text-slate-600">
              <button
                onClick={() => handleScrollToSection('bilissel-alanlar')}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Brain className="w-3.5 h-3.5 text-indigo-600" />
                <span>Bilişsel Alanlar</span>
              </button>
              <button
                onClick={() => handleScrollToSection('canli-soru')}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5 text-indigo-700 font-extrabold"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Canlı Soru</span>
              </button>
              <button
                onClick={() => handleScrollToSection('nasil-calisir')}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 transition-colors cursor-pointer"
              >
                <span>Nasıl Çalışır?</span>
              </button>
              <button
                onClick={() => handleScrollToSection('karsilastirma')}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Karşılaştırma</span>
              </button>
              <button
                onClick={() => handleScrollToSection('veli-yorumlari')}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                <span>Veli Yorumları</span>
              </button>
              <button
                onClick={() => handleScrollToSection('sss')}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>SSS</span>
              </button>
            </nav>

            {/* Right Action Cluster for Home Page */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                {soundOn ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {/* Login Page CTA */}
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('login');
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-indigo-500 text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/50 font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <LogIn className="w-4 h-4 text-indigo-600" />
                <span>Giriş Yap</span>
              </button>

              {/* Register / Start CTA */}
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigate('login');
                }}
                className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer items-center gap-1.5 active:scale-98"
              >
                <span>Hemen Başla</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile Menu Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                aria-label="Menüyü Aç"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-900" />
                ) : (
                  <Menu className="w-5 h-5 text-slate-900" />
                )}
              </button>
            </div>
          </>
        )}

        {/* --- CASE 2: LOGIN PAGE TOP MENU --- */}
        {isLogin && (
          <div className="flex items-center gap-3">
            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNavigate('landing');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Ana Sayfaya Dön</span>
            </button>
          </div>
        )}

        {/* --- CASE 3: IN-APP (ROLE-ISOLATED MENUS) --- */}
        {!isLanding && !isLogin && (
          <>
            {/* --- 3A: STUDENT NAVIGATION --- */}
            {currentUser.role === 'student' && (
              <>
                <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      currentRoute === 'dashboard'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Öğrenci Paneli
                  </button>
                  <button
                    onClick={() => onNavigate('practice')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      currentRoute === 'practice'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Çalış & Pratik
                  </button>
                  <button
                    onClick={() => onNavigate('exams')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      currentRoute === 'exams'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Deneme Sınavı
                  </button>
                  <button
                    onClick={() => onNavigate('mistakes')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                      currentRoute === 'mistakes'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Hatalarım
                  </button>
                  <button
                    onClick={() => onNavigate('achievements')}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                      currentRoute === 'achievements'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>🏅 Rozetler</span>
                  </button>
                  <button
                    onClick={() => onNavigate('leaderboard')}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                      currentRoute === 'leaderboard'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>🏆 Sıralama</span>
                  </button>
                  <button
                    onClick={() => onNavigate('glossary')}
                    className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                      currentRoute === 'glossary'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>📖 Sözlük</span>
                  </button>
                </nav>

                {/* Right Controls for Student */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {/* Streak Badge */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigate('achievements');
                    }}
                    title="Günlük Seri ve Süreklilik Rozetleri - Tıkla ve Gör"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs sm:text-sm font-bold shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
                    <span>{currentUser.streak}</span>
                  </button>

                  {/* XP & Level Badge */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onNavigate('achievements');
                    }}
                    title="Kazanılan XP, Seviye ve Rozetler - Tıkla ve Gör"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs sm:text-sm font-bold shadow-2xs cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>{currentUser.xp} XP</span>
                    <span className="hidden sm:inline-block text-[11px] bg-amber-200/80 px-1.5 py-0.5 rounded-md text-amber-900 font-extrabold ml-0.5">
                      Sv.{currentUser.level}
                    </span>
                  </button>

                  {/* Study Reminder Bell Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      onOpenReminderSettings?.();
                    }}
                    title={
                      reminderConfig.enabled
                        ? `Çalışma Hatırlatıcısı Aktif (${reminderConfig.reminderTime})`
                        : 'Çalışma Hatırlatıcılarını Ayarla'
                    }
                    className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4" />
                    {reminderConfig.enabled && isGoalPending && (
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                      </span>
                    )}
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSound}
                    title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {soundOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Student Name Chip */}
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200/80 text-xs font-bold text-indigo-900">
                    <span className="text-sm">🦊</span>
                    <span className="truncate max-w-[90px]">{currentUser.name}</span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onLogout) onLogout();
                      else onNavigate('login');
                    }}
                    title="Çıkış Yap"
                    className="px-2.5 py-1.5 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span className="hidden sm:inline">Çıkış</span>
                  </button>
                </div>
              </>
            )}

            {/* --- 3B: PARENT NAVIGATION ONLY --- */}
            {currentUser.role === 'parent' && (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Veli Portalı • Deniz'in Bilişsel Gelişim Takip ve Analiz Raporu</span>
                </div>

                {/* Right Controls for Parent */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSound}
                    title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {soundOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Parent User Chip */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100/70 border border-emerald-300 text-emerald-900 text-xs font-bold">
                    <span className="text-sm">👩‍🏫</span>
                    <span>{currentUser.name} (Veli)</span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onLogout) onLogout();
                      else onNavigate('login');
                    }}
                    title="Güvenli Çıkış Yap"
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </>
            )}

            {/* --- 3C: ADMIN NAVIGATION ONLY --- */}
            {currentUser.role === 'admin' && (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-extrabold">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span>Yönetici Paneli • Bilişsel Parametrik Soru Stüdyosu</span>
                </div>

                {/* Right Controls for Admin */}
                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Sound Toggle */}
                  <button
                    onClick={toggleSound}
                    title={soundOn ? 'Sesi Kapat' : 'Sesi Aç'}
                    className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    {soundOn ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Admin User Chip */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100/70 border border-purple-300 text-purple-900 text-xs font-bold">
                    <span className="text-sm">👨‍💻</span>
                    <span>{currentUser.name}</span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      sound.playClick();
                      if (onLogout) onLogout();
                      else onNavigate('login');
                    }}
                    title="Güvenli Çıkış Yap"
                    className="px-3 py-1.5 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* --- Mobile Slide-Down Dropdown Menu (For Landing Page) --- */}
      {isLanding && isMobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2.5 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <button
            onClick={() => handleScrollToSection('bilissel-alanlar')}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-bold text-sm text-slate-700 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Bilişsel Alanlar</span>
            </span>
            <span className="text-xs text-slate-400">4 Sütun</span>
          </button>

          <button
            onClick={() => handleScrollToSection('canli-soru')}
            className="w-full text-left px-3 py-2 rounded-xl bg-indigo-50/70 font-extrabold text-sm text-indigo-900 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Canlı Soru Laboratuvarı</span>
            </span>
            <span className="text-xs bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-md font-bold">
              Dene
            </span>
          </button>

          <button
            onClick={() => handleScrollToSection('nasil-calisir')}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-bold text-sm text-slate-700"
          >
            Nasıl Çalışır? (4 Aşamalı Döngü)
          </button>

          <button
            onClick={() => handleScrollToSection('karsilastirma')}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-bold text-sm text-slate-700"
          >
            Geleneksel Kitaplar vs. ZekaPark
          </button>

          <button
            onClick={() => handleScrollToSection('veli-yorumlari')}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-bold text-sm text-slate-700"
          >
            Veli & Eğitimci Yorumları
          </button>

          <button
            onClick={() => handleScrollToSection('sss')}
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 font-bold text-sm text-slate-700"
          >
            Sıkça Sorulan Sorular (SSS)
          </button>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                sound.playClick();
                onNavigate('login');
              }}
              className="w-full py-2.5 rounded-xl border border-slate-300 font-bold text-xs text-slate-800 text-center"
            >
              Giriş Yap
            </button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                sound.playClick();
                onNavigate('login');
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-extrabold text-xs text-center shadow-xs"
            >
              Ücretsiz Kayıt Ol
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
