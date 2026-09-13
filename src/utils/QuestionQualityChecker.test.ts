import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  validateQuestion, 
  isValidQuestion, 
  formatValidationErrors,
  MANDATORY_QUESTION_FIELDS,
  ValidationError,
  ValidationResult,
  ValidateQuestionOptions 
} from './QuestionQualityChecker';

describe('QuestionQualityChecker', () => {
  const createMockQuestion = (overrides: any = {}) => ({
    id: 'test-1',
    category: 'visual' as any,
    subCategory: 'matrix',
    cognitiveSkill: 'pattern_recognition',
    ageLevel: '8-10',
    difficulty: 'medium' as any,
    text: 'What comes next in the pattern?',
    prompt: 'What comes next in the pattern?',
    options: [
      { id: 'a', text: 'Option A' },
      { id: 'b', text: 'Option B' },
      { id: 'c', text: 'Option C' },
      { id: 'd', text: 'Option D' },
    ],
    correctAnswer: 'a',
    explanation: 'This is the correct answer because the pattern follows a logical sequence.',
    ...overrides,
  });

  describe('validateQuestion', () => {
    it('should pass valid question', () => {
      const question = createMockQuestion();
      const result = validateQuestion(question);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when prompt is missing', () => {
      const question = createMockQuestion({ text: '', prompt: '' });
      const result = validateQuestion(question);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'text')).toBe(true);
    });

    it('should fail when options are less than 4', () => {
      const question = createMockQuestion({
        options: [{ id: 'a', text: 'Only Option' }],
      });
      const result = validateQuestion(question);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'options')).toBe(true);
    });

    it('should fail when correctAnswer is invalid', () => {
      const question = createMockQuestion({
        correctAnswer: 'z', // Not in options
      });
      const result = validateQuestion(question);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'correctAnswer')).toBe(true);
    });

    it('should fail when explanation is empty', () => {
      const question = createMockQuestion({
        explanation: '',
      });
      const result = validateQuestion(question);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'explanation')).toBe(true);
    });

    it('should detect duplicate IDs', () => {
      const question = createMockQuestion({ id: 'dup-1' });
      const existingQuestions = [createMockQuestion({ id: 'dup-1' })];
      
      const result = validateQuestion(question, { existingQuestions });
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.rule === 'id_uniqueness')).toBe(true);
    });
  });

  describe('isValidQuestion', () => {
    it('should return true for valid question', () => {
      const question = createMockQuestion();
      expect(isValidQuestion(question)).toBe(true);
    });

    it('should return false for invalid question', () => {
      const question = createMockQuestion({ text: '', prompt: '' });
      expect(isValidQuestion(question)).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format errors into readable strings', () => {
      const mockResult: ValidationResult = {
        isValid: false,
        errors: [
          { field: 'text', rule: 'mandatory_fields', message: 'Text is required' },
          { field: 'options', rule: 'min_options', message: 'Need 4 options' },
        ],
        errorCount: 2,
        details: {
          hasUniqueId: true,
          hasMandatoryFields: false,
          hasMinimumFourOptions: false,
          hasNonEmptyTextFields: false,
          hasValidCorrectAnswerBounds: true,
        },
      };

      const formatted = formatValidationErrors(mockResult);
      
      expect(formatted.length).toBe(2);
      expect(formatted[0]).toContain('[text]');
      expect(formatted[1]).toContain('[options]');
    });
  });

  describe('MANDATORY_QUESTION_FIELDS', () => {
    it('should include all required fields', () => {
      expect(MANDATORY_QUESTION_FIELDS).toContain('id');
      expect(MANDATORY_QUESTION_FIELDS).toContain('category');
      expect(MANDATORY_QUESTION_FIELDS).toContain('text');
      expect(MANDATORY_QUESTION_FIELDS).toContain('options');
      expect(MANDATORY_QUESTION_FIELDS).toContain('correctAnswer');
      expect(MANDATORY_QUESTION_FIELDS).toContain('explanation');
    });
  });
});
