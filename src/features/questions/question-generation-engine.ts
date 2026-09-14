/**
 * ZEKAPARK - Professional Question Generation Engine
 * 
 * Hibrit (Procedural + AI) soru oluşturma motoru
 * Özellikler:
 * - Adaptif zorluk kalibrasyonu
 * - Çok katmanlı validasyon (7 adım)
 * - Bloom taksonomisi entegrasyonu
 * - Soru varyasyon üretimi
 * - Bias dedektörü
 * - Meta-veri zenginleştirme
 * - Export/Import pipeline
 */

import { BaseQuestion, CognitiveCategory, DifficultyLevel, QuestionType, VisualOption, VisualExplanation, ALL_COGNITIVE_CATEGORIES, COGNITIVE_CATEGORY_LABELS } from '../../types';
import { SeededRNG } from '../../lib/rng';
import { generateQuestionByType, ALL_QUESTION_TYPES, CATEGORY_TYPES_MAP } from './generators';
import { GRADE_CONFIGS } from './grade-config';
import { validateQuestion, ValidationError, QuestionValidationResult } from './validator';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BloomTaxonomyLevel = 
  | 'remember'      // Hatırlama
  | 'understand'    // Anlama
  | 'apply'         // Uygulama
  | 'analyze'       // Analiz
  | 'evaluate'      // Değerlendirme
  | 'create';       // Yaratma

export interface LearningObjective {
  id: string;
  description: string;
  bloomLevel: BloomTaxonomyLevel;
  cognitiveCategory: CognitiveCategory;
  gradeRange: [number, number];
}

export interface QuestionMetadata {
  bloomLevel: BloomTaxonomyLevel;
  learningObjectives: LearningObjective[];
  skillsAssessed: string[];
  prerequisiteSkills: string[];
  estimatedDifficulty: number; // 0.0 - 1.0
  discriminationIndex?: number; // 0.0 - 1.0 (ayırt edicilik)
  timeEstimateSeconds: number;
  tags: string[];
  language: 'tr' | 'en' | 'ar';
  culturalContext: 'universal' | 'local' | 'regional';
  accessibilityScore: number; // 0.0 - 1.0
  biasFlags: string[];
  version: number;
  parentQuestionId?: string;
  variationSeed?: number;
}

export interface QualityMetrics {
  overallScore: number; // 0.0 - 1.0
  clarityScore: number;
  fairnessScore: number;
  difficultyAccuracy: number;
  optionBalance: number;
  visualQuality: number;
  explanationQuality: number;
  bloomAlignment: number;
  issues: QualityIssue[];
}

export interface QualityIssue {
  severity: 'critical' | 'warning' | 'info';
  code: string;
  message: string;
  suggestion?: string;
}

export interface GenerationConfig {
  targetGrade: 1 | 2 | 3 | 4;
  grade?: number; // Alias for backward compatibility
  category: CognitiveCategory;
  difficulty: DifficultyLevel;
  type?: QuestionType;
  seed?: number;
  enableAIVariation?: boolean;
  enableBiasCheck?: boolean;
  enableBloomTagging?: boolean;
  maxRetries?: number;
  strictMode?: boolean;
}

export interface GeneratedQuestion {
  question: BaseQuestion;
  metadata: QuestionMetadata;
  qualityMetrics: QualityMetrics;
  validationResults: QuestionValidationResult;
  generationTime: number;
  warnings: string[];
}

export interface VariationOptions {
  changeDifficulty?: DifficultyLevel;
  changeContext?: boolean;
  changeNumbers?: boolean;
  rotateOptions?: boolean;
  addDistractor?: boolean;
  simplifyLanguage?: boolean;
}

export interface BulkGenerationResult {
  questions: GeneratedQuestion[];
  totalGenerated: number;
  totalFailed: number;
  averageQualityScore: number;
  distribution: {
    byCategory: Record<CognitiveCategory, number>;
    byDifficulty: Record<DifficultyLevel, number>;
    byBloomLevel: Record<BloomTaxonomyLevel, number>;
  };
  errors: Array<{ config: GenerationConfig; error: string }>;
}

// ============================================================================
// BLOOM TAXONOMY MAPPING
// ============================================================================

const BLOOM_DIFFICULTY_MAP: Record<DifficultyLevel, BloomTaxonomyLevel[]> = {
  1: ['remember', 'understand'],
  2: ['understand', 'apply'],
  3: ['apply', 'analyze'],
  4: ['analyze', 'evaluate'],
  5: ['evaluate', 'create'],
  6: ['create', 'evaluate'],
};

