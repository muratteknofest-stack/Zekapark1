import React, { useState } from 'react';
import {
  Home,
  Compass,
  Trophy,
  BookOpen,
  Crown,
  Menu,
  X,
  Calendar,
  Heart,
  ShieldCheck,
  FileText,
  Mail,
  Brain,
  Sparkles,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import { sound } from '../lib/sound';
import { FooterInfoModal, FooterModalTopic } from './FooterInfoModal';
import { UserRole } from '../types';

interface MobileBottomNavProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  mistakesCount?: number;
  userRole?: UserRole;
  onLogout?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentRoute,
  onNavigate,
  mistakesCount = 0,
  userRole = 'student',
  onLogout,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState<FooterModalTopic | null>(null);

  // If user is parent or admin, show an isolated mobile action bar
  if (userRole === 'parent') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-emerald-200 shadow-lg px-4 py-2 flex items-center justify-between pb-safe">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <span className="text-base">👩‍🏫</span>
          <span>Veli Portalı</span>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            if (onLogout) onLogout();
            else onNavigate('login');
          }}
          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    );
  }

  if (userRole === 'admin') {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-purple-200 shadow-lg px-4 py-2 flex items-center justify-between pb-safe">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-900">
          <span className="text-base">👨‍💻</span>
          <span>Soru Stüdyosu</span>
        </div>
        <button
          onClick={() => {
            sound.playClick();
            if (onLogout) onLogout();
            else onNavigate('login');
          }}
          className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Ana Sayfa', icon: Home },
    { id: 'practice', label: 'Çalış', icon: Compass },
    { id: 'exams', label: 'Deneme', icon: Trophy },
    { id: 'mistakes', label: 'Hatalarım', icon: BookOpen, badge: mistakesCount },
    { id: 'more_menu', label: 'Daha Fazla', icon: Menu },
  ];

  const handleNavClick = (id: string) => {
    sound.playClick();
    if (id === 'more_menu') {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setIsMenuOpen(false);
      onNavigate(id);
    }
  };

  const handleOpenInfoModal = (topic: FooterModalTopic) => {
    sound.playClick();
    setIsMenuOpen(false);
    setModalTopic(topic);
  };

  return (
    <>
      {/* Mobile "More" Drawer Backdrop */}
      {isMenuOpen && (
        <div
          onClick={() => setIsMenuOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
        />
      )}

      {/* Mobile "More" Bottom Sheet Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed bottom-[65px] left-3 right-3 z-40 bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm font-['Outfit',sans-serif]">
                  yapyap Menü & Bilgi Merkezi
                </h4>
                <p className="text-[11px] text-slate-500">
                  Eğitsel modüller, resmi kılavuz ve destek
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Learning & Tracking Modules */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Eğitim & İlerleme Modülleri
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsMenuOpen(false);
                  onNavigate('leaderboard');
                }}
                className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 hover:bg-indigo-100 flex items-center gap-2 text-left"
              >
                <Crown className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Haftalık Sıralama</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsMenuOpen(false);
                  onNavigate('glossary');
                }}
                className="p-3 rounded-2xl bg-purple-50/70 border border-purple-100 text-purple-900 hover:bg-purple-100 flex items-center gap-2 text-left"
              >
                <Brain className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Bilişsel Sözlük</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsMenuOpen(false);
                  onNavigate('achievements');
                }}
                className="p-3 rounded-2xl bg-amber-50/70 border border-amber-100 text-amber-900 hover:bg-amber-100 flex items-center gap-2 text-left"
              >
                <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Rozetler & Seviye</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setIsMenuOpen(false);
                  if (onLogout) onLogout();
                  else onNavigate('login');
                }}
                className="p-3 rounded-2xl bg-rose-50/70 border border-rose-100 text-rose-900 hover:bg-rose-100 flex items-center gap-2 text-left"
              >
                <X className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          </div>

          {/* Official BİLSEM Guides & Legal Documents */}
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
              Resmi Kılavuz, Pedagoji & Yasal
            </span>
            <div className="space-y-1.5 text-xs text-slate-700">
              <button
                onClick={() => handleOpenInfoModal('bilsem_guide')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-slate-800">2026 BİLSEM Sınav Takvimi & Formatı</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleOpenInfoModal('pedagogy')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Pedagojik Güvence & Ekran Süresi</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleOpenInfoModal('kvkk')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800">KVKK & Çocuk Verileri Koruması</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => handleOpenInfoModal('contact')}
                className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-slate-100 flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-slate-800">İletişim & Destek (muratteknofest@gmail.com)</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Fixed Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-lg px-2 py-1.5 pb-safe">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.id === 'more_menu' ? isMenuOpen : currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-indigo-600 font-bold scale-105'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 ${isActive ? 'font-bold text-indigo-700' : 'font-medium'}`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Info Modal */}
      {modalTopic && (
        <FooterInfoModal
          topic={modalTopic}
          onClose={() => setModalTopic(null)}
          onSelectTopic={(t) => setModalTopic(t)}
        />
      )}
    </>
  );
};
