import { DifficultyLevel, QuestionType, CognitiveCategory } from '../../types';

export interface GradeLevelConfig {
  grade: 1 | 2 | 3 | 4;
  title: string;
  stageName: string;
  subtitle: string;
  defaultDifficulty: DifficultyLevel;
  difficultyRange: DifficultyLevel[];
  recommendedTypes: QuestionType[];
  timeLimitSeconds: number;
  pedagogicalFocus: string;
  targetSkills: string[];
  icon: string;
  badgeColor: string;
  badgeBg: string;
  cardBorder: string;
  accentBg: string;
  primaryColor: string;
}

export const GRADE_CONFIGS: Record<1 | 2 | 3 | 4, GradeLevelConfig> = {
  1: {
    grade: 1,
    title: '1. Sınıf',
    stageName: 'Temel Algı & Somut Mantık',
    subtitle: 'İlkokul 1. Sınıf BİLSEM Genel Yetenek',
    defaultDifficulty: 2,
    difficultyRange: [1, 2],
    recommendedTypes: [
      'odd_one_out',
      'figure_completion',
      'symmetry_completion',
      'visual_sequence',
      'shape_counting',
      'direction_path',
      'visual_attention',
    ],
    timeLimitSeconds: 35,
    pedagogicalFocus:
      'Somut görsel ayrıştırma, basit parça-bütün bütünleme, simetrik şekil eşleme ve dikkat odağı.',
    targetSkills: [
      'Görsel Ayrıştırma',
      'Parça-Bütün İlişkisi',
      'Temel Örüntü Keşfi',
      'Görsel Dikkat',
    ],
    icon: '🎒',
    badgeColor: 'text-emerald-800',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    cardBorder: 'border-emerald-200',
    accentBg: 'bg-emerald-500',
    primaryColor: 'emerald',
  },
  2: {
    grade: 2,
    title: '2. Sınıf',
    stageName: 'Gelişim & Kural Keşfi',
    subtitle: 'İlkokul 2. Sınıf BİLSEM Genel Yetenek',
    defaultDifficulty: 3,
    difficultyRange: [2, 3],
    recommendedTypes: [
      'matrix_2x2',
      'mirror_reflection',
      'figure_rotation',
      'classification',
      'visual_memory',
      'spatial_relationship',
      'visual_sequence',
    ],
    timeLimitSeconds: 40,
    pedagogicalFocus:
      '2x2 matris kural ilişkileri, ayna simetrisi kuralları, 90° rotasyon ve görsel bellek analizi.',
    targetSkills: [
      '2x2 Matris Mantığı',
      'Ayna Yansıması',
      'Rotasyonel Dönüşüm',
      'Görsel Bellek',
    ],
    icon: '📘',
    badgeColor: 'text-blue-800',
    badgeBg: 'bg-blue-50 border-blue-200',
    cardBorder: 'border-blue-200',
    accentBg: 'bg-blue-600',
    primaryColor: 'blue',
  },
  3: {
    grade: 3,
    title: '3. Sınıf',
    stageName: 'İleri Akıl Yürütme & Analoji',
    subtitle: 'İlkokul 3. Sınıf BİLSEM Genel Yetenek',
    defaultDifficulty: 4,
    difficultyRange: [3, 4],
    recommendedTypes: [
      'visual_analogy',
      'matrix_3x3',
      'number_pattern',
      'symbol_coding',
      'logical_sequence',
      'figure_rotation',
      'spatial_relationship',
    ],
    timeLimitSeconds: 45,
    pedagogicalFocus:
      'Analojik akıl yürütme (A:B :: C:D), sayı-şekil ilişkileri, sembol kodlama ve 3x3 matris başlangıcı.',
    targetSkills: [
      'Görsel Analoji',
      'Sayısal Örüntü',
      'Sembolik Şifreleme',
      '3x3 Matris Analizi',
    ],
    icon: '📙',
    badgeColor: 'text-amber-800',
    badgeBg: 'bg-amber-50 border-amber-200',
    cardBorder: 'border-amber-200',
    accentBg: 'bg-amber-500',
    primaryColor: 'amber',
  },
  4: {
    grade: 4,
    title: '4. Sınıf',
    stageName: 'Üstün Yetenek & Soyut Muhakeme',
    subtitle: 'İlkokul 4. Sınıf BİLSEM Genel Yetenek',
    defaultDifficulty: 5,
    difficultyRange: [4, 5, 6],
    recommendedTypes: [
      'matrix_3x3',
      'logical_sequence',
      'symbol_coding',
      'number_pattern',
      'spatial_relationship',
      'visual_analogy',
      'figure_rotation',
    ],
    timeLimitSeconds: 50,
    pedagogicalFocus:
      'Soyut tümevarım, çok adımlı mantık zincirleri, 3B uzamsal rotasyon ve üst düzey matris çözümü.',
    targetSkills: [
      'Karmaşık 3x3 Matris',
      'Çoklu Kural Akışı',
      '3B Uzamsal Muhakeme',
      'Kombinatorik Kodlama',
    ],
    icon: '🎓',
    badgeColor: 'text-purple-800',
    badgeBg: 'bg-purple-50 border-purple-200',
    cardBorder: 'border-purple-200',
    accentBg: 'bg-purple-600',
    primaryColor: 'purple',
  },
};

export const ALL_GRADES: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];
