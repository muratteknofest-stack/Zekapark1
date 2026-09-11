import { BaseQuestion, CognitiveCategory, DifficultyLevel, QuestionType } from '../../../types';
import { SeededRNG } from '../../../lib/rng';
import { validateQuestion } from '../validator';
import { GRADE_CONFIGS } from '../grade-config';

// Import all 18 procedural generators
import { generateOddOneOutQuestion } from './odd-one-out';
import { generateVisualSequenceQuestion } from './visual-sequence';
import { generateFigureRotationQuestion } from './figure-rotation';
import { generateMatrix2x2Question } from './matrix-2x2';
import { generateMirrorReflectionQuestion } from './mirror-reflection';
import {
  generateSymmetryCompletionQuestion,
  generateFigureCompletionQuestion,
  generateSpatialRelationshipQuestion,
  generateVisualAnalogyQuestion,
  generateShapeCountingQuestion,
} from './spatial-engines';
import {
  generateDirectionPathQuestion,
  generateVisualMemoryQuestion,
  generateSymbolCodingQuestion,
  generateClassificationQuestion,
  generateVisualAttentionQuestion,
  generateNumberPatternQuestion,
  generateLogicalSequenceQuestion,
  generateMatrix3x3Question,
} from './logic-engines';

export const ALL_QUESTION_TYPES: QuestionType[] = [
  'odd_one_out',
  'visual_sequence',
  'matrix_2x2',
  'figure_rotation',
  'mirror_reflection',
  'symmetry_completion',
  'figure_completion',
  'spatial_relationship',
  'visual_analogy',
  'shape_counting',
  'direction_path',
  'visual_memory',
  'symbol_coding',
  'classification',
  'visual_attention',
  'number_pattern',
  'logical_sequence',
  'matrix_3x3',
];

export const CATEGORY_TYPES_MAP: Record<CognitiveCategory, QuestionType[]> = {
  visual_perception: ['odd_one_out', 'figure_completion', 'visual_attention'],
  pattern: ['visual_sequence', 'number_pattern', 'logical_sequence'],
  matrix: ['matrix_2x2', 'matrix_3x3'],
  spatial: ['figure_rotation', 'mirror_reflection', 'symmetry_completion', 'spatial_relationship', 'direction_path'],
  logic: ['visual_analogy', 'symbol_coding', 'classification', 'logical_sequence'],
  attention: ['shape_counting', 'visual_attention'],
  memory: ['visual_memory'],
  numerical: ['number_pattern', 'shape_counting'],
};

export function generateQuestionByType(
  type: QuestionType,
  seed: number,
  difficulty: DifficultyLevel = 3
): BaseQuestion {
  let q: BaseQuestion;

  switch (type) {
    case 'odd_one_out':
      q = generateOddOneOutQuestion(seed, difficulty);
      break;
    case 'visual_sequence':
      q = generateVisualSequenceQuestion(seed, difficulty);
      break;
    case 'matrix_2x2':
      q = generateMatrix2x2Question(seed, difficulty);
      break;
    case 'figure_rotation':
      q = generateFigureRotationQuestion(seed, difficulty);
      break;
    case 'mirror_reflection':
      q = generateMirrorReflectionQuestion(seed, difficulty);
      break;
    case 'symmetry_completion':
      q = generateSymmetryCompletionQuestion(seed, difficulty);
      break;
    case 'figure_completion':
      q = generateFigureCompletionQuestion(seed, difficulty);
      break;
    case 'spatial_relationship':
      q = generateSpatialRelationshipQuestion(seed, difficulty);
      break;
    case 'visual_analogy':
      q = generateVisualAnalogyQuestion(seed, difficulty);
      break;
    case 'shape_counting':
      q = generateShapeCountingQuestion(seed, difficulty);
      break;
    case 'direction_path':
      q = generateDirectionPathQuestion(seed, difficulty);
      break;
    case 'visual_memory':
      q = generateVisualMemoryQuestion(seed, difficulty);
      break;
    case 'symbol_coding':
      q = generateSymbolCodingQuestion(seed, difficulty);
      break;
    case 'classification':
      q = generateClassificationQuestion(seed, difficulty);
      break;
    case 'visual_attention':
      q = generateVisualAttentionQuestion(seed, difficulty);
      break;
    case 'number_pattern':
      q = generateNumberPatternQuestion(seed, difficulty);
      break;
    case 'logical_sequence':
      q = generateLogicalSequenceQuestion(seed, difficulty);
      break;
    case 'matrix_3x3':
      q = generateMatrix3x3Question(seed, difficulty);
      break;
    default:
      q = generateVisualSequenceQuestion(seed, difficulty);
  }

  // Automatic Quality Gate Validation
  const val = validateQuestion(q);
  if (!val.isValid) {
    console.warn(`Question validation failed for seed ${seed}, retrying with normalized seed`, val.errors);
    // Safe retry with salted seed
    return generateQuestionByType(type, seed + 10007, difficulty);
  }

  return q;
}

export function generateQuestion(options: {
  category?: CognitiveCategory | 'mixed';
  difficulty?: DifficultyLevel;
  seed?: number;
  type?: QuestionType;
}): BaseQuestion {
  const seed = options.seed ?? Math.floor(Math.random() * 1000000);
  const rng = new SeededRNG(seed);
  const difficulty = options.difficulty ?? 3;

  let chosenType: QuestionType;

  if (options.type) {
    chosenType = options.type;
  } else if (options.category && options.category !== 'mixed') {
    const pool = CATEGORY_TYPES_MAP[options.category] || ALL_QUESTION_TYPES;
    chosenType = rng.pick(pool);
  } else {
    chosenType = rng.pick(ALL_QUESTION_TYPES);
  }

  return generateQuestionByType(chosenType, seed, difficulty);
}

export function generateQuestionForGrade(
  grade: 1 | 2 | 3 | 4,
  seed?: number,
  type?: QuestionType,
  difficulty?: DifficultyLevel
): BaseQuestion {
  const cfg = GRADE_CONFIGS[grade];
  const finalSeed = seed ?? Math.floor(Math.random() * 900000) + 100000;
  const rng = new SeededRNG(finalSeed);

  const finalType = type ?? rng.pick(cfg.recommendedTypes);
  const finalDifficulty = difficulty ?? cfg.defaultDifficulty;

  const q = generateQuestionByType(finalType, finalSeed, finalDifficulty);
  // Ensure appropriate ageGroup tag
  q.ageGroup = grade <= 2 ? '1-2' : '3-4';
  q.estimatedSeconds = cfg.timeLimitSeconds;
  return q;
}

