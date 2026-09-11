import React, { useState, useEffect } from 'react';
import { QuestionType, DifficultyLevel, BaseQuestion, UserProfile } from '../types';
import { generateQuestionByType } from '../features/questions/generators';
import { dataService } from '../services/data-service';
import { sound } from '../lib/sound';
import { AdminQuestionStudio } from './admin/AdminQuestionStudio';
import { AdminGradeQuestionPool } from './admin/AdminGradeQuestionPool';
import { AdminQuestionManager } from './admin/AdminQuestionManager';
import { AdminQuestionAnalyticsDashboard } from './admin/AdminQuestionAnalyticsDashboard';
import { AdminStressTest } from './admin/AdminStressTest';
import { AdminStudentCohort } from './admin/AdminStudentCohort';
import { AdminCurriculumMatrix } from './admin/AdminCurriculumMatrix';
import { AdminSystemSettings } from './admin/AdminSystemSettings';
import { AdminDiagnosticsModal } from './admin/AdminDiagnosticsModal';
import {
  Cpu,
  Sparkles,
  Layers,
  Users,
  Compass,
  Settings,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Award,
  GraduationCap,
  Sliders,
  Wrench,
  BarChart3,
} from 'lucide-react';

type AdminTab =
  | 'question_analytics'
  | 'question_manager'
  | 'grade_pool'
  | 'studio'
  | 'stress_test'
  | 'students'
  | 'curriculum'
  | 'settings';

export const AdminPanelView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('question_manager');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<QuestionType>('visual_sequence');
  const [seed, setSeed] = useState<number>(42819);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [generatedQuestion, setGeneratedQuestion] = useState<BaseQuestion>(() =>
    generateQuestionByType('visual_sequence', 42819, 3)
  );

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => dataService.getCurrentUser());

  const handleSyncData = () => {
    setCurrentUser(dataService.getCurrentUser());
  };

  const handleGenerate = (
    newType: QuestionType = selectedType,
    newSeed: number = seed,
    newDiff: DifficultyLevel = difficulty
  ) => {
    const q = generateQuestionByType(newType, newSeed, newDiff);
    setGeneratedQuestion(q);
  };

  const handleInspectInStudio = (type: QuestionType, newSeed: number, newDiff: DifficultyLevel) => {
    setSelectedType(type);
    setSeed(newSeed);
    setDifficulty(newDiff);
    handleGenerate(type, newSeed, newDiff);
    setActiveTab('studio');
  };

  const handleSelectTypeFromOtherTab = (type: QuestionType) => {
    setSelectedType(type);
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    setSeed(newSeed);
    handleGenerate(type, newSeed, difficulty);
    setActiveTab('studio');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Administrative Status */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                ZekaPark Yönetici & Geliştirici Kontrol Merkezi
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  18 Prosedürel Motor Operasyonel
                </span>
                <span>•</span>
                <span>v2.4 Deterministik Vektör Mimarisi</span>
                <span>•</span>
                <span>BİLSEM Standart Uyumlu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin identity & diagnostics controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => {
              sound.playClick();
              setIsDiagnosticsOpen(true);
            }}
            className="px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Motor performansı, bellek ve veri sağlığını test et"
          >
            <Activity className="w-4 h-4 text-purple-600" />
            <span className="hidden sm:inline">Sistem Tanılama</span>
          </button>

          <div className="flex items-center gap-3 bg-purple-50/70 border border-purple-200/80 px-4 py-2 rounded-2xl">
            <span className="text-2xl">👨‍💻</span>
            <div>
              <div className="text-xs font-extrabold text-slate-900">Murat Hoca</div>
              <div className="text-[11px] font-mono font-bold text-purple-700">Sistem Yöneticisi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Soru Motorları
            </span>
            <div className="text-lg font-black text-slate-900">18 Algoritma</div>
            <span className="text-[10px] text-purple-700 font-bold">%100 SVG Çizim</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Sınıf Düzeyleri
            </span>
            <div className="text-lg font-black text-slate-900">4 Sınıf Grubu</div>
            <span className="text-[10px] text-indigo-700 font-bold">1, 2, 3 ve 4. Sınıf Ayrı</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kural Doğruluğu
            </span>
            <div className="text-lg font-black text-emerald-700">%100 Kanonik</div>
            <span className="text-[10px] text-emerald-700 font-bold">Sıfır Çeldirici Çakışması</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Aktif Öğrenci
            </span>
            <div className="text-lg font-black text-slate-900">5 Profil Dizini</div>
            <span className="text-[10px] text-amber-700 font-bold">Ortalama %83 Başarı</span>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('question_analytics');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'question_analytics'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Soru Analiz Dashboard'u</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
            activeTab === 'question_analytics' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
          }`}>
            Canlı Metrik
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('question_manager');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'question_manager'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Soru Yönetim Modülü</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('grade_pool');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'grade_pool'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Sınıf Düzeyli Soru Grupları</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
            1-4. Sınıf
          </span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('studio');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'studio'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Soru Mimarı & SVG Stüdyosu</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('stress_test');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'stress_test'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>18-Motor Kalite Testi</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('students');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Öğrenci Dizini & İlerleme</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('curriculum');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'curriculum'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Bilişsel Müfredat Matrisi</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('settings');
          }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Sistem & Sınav Ayarları</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'question_analytics' && (
          <AdminQuestionAnalyticsDashboard
            onNavigateToQuestionManager={() => setActiveTab('question_manager')}
          />
        )}

        {activeTab === 'question_manager' && (
          <AdminQuestionManager
            onInspectInStudio={handleInspectInStudio}
            onNavigateToAnalytics={() => setActiveTab('question_analytics')}
          />
        )}

        {activeTab === 'grade_pool' && (
          <AdminGradeQuestionPool onInspectInStudio={handleInspectInStudio} />
        )}

        {activeTab === 'studio' && (
          <AdminQuestionStudio
            selectedType={selectedType}
            onTypeChange={(t) => setSelectedType(t)}
            seed={seed}
            onSeedChange={(s) => setSeed(s)}
            difficulty={difficulty}
            onDifficultyChange={(d) => setDifficulty(d)}
            generatedQuestion={generatedQuestion}
            onGenerate={handleGenerate}
          />
        )}

        {activeTab === 'stress_test' && (
          <AdminStressTest onInspectType={handleSelectTypeFromOtherTab} />
        )}

        {activeTab === 'students' && (
          <AdminStudentCohort onSyncNeeded={handleSyncData} />
        )}

        {activeTab === 'curriculum' && (
          <AdminCurriculumMatrix onSelectTypeForStudio={handleSelectTypeFromOtherTab} />
        )}

        {activeTab === 'settings' && (
          <AdminSystemSettings onSyncNeeded={handleSyncData} />
        )}
      </div>

      {/* System Diagnostics & Benchmark Modal */}
      {isDiagnosticsOpen && (
        <AdminDiagnosticsModal onClose={() => setIsDiagnosticsOpen(false)} />
      )}
    </div>
  );
};
