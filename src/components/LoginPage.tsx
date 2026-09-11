import React, { useState } from 'react';
import {
  UserRole,
  UserProfile,
} from '../types';
import { SYSTEM_ACCOUNTS, dataService } from '../services/data-service';
import { sound } from '../lib/sound';
import { Logo } from './Logo';
import {
  Sparkles,
  ArrowLeft,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Star,
  Flame,
  KeyRound,
  GraduationCap,
  Users,
  Award,
  ArrowRight,
  BookOpen,
  HelpCircle,
  X,
  Phone,
  User,
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (role: UserRole, userProfile?: UserProfile) => void;
  onNavigateHome: () => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'register';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
  initialRole = 'student',
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Register Form States
  const [regStudentName, setRegStudentName] = useState('');
  const [regGrade, setRegGrade] = useState<number>(2);
  const [regExamFocus, setRegExamFocus] = useState('Genel Zihinsel Yetenek');
  const [regParentEmail, setRegParentEmail] = useState('');
  const [regParentPhone, setRegParentPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regKvkkConsent, setRegKvkkConsent] = useState(false);

  // Forgot Password Modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Submit Login Form
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim()) {
      sound.playError();
      setErrorMessage(
        selectedRole === 'student'
          ? 'Lütfen öğrenci kodunuzu veya e-posta adresinizi giriniz.'
          : selectedRole === 'parent'
          ? 'Lütfen kayıtlı veli e-posta adresinizi giriniz.'
          : 'Lütfen yönetici e-posta veya kullanıcı adınızı giriniz.'
      );
      return;
    }

    if (!password.trim() || password.length < 4) {
      sound.playError();
      setErrorMessage('Şifreniz en az 4 karakter olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    sound.playClick();

    setTimeout(() => {
      const basePersona = SYSTEM_ACCOUNTS[selectedRole];
      let loggedUser: UserProfile = {
        ...basePersona,
      };

      if (selectedRole === 'student') {
        const lower = identifier.toLowerCase().trim();
        if (lower.includes('deniz') || lower === 'deniz@zekapark.com') {
          loggedUser = { ...SYSTEM_ACCOUNTS.student };
        } else {
          loggedUser = {
            ...SYSTEM_ACCOUNTS.student,
            name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
          };
        }
      } else if (selectedRole === 'parent') {
        loggedUser = { ...SYSTEM_ACCOUNTS.parent };
      } else if (selectedRole === 'admin') {
        loggedUser = { ...SYSTEM_ACCOUNTS.admin };
      }

      dataService.loginAs(selectedRole, loggedUser);
      sound.playSuccess();
      setSuccessToast(`Giriş başarılı! Hoş geldiniz, ${loggedUser.name}...`);

      setTimeout(() => {
        onLoginSuccess(selectedRole, loggedUser);
      }, 500);
    }, 600);
  };

  // Submit Register Form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regStudentName.trim()) {
      sound.playError();
      setErrorMessage('Lütfen öğrencinin adını ve soyadını giriniz.');
      return;
    }

    if (!regParentEmail.trim() || !regParentEmail.includes('@')) {
      sound.playError();
      setErrorMessage('Lütfen geçerli bir veli e-posta adresi giriniz.');
      return;
    }

    if (!regPassword || regPassword.length < 6) {
      sound.playError();
      setErrorMessage('Güvenliğiniz için şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    if (!regKvkkConsent) {
      sound.playError();
      setErrorMessage('Lütfen KVKK ve Çocuk Verisi Koruma Metnini onaylayınız.');
      return;
    }

    setIsSubmitting(true);
    sound.playSuccess();

    setTimeout(() => {
      const newUser: UserProfile = {
        id: `user-${Date.now()}`,
        name: regStudentName.trim(),
        role: 'student',
        grade: regGrade,
        avatar: '🦊',
        level: 1,
        xp: 100, // Welcome gift
        streak: 1,
        longestStreak: 1,
        todayPracticed: false,
        streakFreezeCount: 1,
        claimedStreakDays: [],
        weeklyStreakHistory: [true, false, false, false, false, false, false],
        lastActiveDate: new Date().toISOString().split('T')[0],
        dailyGoalMinutes: 15,
        todayMinutesSpent: 0,
        soundEnabled: true,
        totalQuestionsSolved: 0,
        resolvedMistakesCount: 0,
      };

      dataService.loginAs('student', newUser);
      setSuccessToast(`Tebrikler ${regStudentName}! Hesabınız hazırlandı, +100 Hoş Geldin XP kazandınız.`);

      setTimeout(() => {
        onLoginSuccess('student', newUser);
      }, 800);
    }, 700);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Return to Landing */}
      <div className="max-w-6xl mx-auto w-full mb-4 flex items-center justify-between">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>256-Bit SSL Şifreli & Reklamsız Güvenli Alan</span>
        </div>
      </div>

      {/* Main Split Authentication Card */}
      <div className="max-w-6xl mx-auto w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Form Column (7 Cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header / Brand Title */}
            <div className="flex items-center justify-between mb-6">
              <Logo
                size="md"
                showText={true}
                showTagline={true}
                onClick={onNavigateHome}
              />

              {/* Mode Toggle Pills (Giriş / Kayıt) */}
              <div className="flex p-1 rounded-xl bg-slate-100 text-xs font-bold border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setActiveTab('register');
                    setErrorMessage(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yeni Kayıt
                </button>
              </div>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successToast && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-pulse">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* LOGIN MODE */}
            {activeTab === 'login' ? (
              <div>
                {/* Role Switcher Tabs */}
                <div className="mb-5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Kullanıcı Rolünüzü Seçiniz
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedRole('student');
                        setErrorMessage(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'student'
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">🦊</span>
                        {selectedRole === 'student' && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                          Öğrenci
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                          BİLSEM Adayı
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedRole('parent');
                        setErrorMessage(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'parent'
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">👩‍🏫</span>
                        {selectedRole === 'parent' && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                          Veli Portalı
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                          Rapor & Analiz
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedRole('admin');
                        setErrorMessage(null);
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedRole === 'admin'
                          ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xl">👨‍💻</span>
                        {selectedRole === 'admin' && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                          Eğitmen
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                          Soru Stüdyosu
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Role Specific Info & Fast Credentials Autofill */}
                <div className="mb-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div className="text-xs font-medium text-slate-700">
                    {selectedRole === 'student' && (
                      <span>Kayıtlı Öğrenci: <strong className="text-indigo-700 font-bold">deniz@zekapark.com</strong></span>
                    )}
                    {selectedRole === 'parent' && (
                      <span>Kayıtlı Veli: <strong className="text-emerald-700 font-bold">veli@zekapark.com</strong></span>
                    )}
                    {selectedRole === 'admin' && (
                      <span>Yönetici: <strong className="text-purple-700 font-bold">admin@zekapark.com</strong></span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      if (selectedRole === 'student') {
                        setIdentifier('deniz@zekapark.com');
                        setPassword('123456');
                      } else if (selectedRole === 'parent') {
                        setIdentifier('veli@zekapark.com');
                        setPassword('123456');
                      } else {
                        setIdentifier('admin@zekapark.com');
                        setPassword('123456');
                      }
                      setErrorMessage(null);
                    }}
                    className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 bg-white hover:bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    Bilgileri Doldur
                  </button>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Identifier Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {selectedRole === 'student'
                        ? 'Öğrenci Kodu, Kullanıcı Adı veya E-posta'
                        : selectedRole === 'parent'
                        ? 'Veli E-posta Adresi'
                        : 'Eğitmen / Yönetici E-postası'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        {selectedRole === 'student' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Mail className="w-4 h-4" />
                        )}
                      </div>
                      <input
                        type={selectedRole === 'student' ? 'text' : 'email'}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={
                          selectedRole === 'student'
                            ? 'Örn: DENIZ2026 veya deniz@zekapark.com'
                            : selectedRole === 'parent'
                            ? 'Örn: zeynep@zekapark.com'
                            : 'Örn: muratteknofest@gmail.com'
                        }
                        className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Şifre
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPasswordModal(true);
                          setForgotSubmitted(false);
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                      >
                        Şifremi Unuttum?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Auto fill helper */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span>Beni bu cihazda hatırla</span>
                    </label>

                    <span className="text-[11px] text-slate-400">
                      Standart şifre: 123456
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        <span>Giriş Yapılıyor...</span>
                      </span>
                    ) : (
                      <>
                        <span>
                          {selectedRole === 'student'
                            ? 'Öğrenci Paneline Giriş Yap'
                            : selectedRole === 'parent'
                            ? 'Veli Portalı Raporlarına Gir'
                            : 'Soru Mimarı Stüdyosuna Gir'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* REGISTER MODE */
              <div>
                <div className="mb-4">
                  <h3 className="text-base font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                    Yeni Öğrenci & Veli Kaydı
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bireysel adaptif zeka egzersizleri ve BİLSEM simülasyonu için hemen başlayın.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Student Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Öğrencinin Adı Soyadı
                      </label>
                      <input
                        type="text"
                        value={regStudentName}
                        onChange={(e) => setRegStudentName(e.target.value)}
                        placeholder="Örn: Efe Yılmaz"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Grade Level */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sınıf Seviyesi
                      </label>
                      <select
                        value={regGrade}
                        onChange={(e) => setRegGrade(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white"
                      >
                        <option value={1}>1. Sınıf (BİLSEM Hazırlık)</option>
                        <option value={2}>2. Sınıf (BİLSEM Hazırlık)</option>
                        <option value={3}>3. Sınıf (BİLSEM Hazırlık)</option>
                        <option value={4}>4. Sınıf (Genel Zihinsel)</option>
                      </select>
                    </div>
                  </div>

                  {/* Target Exam Focus */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hedef Yetenek Alanı
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      {['Genel Zihinsel', 'Görsel Sanatlar', 'Müzik & Ritim'].map((focus) => (
                        <button
                          key={focus}
                          type="button"
                          onClick={() => setRegExamFocus(focus)}
                          className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer truncate ${
                            regExamFocus === focus
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-extrabold shadow-2xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {focus}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Parent Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Veli E-posta Adresi
                      </label>
                      <input
                        type="email"
                        value={regParentEmail}
                        onChange={(e) => setRegParentEmail(e.target.value)}
                        placeholder="veli@eposta.com"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>

                    {/* Parent Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Veli Cep Telefonu (İsteğe Bağlı)
                      </label>
                      <input
                        type="tel"
                        value={regParentPhone}
                        onChange={(e) => setRegParentPhone(e.target.value)}
                        placeholder="05XX XXX XX XX"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Şifre Belirleyin (En az 6 karakter)
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  {/* KVKK and Terms Checkbox */}
                  <label className="flex items-start gap-2.5 pt-1 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={regKvkkConsent}
                      onChange={(e) => setRegKvkkConsent(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span>
                      <strong className="text-slate-900">KVKK Çocuk Verileri Koruma</strong> ve Veli
                      Aydınlatma Sözleşmesi'ni okudum, kabul ediyorum.
                    </span>
                  </label>

                  {/* Register Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span>Hesap Hazırlanıyor...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Ücretsiz Başla (+100 Hoş Geldin XP)</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Pedagogy & Security Trust Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>MEB BİLSEM Tablet Standartlarına Uyumlu</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-slate-400">•</span>
              <span>Reklamsız Çocuk Alanı</span>
              <span className="text-slate-400">•</span>
              <span>Pedagojik İpucu Koçu</span>
            </div>
          </div>
        </div>

        {/* Right Feature Showcase Column (5 Cols) with Real Photo Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-10 relative flex flex-col justify-between overflow-hidden">
          {/* Real Learning Photo as subtle texture */}
          <img
            src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
            alt="Anne ve çocuk ZekaPark ile birlikte zihinsel becerilerini geliştiriyor"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity pointer-events-none"
          />

          {/* Ambient Lighting Gradient */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Stat Pills */}
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-indigo-200">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>BİLSEM Hazırlığında #1 Dijital Platform</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit',sans-serif] leading-tight">
                Zihinsel Potansiyeli Özgür Bırakan Akıllı Algoritmalar
              </h2>
              <p className="text-indigo-200 text-xs sm:text-sm mt-2 leading-relaxed">
                Her çocuk kendine özel hızda öğrenir. ZekaPark parametrik soru motoru ezberletmez, analitik düşünme refleksini kazandırır.
              </p>
            </div>

            {/* Floating Highlight Cards */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-extrabold font-['Outfit',sans-serif]">
                    Sınırsız Parametrik Tohum
                  </div>
                  <div className="text-[11px] text-indigo-200">
                    Aynı soru kalıbı tekrar etmez, her açılışta taze zeka varyasyonu üretilir.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-extrabold font-['Outfit',sans-serif]">
                    3 Aşamalı Sokratik İpucu
                  </div>
                  <div className="text-[11px] text-indigo-200">
                    Cevabı doğrudan vermez; çocuğu doğru mantığa adım adım yönlendirir.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                  <Users className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="text-xs font-extrabold font-['Outfit',sans-serif]">
                    Şeffaf Veli Bilişsel Isı Haritası
                  </div>
                  <div className="text-[11px] text-indigo-200">
                    Hangi bilişsel kategoride ne kadar yol kat edildiğini şeffafça izleyin.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Verified Quote Card */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/15">
            <p className="text-xs text-indigo-100 italic leading-relaxed">
              "Kızım tablet sınavında en çok matris ve döndürme sorularında tereddüt ediyordu. ZekaPark'ın günlük 15 dakikalık serileri sayesinde sınavı ilk 100'de tamamladı!"
            </p>
            <div className="flex items-center gap-3 mt-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                alt="Merve Yılmaz"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-white/30"
              />
              <div>
                <div className="text-xs font-extrabold text-white">Merve Yılmaz</div>
                <div className="text-[10px] text-indigo-300">2. Sınıf Velisi • BİLSEM 2025 Kazananı</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900 font-['Outfit',sans-serif]">
              Şifre & Giriş Kodu Sıfırlama
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Öğrencinizin giriş kodunu veya veli şifrenizi e-posta adresinize anında gönderelim.
            </p>

            {!forgotSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!forgotEmail.trim()) return;
                  sound.playSuccess();
                  setForgotSubmitted(true);
                }}
                className="mt-4 space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kayıtlı Veli E-postası
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="veli@eposta.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <div className="font-bold text-slate-800">💡 Öğrenci Kodu Hatırlatma:</div>
                  <div>
                    Öğrenci şifresi hatırlanamıyorsa veli panelinden öğrenci kodu anında görüntülenebilir veya değiştirilebilir.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Sıfırlama Bağlantısı Gönder
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-4 text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-sm font-bold">Talimatlar Gönderildi!</h4>
                <p className="text-xs mt-1 text-emerald-700">
                  {forgotEmail} adresine şifre ve öğrenci kodu sıfırlama bağlantısı iletildi.
                </p>
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="mt-4 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Tamam
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
