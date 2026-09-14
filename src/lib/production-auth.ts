/**
 * ZEKAPARK - Production Authentication Service
 * 
 * Tam uygulama modu: Firebase Authentication + Firestore entegrasyonu
 * Demo hesaplar tamamen devre dışı bırakıldı
 */

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, UserRole } from '../types';
import { safeStorage } from './storage';

const STORAGE_KEYS = {
  AUTH_SESSION: 'zekapark_auth_session',
  CURRENT_USER: 'yapyap_user',
};

// Production'da demo hesaplar KESİNLİKLE kullanılamaz
const DEMO_EMAILS = [
  'deniz@zekapark.com',
  'veli@zekapark.com', 
  'admin@zekapark.com'
];

export class ProductionAuthService {
  
  /**
   * Email'in demo hesap olup olmadığını kontrol eder
   */
  static isDemoEmail(email: string): boolean {
    return DEMO_EMAILS.includes(email.toLowerCase());
  }

  /**
   * Production login - Demo hesapları reddeder
   */
  static async login(email: string, password: string): Promise<UserCredential> {
    // Demo hesap kontrolü
    if (this.isDemoEmail(email)) {
      throw new AuthError({
        code: 'auth/demo-account-disabled',
        message: 'Demo hesaplar production modunda kullanılamaz. Lütfen kendi hesabınızı oluşturun.'
      });
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      
      // Email doğrulama kontrolü
      if (!credential.user.emailVerified) {
        console.warn('Email doğrulanmamış. Kullanıcıya hatırlatma yapılabilir.');
      }
      
      return credential;
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        throw new AuthError({
          code: 'auth/invalid-login',
          message: 'E-posta veya şifre hatalı.'
        });
      }
      if (error.code === 'auth/too-many-requests') {
        throw new AuthError({
          code: 'auth/too-many-requests',
          message: 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.'
        });
      }
      throw error;
    }
  }

  /**
   * Production kayıt - Demo email'leri engeller
   */
  static async registerStudent(
    name: string,
    grade: number,
    parentEmail: string,
    password: string
  ): Promise<{ userCredential: UserCredential; profile: UserProfile }> {
    
    // Demo email kontrolü
    if (this.isDemoEmail(parentEmail)) {
      throw new AuthError({
        code: 'auth/demo-email-not-allowed',
        message: 'Bu e-posta adresi kullanılamaz. Lütfen geçerli bir e-posta girin.'
      });
    }

    const studentEmail = `${name.replace(/\s+/g, '').toLowerCase()}@student.zekapark.com`;
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, studentEmail, password);
      
      // Email verification gönder
      try {
        await sendEmailVerification(userCredential.user);
      } catch (verifyError) {
        console.warn('Verification email gönderilemedi:', verifyError);
      }

      // Firestore profil oluştur
      const profile: UserProfile = {
        id: userCredential.user.uid,
        email: studentEmail,
        name: name.trim(),
        role: 'student',
        grade,
        avatar: '🦊',
        level: 1,
        xp: 100, // Hoş geldin bonusu
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        dailyGoalMinutes: 15,
        todayMinutesSpent: 0,
        soundEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        totalPoints: 100,
        claimedStreakDays: [1],
        totalQuestionsSolved: 0,
        resolvedMistakesCount: 0,
        parentEmail: parentEmail.trim()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), profile);
      
      // Parent linkini de oluştur (varsa)
      if (parentEmail) {
        await this.linkParentToStudent(userCredential.user.uid, parentEmail);
      }

      return { userCredential, profile };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new AuthError({
          code: 'auth/email-already-in-use',
          message: 'Bu e-posta adresi zaten kayıtlı.'
        });
      }
      if (error.code === 'auth/weak-password') {
        throw new AuthError({
          code: 'auth/weak-password',
          message: 'Şifre çok zayıf. En az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.'
        });
      }
      throw error;
    }
  }

  /**
   * Parent kaydı
   */
  static async registerParent(
    parentEmail: string,
    password: string,
    studentName: string,
    studentGrade: number
  ): Promise<{ userCredential: UserCredential; profile: UserProfile }> {
    
    if (this.isDemoEmail(parentEmail)) {
      throw new AuthError({
        code: 'auth/demo-email-not-allowed',
        message: 'Bu e-posta adresi kullanılamaz.'
      });
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, parentEmail, password);
      
      try {
        await sendEmailVerification(userCredential.user);
      } catch (verifyError) {
        console.warn('Verification email gönderilemedi:', verifyError);
      }

      const profile: UserProfile = {
        id: userCredential.user.uid,
        email: parentEmail,
        name: parentEmail.split('@')[0],
        role: 'parent',
        avatar: '👨‍👩‍👧',
        level: 1,
        xp: 0,
        streak: 1,
        lastActiveDate: new Date().toISOString(),
        dailyGoalMinutes: 0,
        todayMinutesSpent: 0,
        soundEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        linkedStudentIds: []
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), profile);

      // Student da oluştur
      const studentResult = await this.registerStudent(studentName, studentGrade, parentEmail, password);
      
      // Linkleme
      await this.linkParentToStudent(studentResult.userCredential.user.uid, parentEmail);
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        linkedStudentIds: [studentResult.userCredential.user.uid]
      });

      return { userCredential, profile };
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new AuthError({
          code: 'auth/email-already-in-use',
          message: 'Bu e-posta adresi zaten kayıtlı.'
        });
      }
      throw error;
    }
  }

  /**
   * Parent-Student bağlantısı kurar
   */
  static async linkParentToStudent(studentUid: string, parentEmail: string): Promise<void> {
    try {
      // Parent UID bul
      const parentQuery = await getDoc(doc(db, 'users_by_email', parentEmail));
      if (parentQuery.exists()) {
        const parentUid = parentQuery.data().uid;
        await updateDoc(doc(db, 'users', studentUid), {
          linkedParentId: parentUid,
          parentEmail
        });
      }
    } catch (error) {
      console.warn('Parent linking failed:', error);
    }
  }

  /**
   * Şifre sıfırlama maili gönderir
   */
  static async resetPassword(email: string): Promise<void> {
    if (this.isDemoEmail(email)) {
      throw new AuthError({
        code: 'auth/demo-account-disabled',
        message: 'Demo hesaplar için şifre sıfırlama yapılamaz.'
      });
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Güvenlik nedeniyle aynı mesajı göster
        return;
      }
      throw error;
    }
  }

  /**
   * Logout
   */
  static async logout(): Promise<void> {
    safeStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase signOut failed:', error);
    }
  }

  /**
   * Session kurar
   */
  static setSession(user: UserProfile): void {
    safeStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  /**
   * Session kontrolü
   */
  static isAuthenticated(): boolean {
    const session = safeStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
    const user = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return session === 'true' && user !== null;
  }

  /**
   * Mevcut kullanıcıyı getirir
   */
  static getCurrentUser(): UserProfile | null {
    const userData = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    
    // Demo hesapları asla döndürme
    if (user.email && this.isDemoEmail(user.email)) {
      this.logout();
      return null;
    }
    
    return user;
  }
}

// AuthError wrapper
class AuthError extends Error {
  code: string;
  
  constructor({ code, message }: { code: string; message: string }) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}
