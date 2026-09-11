import React, { useState, useEffect } from 'react';
import { UserProfile, SkillMastery, StudyReminderConfig } from '../types';
import {
  Brain,
  TrendingUp,
  Calendar,
  Clock,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  BarChart2,
  Users,
  Bell,
  Settings,
} from 'lucide-react';
import { reminderService } from '../services/reminder-service';
import { StudyReminderSettingsModal } from './StudyReminderSettingsModal';
import { sound } from '../lib/sound';

interface ParentPortalViewProps {
  student: UserProfile;
  masteries: SkillMastery[];
}

export const ParentPortalView: React.FC<ParentPortalViewProps> = ({ student, masteries }) => {
  const [reminderConfig, setReminderConfig] = useState<StudyReminderConfig>(() => reminderService.getConfig());
  const [showReminderModal, setShowReminderModal] = useState(false);

  useEffect(() => {
    return reminderService.subscribeToConfig((cfg) => {
      setReminderConfig(cfg);
    });
  }, []);
  // Sort masteries
  const sorted = [...masteries].sort((a, b) => b.mastery - a.mastery);
  const strengths = sorted.slice(0, 3);
  const needsAttention = sorted.slice(-3).reverse();

  // Weekly mock activity
  const weeklyDays = [
    { day: 'Pzt', minutes: 12, questions: 14, completed: true },
    { day: 'Sal', minutes: 15, questions: 18, completed: true },
    { day: 'Çar', minutes: 8, questions: 10, completed: true },
    { day: 'Per', minutes: 16, questions: 20, completed: true },
    { day: 'Cum', minutes: 8, questions: 10, completed: true }, // today
    { day: 'Cmt', minutes: 0, questions: 0, completed: false },
    { day: 'Paz', minutes: 0, questions: 0, completed: false },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 pb-24 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl shadow-xs">
            👩‍🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit',sans-serif]">
                Veli Gelişim Raporu
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                Aktif Takip
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Öğrenci: <strong>{student.name}</strong> • {student.grade}. Sınıf
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Bu Hafta</span>
            <strong className="text-sm text-slate-900 font-bold">59 Dakika</strong>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block">Çözülen Soru</span>
            <strong className="text-sm text-indigo-600 font-bold">72 Soru</strong>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <span className="text-amber-800 font-semibold block">BİLSEM Ligi (Anonim)</span>
            <strong className="text-sm text-amber-900 font-bold">🥉 3. Sıra (Haftalık)</strong>
          </div>
        </div>
      </div>

      {/* Ethical & Pedagogical Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs sm:text-sm text-amber-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Pedagojik Hatırlatma:</strong> yapyap raporları tıbbi veya klinik bir zeka (IQ) teşhisi içermez. Amacımız çocuğunuzun görsel dikkat, matris algısı ve uzamsal akıl yürütme becerilerini oyunlaştırılmış pratiklerle geliştirmektir.
        </p>
      </div>

      {/* Weekly Activity Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 font-['Outfit',sans-serif]">
          <Calendar className="w-5 h-5 text-indigo-600" />
          <span>Haftalık Çalışma Düzeni ve İstikrar</span>
        </h3>

        <div className="grid grid-cols-7 gap-2 text-center">
          {weeklyDays.map((d, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl border transition-all ${
                d.completed
                  ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <span className="text-xs font-bold block">{d.day}</span>
              <strong className="text-base sm:text-lg font-extrabold block my-1">
                {d.minutes > 0 ? `${d.minutes}m` : '-'}
              </strong>
              <span className="text-[10px] text-slate-500">
                {d.questions > 0 ? `${d.questions} soru` : 'Dinlenme'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Study Habit & Reminder Management Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 font-['Outfit',sans-serif]">
                  Düzenli Çalışma Alışkanlığı & Hatırlatıcı Takibi
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    reminderConfig.enabled
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {reminderConfig.enabled ? `Kurulu: ${reminderConfig.reminderTime}` : 'Kapalı'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Öğrencinin serisini ve günlük 15 dakikalık BİLSEM hedefini koruması için otomatik bildirim ve sesli uyarılar.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                reminderService.testReminderNow(student);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span>Test Uyarısı Gönder</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setShowReminderModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-slate-300" />
              <span>Hatırlatıcıyı Ayarla</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Günlük Hedef</span>
            <strong className="text-sm text-slate-900 font-bold">{student.dailyGoalMinutes} Dakika</strong>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Bugün Tamamlanan</span>
            <strong className="text-sm text-indigo-700 font-bold">
              {student.todayMinutesSpent} dk ({student.dailyGoalMinutes - student.todayMinutesSpent} dk kaldı)
            </strong>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Bildirim Kanalları</span>
            <strong className="text-xs text-slate-800 font-bold flex items-center gap-1 mt-0.5">
              <span>Uygulama İçi Zil</span> • <span>Masaüstü Push</span>
            </strong>
          </div>
        </div>
      </div>

      <StudyReminderSettingsModal
        user={student}
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onConfigSaved={(cfg) => setReminderConfig(cfg)}
      />

      {/* Strengths and Focus Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Skills */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="font-bold text-base font-['Outfit',sans-serif]">En Güçlü Beceriler</h3>
          </div>
          <div className="space-y-3">
            {strengths.map((s) => (
              <div key={s.category} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>{s.categoryName}</span>
                  <span className="text-emerald-700 font-mono">%{s.mastery} Ustalık</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {s.category === 'attention' && 'Ayrıntıları çok hızlı fark ediyor, dikkat seviyesi oldukça yüksek.'}
                  {s.category === 'visual_perception' && 'Görsel şekil eşleştirmelerinde üstün algılama kabiliyetine sahip.'}
                  {s.category === 'memory' && 'Görsel hafıza ve ardışık konfigürasyon hatırlamada başarılı.'}
                  {!['attention', 'visual_perception', 'memory'].includes(s.category) && 'Bu bilişsel alandaki soru çözme doğruluğu ortalamanın üzerinde.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention / Advice */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-amber-700">
            <Lightbulb className="w-5 h-5" />
            <h3 className="font-bold text-base font-['Outfit',sans-serif]">Geliştirilebilecek Alanlar & Veli Tavsiyeleri</h3>
          </div>
          <div className="space-y-3">
            {needsAttention.map((s) => (
              <div key={s.category} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>{s.categoryName}</span>
                  <span className="text-amber-800 font-mono">%{s.mastery} Ustalık</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {s.category === 'matrix' && 'İki eksenli (satır ve sütun) ilişkilerde biraz daha yavaş düşünebilir. Matris egzersizleri tavsiye edilir.'}
                  {s.category === 'spatial' && '3 boyutlu döndürme ve ayna yansımalarını kafasında canlandırması için pratik yapması faydalı olacaktır.'}
                  {s.category === 'pattern' && 'Karmaşık renk-şekil dizilerinde adımları tek tek sayarak takip etmesi teşvik edilebilir.'}
                  {!['matrix', 'spatial', 'pattern'].includes(s.category) && 'Düzenli 5 dakikalık günlük tekrarlarla bu beceri hızla yukarı taşınabilir.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comprehensive Skill Map Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 font-['Outfit',sans-serif]">
          Detaylı Kategori ve Başarı Tablosu
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3">Bilişsel Alan</th>
                <th className="py-2.5 px-3">Çözülen Soru</th>
                <th className="py-2.5 px-3">Doğruluk Oranı</th>
                <th className="py-2.5 px-3">Gelişim Puanı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {masteries.map((m) => (
                <tr key={m.category} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-bold text-slate-800">{m.categoryName}</td>
                  <td className="py-3 px-3 text-slate-600">{m.attemptCount} Soru</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">%{m.accuracy}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${m.mastery}%` }}
                        />
                      </div>
                      <span className="font-mono font-bold text-xs text-indigo-700">
                        {m.mastery} / 100
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