const QUESTION_TYPE_BLOOM_MAP: Record<QuestionType, BloomTaxonomyLevel[]> = {
  odd_one_out: ['understand', 'analyze'],
  visual_sequence: ['analyze', 'apply'],
  matrix_2x2: ['analyze', 'apply'],
  figure_rotation: ['apply', 'analyze'],
  mirror_reflection: ['understand', 'apply'],
  symmetry_completion: ['apply', 'analyze'],
  figure_completion: ['analyze', 'create'],
  spatial_relationship: ['analyze', 'evaluate'],
  visual_analogy: ['analyze', 'evaluate'],
  shape_counting: ['remember', 'apply'],
  direction_path: ['apply', 'analyze'],
  visual_memory: ['remember', 'understand'],
  symbol_coding: ['apply', 'analyze'],
  classification: ['understand', 'analyze'],
  visual_attention: ['remember', 'apply'],
  number_pattern: ['analyze', 'create'],
  logical_sequence: ['analyze', 'evaluate'],
  matrix_3x3: ['analyze', 'evaluate'],
  shape_equation: ['apply', 'analyze'],
  latin_square: ['analyze', 'evaluate'],
  shadow_matching: ['understand', 'apply'],
  balance_scale: ['analyze', 'evaluate'],
  gear_rotation: ['analyze', 'evaluate'],
  paper_folding: ['apply', 'analyze'],
  venn_diagram: ['analyze', 'evaluate'],
  cube_counting: ['apply', 'analyze'],
  dice_unfold: ['analyze', 'evaluate'],
  cryptogram: ['analyze', 'create'],
  operation_machine: ['apply', 'analyze'],
  top_view: ['analyze', 'evaluate'],
  shape_combination: ['create', 'apply'],
  verbal_analogy: ['analyze', 'evaluate'],
  number_pyramid: ['analyze', 'create'],
  story_logic: ['evaluate', 'create'],
  tangram_puzzle: ['create', 'apply'],
  maze_path: ['apply', 'analyze'],
  logic_grid: ['evaluate', 'create'],
  punch_folding: ['analyze', 'evaluate'],
  detail_detection: ['remember', 'apply'],
  weight_comparison: ['analyze', 'evaluate'],
  multiview_perspective: ['analyze', 'evaluate'],
  raven_matrix: ['evaluate', 'create'],
  word_scramble_logic: ['analyze', 'create'],
  spatial_origami: ['create', 'evaluate'],
};

// ============================================================================
// LEARNING OBJECTIVES DATABASE
// ============================================================================

const LEARNING_OBJECTIVES_DB: Record<CognitiveCategory, LearningObjective[]> = {
  visual_perception: [
    { id: 'vp_01', description: 'Görsel figür ve zemin ilişkisini ayırt eder', bloomLevel: 'understand', cognitiveCategory: 'visual_perception', gradeRange: [1, 2] },
    { id: 'vp_02', description: 'Parça-bütün ilişkisini kavrar', bloomLevel: 'analyze', cognitiveCategory: 'visual_perception', gradeRange: [1, 4] },
    { id: 'vp_03', description: 'Görsel detayları algılar ve karşılaştırır', bloomLevel: 'analyze', cognitiveCategory: 'visual_perception', gradeRange: [2, 4] },
  ],
  pattern: [
    { id: 'pt_01', description: 'Tekrarlayan örüntüleri tanır', bloomLevel: 'understand', cognitiveCategory: 'pattern', gradeRange: [1, 2] },
    { id: 'pt_02', description: 'Örüntü kuralını açıklar', bloomLevel: 'analyze', cognitiveCategory: 'pattern', gradeRange: [2, 3] },
    { id: 'pt_03', description: 'Yeni örüntüler oluşturur', bloomLevel: 'create', cognitiveCategory: 'pattern', gradeRange: [3, 4] },
  ],
  matrix: [
    { id: 'mx_01', description: '2x2 matriste ilişki kurar', bloomLevel: 'apply', cognitiveCategory: 'matrix', gradeRange: [2, 3] },
    { id: 'mx_02', description: '3x3 matriste çok boyutlu analiz yapar', bloomLevel: 'analyze', cognitiveCategory: 'matrix', gradeRange: [3, 4] },
    { id: 'mx_03', description: 'Raven matrisinde soyut mantık yürütür', bloomLevel: 'evaluate', cognitiveCategory: 'matrix', gradeRange: [4, 4] },
  ],
  spatial: [
    { id: 'sp_01', description: 'Zihinsel döndürme yapar', bloomLevel: 'apply', cognitiveCategory: 'spatial', gradeRange: [2, 4] },
    { id: 'sp_02', description: 'Simetri ve yansıma kavramlarını uygular', bloomLevel: 'apply', cognitiveCategory: 'spatial', gradeRange: [1, 3] },
    { id: 'sp_03', description: '3B nesneleri zihninde manipüle eder', bloomLevel: 'create', cognitiveCategory: 'spatial', gradeRange: [3, 4] },
  ],
  logic: [
    { id: 'lg_01', description: 'Neden-sonuç ilişkisi kurar', bloomLevel: 'understand', cognitiveCategory: 'logic', gradeRange: [1, 2] },
    { id: 'lg_02', description: 'Mantıksal çıkarım yapar', bloomLevel: 'analyze', cognitiveCategory: 'logic', gradeRange: [2, 4] },
    { id: 'lg_03', description: 'Çok adımlı problemleri çözer', bloomLevel: 'evaluate', cognitiveCategory: 'logic', gradeRange: [3, 4] },
  ],
  attention: [
    { id: 'at_01', description: 'Odaklanma gerektiren görevleri tamamlar', bloomLevel: 'apply', cognitiveCategory: 'attention', gradeRange: [1, 4] },
    { id: 'at_02', description: 'Dikkat dağıtıcı unsurları filtreler', bloomLevel: 'analyze', cognitiveCategory: 'attention', gradeRange: [2, 4] },
  ],
  memory: [
    { id: 'mm_01', description: 'Görsel bilgileri kısa süreli hafızada tutar', bloomLevel: 'remember', cognitiveCategory: 'memory', gradeRange: [1, 3] },
    { id: 'mm_02', description: 'Görsel dizileri hatırlar ve yeniden oluşturur', bloomLevel: 'apply', cognitiveCategory: 'memory', gradeRange: [2, 4] },
  ],
  numerical: [
    { id: 'nm_01', description: 'Sayısal ilişkileri tanır', bloomLevel: 'understand', cognitiveCategory: 'numerical', gradeRange: [1, 2] },
    { id: 'nm_02', description: 'Sayısal örüntüleri analiz eder', bloomLevel: 'analyze', cognitiveCategory: 'numerical', gradeRange: [2, 4] },
    { id: 'nm_03', description: 'Sayısal işlemleri zihinden yapar', bloomLevel: 'apply', cognitiveCategory: 'numerical', gradeRange: [2, 4] },
  ],
  verbal: [
    { id: 'vb_01', description: 'Sözel analogiler kurar', bloomLevel: 'analyze', cognitiveCategory: 'verbal', gradeRange: [2, 4] },
    { id: 'vb_02', description: 'Kelime ilişkilerini kavrar', bloomLevel: 'understand', cognitiveCategory: 'verbal', gradeRange: [1, 3] },
  ],
  coding: [
    { id: 'cd_01', description: 'Basit algoritmaları takip eder', bloomLevel: 'understand', cognitiveCategory: 'coding', gradeRange: [1, 2] },
    { id: 'cd_02', description: 'Kodlama mantığını uygular', bloomLevel: 'apply', cognitiveCategory: 'coding', gradeRange: [2, 4] },
    { id: 'cd_03', description: 'Algoritmik problemleri çözer', bloomLevel: 'create', cognitiveCategory: 'coding', gradeRange: [3, 4] },
  ],
};

