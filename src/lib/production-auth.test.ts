/**
 * ProductionAuthService Testleri
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductionAuthService } from './production-auth';

// Mock storage
const mockStorage: Record<string, string> = {};
vi.mock('./storage', () => ({
  safeStorage: {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = value; },
    removeItem: (key: string) => { delete mockStorage[key]; },
  }
}));

describe('ProductionAuthService', () => {
  beforeEach(() => {
    // Clear storage before each test
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
  });

  describe('isDemoEmail', () => {
    it('should return true for demo emails', () => {
      expect(ProductionAuthService.isDemoEmail('deniz@zekapark.com')).toBe(true);
      expect(ProductionAuthService.isDemoEmail('veli@zekapark.com')).toBe(true);
      expect(ProductionAuthService.isDemoEmail('admin@zekapark.com')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(ProductionAuthService.isDemoEmail('DENIZ@ZEKAPARK.COM')).toBe(true);
      expect(ProductionAuthService.isDemoEmail('Veli@Zekapark.Com')).toBe(true);
    });

    it('should return false for regular emails', () => {
      expect(ProductionAuthService.isDemoEmail('user@gmail.com')).toBe(false);
      expect(ProductionAuthService.isDemoEmail('test@example.com')).toBe(false);
      expect(ProductionAuthService.isDemoEmail('student@student.zekapark.com')).toBe(false);
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no session exists', () => {
      expect(ProductionAuthService.isAuthenticated()).toBe(false);
    });

    it('should return true when session is set', () => {
      const user = {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student' as const,
        avatar: '🦊',
        level: 1,
        xp: 0,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        dailyGoalMinutes: 15,
        todayMinutesSpent: 0,
        soundEnabled: true,
      };
      
      ProductionAuthService.setSession(user);
      expect(ProductionAuthService.isAuthenticated()).toBe(true);
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      expect(ProductionAuthService.getCurrentUser()).toBe(null);
    });

    it('should return user when valid user is stored', () => {
      const user = {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student' as const,
        avatar: '🦊',
        level: 1,
        xp: 0,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        dailyGoalMinutes: 15,
        todayMinutesSpent: 0,
        soundEnabled: true,
      };
      
      ProductionAuthService.setSession(user);
      const retrieved = ProductionAuthService.getCurrentUser();
      
      expect(retrieved).not.toBe(null);
      expect(retrieved?.email).toBe('test@example.com');
      expect(retrieved?.name).toBe('Test User');
    });

    it('should logout and return null if demo account is detected', () => {
      const demoUser = {
        id: 'demo-123',
        name: 'Demo User',
        email: 'deniz@zekapark.com',
        role: 'student' as const,
        avatar: '🦊',
        level: 1,
        xp: 0,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        dailyGoalMinutes: 15,
        todayMinutesSpent: 0,
        soundEnabled: true,
      };
      
      ProductionAuthService.setSession(demoUser);
      const retrieved = ProductionAuthService.getCurrentUser();
      
      // Demo hesaplar otomatik olarak logout edilir
      expect(retrieved).toBe(null);
      expect(ProductionAuthService.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear session and user data', async () => {
      const user = {
        id: 'test-123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student' as const,
        avatar: '🦊',
        level: 1,
        xp: 0,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        dailyGoalMinutes: 15,
        todayMinutesSpent: 0,
        soundEnabled: true,
      };
      
      ProductionAuthService.setSession(user);
      expect(ProductionAuthService.isAuthenticated()).toBe(true);
      
      await ProductionAuthService.logout();
      
      expect(ProductionAuthService.isAuthenticated()).toBe(false);
      expect(ProductionAuthService.getCurrentUser()).toBe(null);
    });
  });
});