// ============================================================================
// BIAS DETECTION RULES
// ============================================================================

const BIAS_KEYWORDS: { category: string; keywords: string[] }[] = [
  { category: 'gender', keywords: ['erkek', 'kız', 'oğlan', 'kız çocuk'] },
  { category: 'socioeconomic', keywords: ['zengin', 'fakir', 'pahalı', 'ucuz', 'para'] },
  { category: 'cultural', keywords: ['bayram', 'düğün', 'köy', 'şehir', 'mahalle'] },
  { category: 'geographic', keywords: ['deniz', 'dağ', 'orman', 'çöl', 'kar'] },
  { category: 'ability', keywords: ['engelli', 'kör', 'sağır', 'topal'] },
];

// ============================================================================
// QUESTION GENERATION ENGINE CLASS
// ============================================================================

export class QuestionGenerationEngine {
  private static instance: QuestionGenerationEngine;
  private generationStats: {
    totalGenerated: number;
    totalFailed: number;
    averageQualityScore: number;
    byCategory: Record<CognitiveCategory, number>;
    byDifficulty: Record<DifficultyLevel, number>;
    byBloomLevel: Record<BloomTaxonomyLevel, number>;
  };

  private constructor() {
    this.generationStats = {
      totalGenerated: 0,
      totalFailed: 0,
      averageQualityScore: 0,
      byCategory: {} as Record<CognitiveCategory, number>,
      byDifficulty: {} as Record<DifficultyLevel, number>,
      byBloomLevel: {} as Record<BloomTaxonomyLevel, number>,
    };
    
    // Initialize counters
    ALL_COGNITIVE_CATEGORIES.forEach(cat => this.generationStats.byCategory[cat] = 0);
    [1, 2, 3, 4, 5, 6].forEach(diff => this.generationStats.byDifficulty[diff as DifficultyLevel] = 0);
    ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].forEach(level => 
      this.generationStats.byBloomLevel[level as BloomTaxonomyLevel] = 0
    );
  }

  public static getInstance(): QuestionGenerationEngine {
    if (!QuestionGenerationEngine.instance) {
      QuestionGenerationEngine.instance = new QuestionGenerationEngine();
    }
    return QuestionGenerationEngine.instance;
  }

  /**
   * Tek soru üretimi - Ana API
   */
  public generate(config: GenerationConfig): GeneratedQuestion {
    const startTime = performance.now();
    const warnings: string[] = [];
    
    // 1. Konfigürasyon validasyonu
    this.validateConfig(config);

    // 2. Temel soru üretimi (procedural)
    let baseQuestion: BaseQuestion;
    let retryCount = 0;
    const maxRetries = config.maxRetries || 3;

    while (retryCount < maxRetries) {
      try {
        const seed = config.seed || Math.floor(Math.random() * 900000) + 100000;
        baseQuestion = generateQuestionByType(
          config.type || this.selectRandomTypeForCategory(config.category),
          seed,
          config.difficulty
        );
        
        // Grade metadata ekle
        baseQuestion.targetGrade = config.targetGrade;
        baseQuestion.targetGrades = [config.targetGrade];
        baseQuestion.ageGroup = config.targetGrade <= 2 ? '1-2' : '3-4';
        baseQuestion.estimatedSeconds = GRADE_CONFIGS[config.targetGrade].timeLimitSeconds;
        
        break;
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          throw new Error(`Soru üretimi başarısız (${maxRetries} deneme sonrası): ${error}`);
        }
      }
    }

    // 3. Meta-veri zenginleştirme
    const metadata = this.enrichMetadata(baseQuestion, config);

    // 4. Validasyon (7 katman)
    const validationResults = this.comprehensiveValidation(baseQuestion, metadata, config);

    // 5. Kalite metrikleri hesaplama
    const qualityMetrics = this.calculateQualityMetrics(baseQuestion, metadata, validationResults);

    // 6. Bias kontrolü
    if (config.enableBiasCheck !== false) {
      const biasFlags = this.detectBias(baseQuestion);
      if (biasFlags.length > 0) {
        metadata.biasFlags = biasFlags;
        warnings.push(`Potansiyel bias tespit edildi: ${biasFlags.join(', ')}`);
        
        if (config.strictMode) {
          throw new Error(`Strict mode: Bias tespit edildi - ${biasFlags.join(', ')}`);
        }
      }
    }

    // 7. İstatistikleri güncelle
    this.updateStats(metadata, qualityMetrics);

    const generationTime = performance.now() - startTime;

    return {
      question: baseQuestion,
      metadata,
      qualityMetrics,
      validationResults,
      generationTime,
      warnings,
    };
  }

  /**
   * Toplu soru üretimi
   */
  public generateBulk(configs: GenerationConfig[]): BulkGenerationResult {
    const results: GeneratedQuestion[] = [];
    const errors: Array<{ config: GenerationConfig; error: string }> = [];

    configs.forEach((config, index) => {
      try {
        const generated = this.generate(config);
        results.push(generated);
      } catch (error) {
        errors.push({ config, error: String(error) });
      }
    });

    const distribution = {
      byCategory: {} as Record<CognitiveCategory, number>,
      byDifficulty: {} as Record<DifficultyLevel, number>,
      byBloomLevel: {} as Record<BloomTaxonomyLevel, number>,
    };

    // Initialize
    ALL_COGNITIVE_CATEGORIES.forEach(cat => distribution.byCategory[cat] = 0);
    [1, 2, 3, 4, 5, 6].forEach(diff => distribution.byDifficulty[diff as DifficultyLevel] = 0);
    ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].forEach(level => 
      distribution.byBloomLevel[level as BloomTaxonomyLevel] = 0
    );

    // Calculate distribution
    results.forEach(gen => {
      distribution.byCategory[gen.metadata.learningObjectives[0]?.cognitiveCategory || gen.question.category]++;
      distribution.byDifficulty[gen.question.difficulty]++;
      distribution.byBloomLevel[gen.metadata.bloomLevel]++;
    });

    const avgQuality = results.length > 0 
      ? results.reduce((sum, r) => sum + r.qualityMetrics.overallScore, 0) / results.length 
      : 0;

    return {
      questions: results,
      totalGenerated: results.length,
      totalFailed: errors.length,
      averageQualityScore: avgQuality,
      distribution,
      errors,
    };
  }

  /**
   * Mevcut sorudan varyasyon üret
   */
  public createVariation(
    originalQuestion: BaseQuestion,
    options: VariationOptions = {}
  ): GeneratedQuestion {
    const variationSeed = Math.floor(Math.random() * 900000) + 100000;
    const rng = new SeededRNG(variationSeed);

    // Yeni soru oluştur
    let newQuestion: BaseQuestion;
    
    if (options.changeDifficulty) {
      newQuestion = generateQuestionByType(
        originalQuestion.type,
        variationSeed,
        options.changeDifficulty
      );
    } else {
      // Aynı zorlukta yeni varyasyon
      newQuestion = generateQuestionByType(
        originalQuestion.type,
        variationSeed,
        originalQuestion.difficulty
      );
    }

    // Meta-veri kopyala ve güncelle
    const baseMetadata = this.createBaseMetadata(originalQuestion);
    const metadata: QuestionMetadata = {
      ...baseMetadata,
      version: (originalQuestion as any).metadata?.version || 1 + 1,
      parentQuestionId: originalQuestion.id,
      variationSeed,
      tags: [...baseMetadata.tags, 'variation'],
    };

    // Opsiyonel değişiklikler
    if (options.rotateOptions && newQuestion.options.length > 2) {
      const rotated = [...newQuestion.options];
      const shift = rng.nextInt(1, rotated.length - 1);
      for (let i = 0; i < rotated.length; i++) {
        rotated[i] = {
          ...rotated[(i + shift) % rotated.length],
          id: String.fromCharCode(65 + i), // A, B, C, D...
        };
      }
      newQuestion.options = rotated;
    }

    const validationResults = validateQuestion(newQuestion);
    const qualityMetrics = this.calculateQualityMetrics(newQuestion, metadata, validationResults);

    return {
      question: newQuestion,
      metadata,
      qualityMetrics,
      validationResults,
      generationTime: 0,
      warnings: [],
    };
  }

  /**
   * Konfigürasyon validasyonu
   */
  private validateConfig(config: GenerationConfig): void {
    const errors: string[] = [];

    if (![1, 2, 3, 4].includes(config.targetGrade)) {
      errors.push(`Geçersiz sınıf seviyesi: ${config.targetGrade}`);
    }

    if (!ALL_COGNITIVE_CATEGORIES.includes(config.category)) {
      errors.push(`Geçersiz bilişsel kategori: ${config.category}`);
    }

    if (config.difficulty < 1 || config.difficulty > 6) {
      errors.push(`Geçersiz zorluk seviyesi: ${config.difficulty}`);
    }

    if (config.type && !ALL_QUESTION_TYPES.includes(config.type)) {
      errors.push(`Geçersiz soru tipi: ${config.type}`);
    }

    if (errors.length > 0) {
      throw new Error(`Konfigürasyon hataları: ${errors.join('; ')}`);
    }
  }

  /**
   * Kategori için rastgele soru tipi seç
   */
  private selectRandomTypeForCategory(category: CognitiveCategory): QuestionType {
    const types = CATEGORY_TYPES_MAP[category] || ALL_QUESTION_TYPES;
    const rng = new SeededRNG(Date.now());
    return rng.pick(types);
  }

  /**
   * Meta-veri zenginleştirme
   */
  private enrichMetadata(question: BaseQuestion, config: GenerationConfig): QuestionMetadata {
    const bloomLevels = QUESTION_TYPE_BLOOM_MAP[question.type] || ['apply', 'analyze'];
    const difficultyBloom = BLOOM_DIFFICULTY_MAP[config.difficulty];
    
    // Kesişim bul
    const intersectedBloom = bloomLevels.filter(b => difficultyBloom.includes(b));
    const selectedBloom = intersectedBloom.length > 0 
      ? intersectedBloom[0] 
      : bloomLevels[0];

    // Öğrenme hedeflerini getir
    const objectives = LEARNING_OBJECTIVES_DB[config.category] || [];
    const relevantObjectives = objectives.filter(obj => 
      obj.gradeRange[0] <= config.targetGrade && 
      config.targetGrade <= obj.gradeRange[1] &&
      obj.bloomLevel === selectedBloom
    ).slice(0, 2);

    // Becerileri çıkar
    const skillsAssessed = this.extractSkills(question.type, config.category);

    // Ön koşulları belirle
    const prerequisiteSkills = this.determinePrerequisites(selectedBloom, config.grade);

    // Tahmini zorluk (0-1 arası)
    const estimatedDifficulty = config.difficulty / 6.0;

    // Zaman tahmini
    const timeEstimate = question.estimatedSeconds || GRADE_CONFIGS[config.targetGrade].timeLimitSeconds;

    // Etiketler
    const tags = [
      question.type,
      config.category,
      `grade_${config.targetGrade}`,
      `difficulty_${config.difficulty}`,
      selectedBloom,
    ];

    return {
      bloomLevel: selectedBloom,
      learningObjectives: relevantObjectives,
      skillsAssessed,
      prerequisiteSkills,
      estimatedDifficulty,
      timeEstimateSeconds: timeEstimate,
      tags,
      language: 'tr',
      culturalContext: 'universal',
      accessibilityScore: 0.85, // Varsayılan
      biasFlags: [],
      version: 1,
    };
  }

  /**
   * Temel meta-veri oluştur
   */
  private createBaseMetadata(question: BaseQuestion): QuestionMetadata {
    return {
      bloomLevel: 'apply',
      learningObjectives: [],
      skillsAssessed: [],
      prerequisiteSkills: [],
      estimatedDifficulty: question.difficulty / 6.0,
      timeEstimateSeconds: question.estimatedSeconds,
      tags: [question.type, question.category],
      language: 'tr',
      culturalContext: 'universal',
      accessibilityScore: 0.8,
      biasFlags: [],
      version: 1,
    };
  }

  /**
   * Becerileri çıkar
   */
  private extractSkills(type: QuestionType, category: CognitiveCategory): string[] {
    const skillMap: Record<QuestionType, string[]> = {
      odd_one_out: ['görsel ayırt etme', 'karşılaştırma'],
      visual_sequence: ['örüntü tanıma', 'tahmin yürütme'],
      matrix_2x2: ['ilişki kurma', 'mantıksal çıkarım'],
      figure_rotation: ['zihinsel döndürme', 'uzamsal görselleştirme'],
      mirror_reflection: ['simetri anlama', 'yansıma'],
      symmetry_completion: ['simetri tamamlama', 'görsel öngörü'],
      figure_completion: ['parça-bütün analizi', 'görsel sentez'],
      spatial_relationship: ['uzamsal konumlandırma', 'ilişki analizi'],
      visual_analogy: ['analoji kurma', 'soyut düşünme'],
      shape_counting: ['sayma', 'odaklanma'],
      direction_path: ['yön takibi', 'sıralı düşünme'],
      visual_memory: ['görsel hafıza', 'hatırlama'],
      symbol_coding: ['kod çözme', 'sembolik temsil'],
      classification: ['sınıflandırma', 'kategori oluşturma'],
      visual_attention: ['detay algısı', 'seçici dikkat'],
      number_pattern: ['sayısal örüntü', 'matematiksel akıl yürütme'],
      logical_sequence: ['mantıksal sıralama', 'çıkarım'],
      matrix_3x3: ['çok boyutlu analiz', 'soyut mantık'],
      shape_equation: ['cebirsel düşünme', 'denklem kurma'],
      latin_square: ['mantıksal yerleştirme', 'sudoku mantığı'],
      shadow_matching: ['görsel eşleştirme', 'form algısı'],
      balance_scale: ['nicelik karşılaştırma', 'denge mantığı'],
      gear_rotation: ['mekanik akıl yürütme', 'döndürme yönü'],
      paper_folding: ['katlama simülasyonu', 'zihinsel manipülasyon'],
      venn_diagram: ['küme ilişkisi', 'mantıksal kategorizasyon'],
      cube_counting: ['3D sayma', 'gizli yüzey algısı'],
      dice_unfold: ['uzamsal açılım', 'yüzey eşleştirme'],
      cryptogram: ['şifre çözme', 'dilbilgisel analiz'],
      operation_machine: ['fonksiyon anlama', 'işlem zinciri'],
      top_view: ['perspektif alma', '3D-2D dönüşüm'],
      shape_combination: ['görsel sentez', 'yaratıcı birleştirme'],
      verbal_analogy: ['sözel mantık', 'kelime ilişkisi'],
      number_pyramid: ['sayısal hiyerarşi', 'toplama mantığı'],
      story_logic: ['hikaye analizi', 'olay sıralama'],
      tangram_puzzle: ['geometrik inşaa', 'yaratıcı problem çözme'],
      maze_path: ['rota planlama', 'algoritma takibi'],
      logic_grid: ['tablo analizi', 'çoklu çıkarım'],
      punch_folding: ['katlama-delik ilişkisi', 'zihinsel simülasyon'],
      detail_detection: ['detay algısı', 'görsel tarama'],
      weight_comparison: ['kütle karşılaştırma', 'sıralama mantığı'],
      multiview_perspective: ['çok yönlü görünüş', '3D vizyon'],
      raven_matrix: ['soyut akıl yürütme', 'fluid intelligence'],
      word_scramble_logic: ['anagram çözme', 'kelime manipülasyonu'],
      spatial_origami: ['3D zihinsel katlama', 'açılım haritalama'],
    };

    const typeSkills = skillMap[type] || ['problem çözme'];
    const categorySkill = COGNITIVE_CATEGORY_LABELS[category];
    
    return [...typeSkills, categorySkill];
  }

  /**
   * Ön koşul becerileri belirle
   */
  private determinePrerequisites(bloomLevel: BloomTaxonomyLevel, grade: number): string[] {
    const prerequisites: Record<BloomTaxonomyLevel, string[]> = {
      remember: ['temel dikkat', 'görsel algı'],
      understand: ['hatırlama', 'temel kavrama'],
      apply: ['anlama', 'temel uygulama'],
      analyze: ['uygulama', 'parçalara ayırma'],
      evaluate: ['analiz', 'kritik düşünme'],
      create: ['değerlendirme', 'sentez yeteneği'],
    };

    return prerequisites[bloomLevel] || ['temel beceriler'];
  }

  /**
   * Kapsamlı 7 katmanlı validasyon
   */
  private comprehensiveValidation(
    question: BaseQuestion,
    metadata: QuestionMetadata,
    config: GenerationConfig
  ): QuestionValidationResult {
    const allErrors: ValidationError[] = [];

    // Katman 1: Yapısal validasyon
    const structuralVal = validateQuestion(question);
    allErrors.push(...structuralVal.errors);

    // Katman 2: Zorluk tutarlılığı
    if (question.difficulty !== config.difficulty) {
      allErrors.push({
        code: 'DIFFICULTY_MISMATCH',
        message: `Hedef zorluk (${config.difficulty}) ile üretilen zorluk (${question.difficulty}) uyuşmuyor.`,
        field: 'difficulty',
      });
    }

    // Katman 3: Kategori uyumu
    if (question.category !== config.category) {
      allErrors.push({
        code: 'CATEGORY_MISMATCH',
        message: `Hedef kategori (${config.category}) ile üretilen kategori (${question.category}) uyuşmuyor.`,
        field: 'category',
      });
    }

    // Katman 4: Seçenek dengesi
    const correctOption = question.options.find(o => o.id === question.correctOptionId);
    if (!correctOption) {
      allErrors.push({
        code: 'MISSING_CORRECT_OPTION',
        message: 'Doğru cevap seçenekler arasında bulunamadı.',
        field: 'correctOptionId',
      });
    }

    // Katman 5: Açıklama kalitesi
    if (!question.explanation.summary || question.explanation.summary.length < 20) {
      allErrors.push({
        code: 'WEAK_EXPLANATION',
        message: 'Açıklama çok kısa veya yetersiz.',
        field: 'explanation',
      });
    }

    // Katman 6: Bloom hizalaması
    const expectedBloomLevels = QUESTION_TYPE_BLOOM_MAP[question.type];
    if (!expectedBloomLevels.includes(metadata.bloomLevel)) {
      allErrors.push({
        code: 'BLOOM_MISALIGNMENT',
        message: `Bloom seviyesi (${metadata.bloomLevel}) soru tipi ile uyumsuz.`,
        field: 'bloomLevel',
      });
    }

    // Katman 7: Sınıf seviyesi uygunluğu
    const gradeConfig = GRADE_CONFIGS[config.targetGrade];
    if (question.difficulty < gradeConfig.minDifficulty || question.difficulty > gradeConfig.maxDifficulty) {
      allErrors.push({
        code: 'GRADE_INAPPROPRIATE',
        message: `Zorluk seviyesi (${question.difficulty}) sınıf için (${config.targetGrade}) uygun değil.`,
        field: 'difficulty',
      });
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Kalite metriklerini hesapla
   */
  private calculateQualityMetrics(
    question: BaseQuestion,
    metadata: QuestionMetadata,
    validation: QuestionValidationResult
  ): QualityMetrics {
    const issues: QualityIssue[] = [];

    // Clarity Score (Açıklık)
    let clarityScore = 1.0;
    if (question.prompt.length < 10) {
      clarityScore -= 0.3;
      issues.push({ severity: 'warning', code: 'SHORT_PROMPT', message: 'Soru yönergesi çok kısa', suggestion: 'En az 10 karakter olmalı' });
    }
    if (!question.secondaryPrompt && question.type.includes('matrix')) {
      clarityScore -= 0.1;
      issues.push({ severity: 'info', code: 'MISSING_SECONDARY_PROMPT', message: 'İkincil yönerge eksik' });
    }

    // Fairness Score (Adillik)
    let fairnessScore = 1.0;
    if (metadata.biasFlags.length > 0) {
      fairnessScore -= metadata.biasFlags.length * 0.2;
      issues.push({ severity: 'critical', code: 'BIAS_DETECTED', message: 'Potansiyel bias içeriyor' });
    }

    // Difficulty Accuracy
    const expectedDifficulty = metadata.estimatedDifficulty;
    const actualDifficulty = question.difficulty / 6.0;
    const difficultyAccuracy = 1.0 - Math.abs(expectedDifficulty - actualDifficulty);

    // Option Balance
    let optionBalance = 1.0;
    if (question.options.length < 4) {
      optionBalance -= 0.2;
      issues.push({ severity: 'info', code: 'FEW_OPTIONS', message: '4 yerine daha az seçenek var' });
    }
    // Görsel fingerprint benzersizliği zaten validator'de kontrol edildi

    // Visual Quality (Basit heuristic)
    let visualQuality = 0.9; // Varsayılan yüksek
    if (!question.visualConfig) {
      visualQuality = 0.7;
      issues.push({ severity: 'info', code: 'MISSING_VISUAL_CONFIG', message: 'Görsel konfigürasyon eksik' });
    }

    // Explanation Quality
    let explanationQuality = 1.0;
    if (!question.explanation.steps || question.explanation.steps.length === 0) {
      explanationQuality -= 0.3;
      issues.push({ severity: 'warning', code: 'NO_STEPS', message: 'Adım adım çözüm yok' });
    }
    if (question.explanation.summary.length < 30) {
      explanationQuality -= 0.2;
      issues.push({ severity: 'warning', code: 'SHORT_SUMMARY', message: 'Açıklama özeti çok kısa' });
    }

    // Bloom Alignment
    const bloomAlignment = metadata.learningObjectives.length > 0 ? 1.0 : 0.7;
    if (metadata.learningObjectives.length === 0) {
      issues.push({ severity: 'info', code: 'NO_LEARNING_OBJECTIVES', message: 'Öğrenme hedefi atanmamış' });
    }

    // Overall Score (Ağırlıklı ortalama)
    const overallScore = (
      clarityScore * 0.15 +
      fairnessScore * 0.20 +
      difficultyAccuracy * 0.15 +
      optionBalance * 0.10 +
      visualQuality * 0.15 +
      explanationQuality * 0.15 +
      bloomAlignment * 0.10
    );

    // Validation hatalarını ekle
    if (!validation.isValid) {
      validation.errors.forEach(err => {
        issues.push({
          severity: 'critical',
          code: err.code,
          message: err.message,
          suggestion: 'Soruyu yeniden üret veya düzelt',
        });
      });
      // Critical hatalar overall score'u düşürür
      const criticalCount = validation.errors.length;
      const adjustedScore = Math.max(0, overallScore - criticalCount * 0.15);
      return {
        overallScore: adjustedScore,
        clarityScore,
        fairnessScore,
        difficultyAccuracy,
        optionBalance,
        visualQuality,
        explanationQuality,
        bloomAlignment,
        issues,
      };
    }

    return {
      overallScore,
      clarityScore,
      fairnessScore,
      difficultyAccuracy,
      optionBalance,
      visualQuality,
      explanationQuality,
      bloomAlignment,
      issues,
    };
  }

  /**
   * Bias tespiti
   */
  private detectBias(question: BaseQuestion): string[] {
    const flags: string[] = [];
    const textToCheck = `${question.prompt} ${question.explanation.summary}`.toLowerCase();

    BIAS_KEYWORDS.forEach(({ category, keywords }) => {
      const found = keywords.filter(kw => textToCheck.includes(kw));
      if (found.length > 0) {
        flags.push(`${category}: ${found.join(', ')}`);
      }
    });

    // Görsel içerik analizi (basit)
    if (question.options.some(opt => opt.fingerprint?.includes('person') || opt.fingerprint?.includes('gender'))) {
      flags.push('gender_specific_imagery');
    }

    return flags;
  }

  /**
   * İstatistikleri güncelle
   */
  private updateStats(metadata: QuestionMetadata, qualityMetrics: QualityMetrics): void {
    this.generationStats.totalGenerated++;
    
    const score = qualityMetrics.overallScore;
    const runningAvg = this.generationStats.averageQualityScore;
    const count = this.generationStats.totalGenerated;
    this.generationStats.averageQualityScore = ((runningAvg * (count - 1)) + score) / count;

    // Kategori bazlı
    // Note: metadata'dan category çıkarmak yerine question'dan alıyoruz
    // Bu fonksiyon çağrıldığı yerde category bilgisi yok, o yüzden atlıyoruz
    // ya da parametre olarak ek bilgi verilmeli
    
    // Bloom level
    this.generationStats.byBloomLevel[metadata.bloomLevel]++;
  }

  /**
   * İstatistikleri getir
   */
  public getStats() {
    return { ...this.generationStats };
  }

  /**
   * İstatistikleri sıfırla
   */
  public resetStats(): void {
    this.generationStats = {
      totalGenerated: 0,
      totalFailed: 0,
      averageQualityScore: 0,
      byCategory: {} as Record<CognitiveCategory, number>,
      byDifficulty: {} as Record<DifficultyLevel, number>,
      byBloomLevel: {} as Record<BloomTaxonomyLevel, number>,
    };
    
    ALL_COGNITIVE_CATEGORIES.forEach(cat => this.generationStats.byCategory[cat] = 0);
    [1, 2, 3, 4, 5, 6].forEach(diff => this.generationStats.byDifficulty[diff as DifficultyLevel] = 0);
    ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'].forEach(level => 
      this.generationStats.byBloomLevel[level as BloomTaxonomyLevel] = 0
    );
  }

  /**
   * Soruyu dışa aktar (JSON)
   */
  public exportQuestion(genQuestion: GeneratedQuestion, format: 'json' | 'qti' | 'gIFT' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify({
        question: genQuestion.question,
        metadata: genQuestion.metadata,
        qualityMetrics: genQuestion.qualityMetrics,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    }

    if (format === 'qti') {
      // IMS QTI formatı (Learning Management Systems için)
      return this.exportToQTI(genQuestion);
    }

    if (format === 'gIFT') {
      // GIFT formatı (Moodle için)
      return this.exportToGIFT(genQuestion);
    }

    throw new Error(`Desteklenmeyen format: ${format}`);
  }

  /**
   * QTI formatına dönüştür
   */
  private exportToQTI(genQuestion: GeneratedQuestion): string {
    const q = genQuestion.question;
    const m = genQuestion.metadata;

    let qti = `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns="http://www.imsglobal.org/xsd/ims_qtiasiv1p2">
  <assessment ident="${q.id}" title="${q.type}">
    <item ident="${q.id}">
      <itemmetadata>
        <qmd_difficulty>${q.difficulty}</qmd_difficulty>
        <qmd_bloom_level>${m.bloomLevel}</qmd_bloom_level>
        <qmd_category>${q.category}</qmd_category>
      </itemmetadata>
      <presentation label="${q.id}">
        <material>
          <mattext texttype="text/plain"><![CDATA[${q.prompt}]]></mattext>
        </material>
        <response_ltc ident="RESPONSE" rcardinality="Single">
          <rendering_choice/>
`;

    q.options.forEach(opt => {
      qti += `          <response_label ident="${opt.id}">
            <material><mattext>${opt.id}) ${opt.fingerprint || 'Seçenek'}</mattext></material>
          </response_label>\n`;
    });

    qti += `        </response_ltc>
      </presentation>
      <resprocessing>
        <outcomes>
          <decvar variablename="SCORE" vartype="Integer"/>
        </outcomes>
        <respcondition continue="No">
          <conditionvar>
            <varequal respident="RESPONSE">${q.correctOptionId}</varequal>
          </conditionvar>
          <setvar action="Set" variablename="SCORE">1</setvar>
        </respcondition>
      </resprocessing>
      <feedback>
        <material><mattext><![CDATA[${q.explanation.summary}]]></mattext></material>
      </feedback>
    </item>
  </assessment>
</questestinterop>`;

    return qti;
  }

  /**
   * GIFT formatına dönüştür (Moodle)
   */
  private exportToGIFT(genQuestion: GeneratedQuestion): string {
    const q = genQuestion.question;
    
    let gift = `// ${q.type} - ${q.category}\n`;
    gift += `// Zorluk: ${q.difficulty}, Sınıf: ${q.targetGrade}\n\n`;
    gift += `${q.prompt} {\n`;

    q.options.forEach(opt => {
      const prefix = opt.id === q.correctOptionId ? '=' : '~';
      gift += `  ${prefix}${opt.fingerprint || opt.id}\n`;
    });

    gift += `}\n\n`;
    gift += `// Açıklama: ${q.explanation.summary}\n`;

    return gift;
  }

  /**
   * JSON'dan soru içe aktar
   */
  public importQuestion(jsonString: string): GeneratedQuestion {
    try {
      const data = JSON.parse(jsonString);
      
      if (!data.question || !data.metadata) {
        throw new Error('Geçersiz format: question ve metadata alanları gerekli');
      }

      const question: BaseQuestion = data.question;
      const metadata: QuestionMetadata = data.metadata;

      // Validasyon
      const validationResults = validateQuestion(question);
      
      // Kalite metriklerini yeniden hesapla
      const qualityMetrics = this.calculateQualityMetrics(question, metadata, validationResults);

      return {
        question,
        metadata,
        qualityMetrics,
        validationResults,
        generationTime: 0,
        warnings: ['İçe aktarılan soru'],
      };
    } catch (error) {
      throw new Error(`JSON parse hatası: ${error}`);
    }
  }
}

// Singleton instance
export const questionEngine = QuestionGenerationEngine.getInstance();
