import db from './db';
import { randomUUID } from 'crypto';
import type {
  User, InsertUser,
  Subject, InsertSubject,
  Chapter, InsertChapter,
  Content, InsertContent,
  QuizQuestion, InsertQuizQuestion,
  Resource, InsertResource,
  Plan, InsertPlan,
  Settings, InsertSettings,
  Update, InsertUpdate
} from '@shared/schema';

export interface IStorage {
  getUser(id: string): User | undefined;
  getUserByUsername(username: string): User | undefined;
  createUser(user: InsertUser): User;
  updateUser(id: string, updates: Partial<InsertUser>): User | undefined;
  deleteUser(id: string): boolean;
  getAllUsers(): User[];
  
  getSubject(id: string): Subject | undefined;
  getAllSubjects(): Subject[];
  createSubject(subject: InsertSubject): Subject;
  updateSubject(id: string, updates: Partial<InsertSubject>): Subject | undefined;
  deleteSubject(id: string): boolean;
  
  getChaptersBySubject(subjectId: string): Chapter[];
  getChapter(id: string): Chapter | undefined;
  createChapter(chapter: InsertChapter): Chapter;
  updateChapter(id: string, updates: Partial<InsertChapter>): Chapter | undefined;
  deleteChapter(id: string): boolean;
  
  getContentByChapter(chapterId: string): Content[];
  getContent(id: string): Content | undefined;
  createContent(content: InsertContent): Content;
  updateContent(id: string, updates: Partial<InsertContent>): Content | undefined;
  deleteContent(id: string): boolean;
  
  getQuestionsByContent(contentId: string): QuizQuestion[];
  getQuizQuestion(id: string): QuizQuestion | undefined;
  createQuizQuestion(question: InsertQuizQuestion): QuizQuestion;
  updateQuizQuestion(id: string, updates: Partial<InsertQuizQuestion>): QuizQuestion | undefined;
  deleteQuizQuestion(id: string): boolean;
  
  getAllResources(): Resource[];
  getResource(id: string): Resource | undefined;
  createResource(resource: InsertResource): Resource;
  updateResource(id: string, updates: Partial<InsertResource>): Resource | undefined;
  deleteResource(id: string): boolean;
  
  getAllPlans(): Plan[];
  getPlan(id: string): Plan | undefined;
  updatePlan(id: string, updates: Partial<InsertPlan>): Plan | undefined;
  
  getSettings(): Settings | undefined;
  updateSettings(updates: InsertSettings): Settings;
  
  getAllUpdates(): Update[];
  getUpdate(id: string): Update | undefined;
  createUpdate(update: InsertUpdate): Update;
  deleteUpdate(id: string): boolean;
}

export class SQLiteStorage implements IStorage {
  getUser(id: string): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return undefined;
    return { ...row, isAdmin: Boolean(row.isAdmin) };
  }

  getUserByUsername(username: string): User | undefined {
    const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!row) return undefined;
    return { ...row, isAdmin: Boolean(row.isAdmin) };
  }

  createUser(user: InsertUser): User {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (id, username, password, validUntil, isAdmin)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, user.username, user.password, user.validUntil, user.isAdmin ? 1 : 0);
    return this.getUser(id)!;
  }

  updateUser(id: string, updates: Partial<InsertUser>): User | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.password !== undefined) {
      fields.push('password = ?');
      values.push(updates.password);
    }
    if (updates.validUntil !== undefined) {
      fields.push('validUntil = ?');
      values.push(updates.validUntil);
    }
    
    if (fields.length === 0) return this.getUser(id);
    
    values.push(id);
    db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getUser(id);
  }

  deleteUser(id: string): boolean {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getAllUsers(): User[] {
    const rows = db.prepare('SELECT * FROM users ORDER BY username').all() as any[];
    return rows.map(row => ({ ...row, isAdmin: Boolean(row.isAdmin) }));
  }

  getSubject(id: string): Subject | undefined {
    return db.prepare('SELECT * FROM subjects WHERE id = ?').get(id) as Subject;
  }

  getAllSubjects(): Subject[] {
    return db.prepare('SELECT * FROM subjects ORDER BY name').all() as Subject[];
  }

  createSubject(subject: InsertSubject): Subject {
    const id = randomUUID();
    db.prepare('INSERT INTO subjects (id, name) VALUES (?, ?)').run(id, subject.name);
    return this.getSubject(id)!;
  }

  updateSubject(id: string, updates: Partial<InsertSubject>): Subject | undefined {
    if (updates.name) {
      db.prepare('UPDATE subjects SET name = ? WHERE id = ?').run(updates.name, id);
    }
    return this.getSubject(id);
  }

  deleteSubject(id: string): boolean {
    const result = db.prepare('DELETE FROM subjects WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getChaptersBySubject(subjectId: string): Chapter[] {
    return db.prepare('SELECT * FROM chapters WHERE subjectId = ? ORDER BY orderIndex').all(subjectId) as Chapter[];
  }

  getChapter(id: string): Chapter | undefined {
    return db.prepare('SELECT * FROM chapters WHERE id = ?').get(id) as Chapter;
  }

  createChapter(chapter: InsertChapter): Chapter {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO chapters (id, subjectId, name, orderIndex)
      VALUES (?, ?, ?, ?)
    `).run(id, chapter.subjectId, chapter.name, chapter.orderIndex);
    return this.getChapter(id)!;
  }

  updateChapter(id: string, updates: Partial<InsertChapter>): Chapter | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.orderIndex !== undefined) {
      fields.push('orderIndex = ?');
      values.push(updates.orderIndex);
    }
    
    if (fields.length === 0) return this.getChapter(id);
    
    values.push(id);
    db.prepare(`UPDATE chapters SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getChapter(id);
  }

  deleteChapter(id: string): boolean {
    const result = db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getContentByChapter(chapterId: string): Content[] {
    return db.prepare('SELECT * FROM content WHERE chapterId = ? ORDER BY orderIndex').all(chapterId) as Content[];
  }

  getContent(id: string): Content | undefined {
    return db.prepare('SELECT * FROM content WHERE id = ?').get(id) as Content;
  }

  createContent(content: InsertContent): Content {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO content (id, chapterId, type, title, url, orderIndex)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, content.chapterId, content.type, content.title, content.url || null, content.orderIndex);
    return this.getContent(id)!;
  }

  updateContent(id: string, updates: Partial<InsertContent>): Content | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.url !== undefined) {
      fields.push('url = ?');
      values.push(updates.url);
    }
    if (updates.orderIndex !== undefined) {
      fields.push('orderIndex = ?');
      values.push(updates.orderIndex);
    }
    
    if (fields.length === 0) return this.getContent(id);
    
    values.push(id);
    db.prepare(`UPDATE content SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getContent(id);
  }

  deleteContent(id: string): boolean {
    const result = db.prepare('DELETE FROM content WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getQuestionsByContent(contentId: string): QuizQuestion[] {
    return db.prepare('SELECT * FROM quiz_questions WHERE contentId = ? ORDER BY orderIndex').all(contentId) as QuizQuestion[];
  }

  getQuizQuestion(id: string): QuizQuestion | undefined {
    return db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(id) as QuizQuestion | undefined;
  }

  createQuizQuestion(question: InsertQuizQuestion): QuizQuestion {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO quiz_questions (id, contentId, question, options, correctAnswer, imageUrl, orderIndex)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, question.contentId, question.question, question.options, question.correctAnswer, question.imageUrl || null, question.orderIndex);
    return db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(id) as QuizQuestion;
  }

  updateQuizQuestion(id: string, updates: Partial<InsertQuizQuestion>): QuizQuestion | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.question !== undefined) {
      fields.push('question = ?');
      values.push(updates.question);
    }
    if (updates.options !== undefined) {
      fields.push('options = ?');
      values.push(updates.options);
    }
    if (updates.correctAnswer !== undefined) {
      fields.push('correctAnswer = ?');
      values.push(updates.correctAnswer);
    }
    if (updates.imageUrl !== undefined) {
      fields.push('imageUrl = ?');
      values.push(updates.imageUrl || null);
    }
    if (updates.orderIndex !== undefined) {
      fields.push('orderIndex = ?');
      values.push(updates.orderIndex);
    }
    
    if (fields.length === 0) return db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(id) as QuizQuestion;
    
    values.push(id);
    db.prepare(`UPDATE quiz_questions SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return db.prepare('SELECT * FROM quiz_questions WHERE id = ?').get(id) as QuizQuestion;
  }

  deleteQuizQuestion(id: string): boolean {
    const result = db.prepare('DELETE FROM quiz_questions WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getAllResources(): Resource[] {
    return db.prepare('SELECT * FROM resources ORDER BY title').all() as Resource[];
  }

  getResource(id: string): Resource | undefined {
    return db.prepare('SELECT * FROM resources WHERE id = ?').get(id) as Resource | undefined;
  }

  createResource(resource: InsertResource): Resource {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO resources (id, title, description, url, type, category)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, resource.title, resource.description || null, resource.url, resource.type, resource.category || null);
    return this.getResource(id)!;
  }

  updateResource(id: string, updates: Partial<InsertResource>): Resource | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }
    if (updates.url !== undefined) {
      fields.push('url = ?');
      values.push(updates.url);
    }
    if (updates.type !== undefined) {
      fields.push('type = ?');
      values.push(updates.type);
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category || null);
    }
    
    if (fields.length === 0) return this.getResource(id);
    
    values.push(id);
    db.prepare(`UPDATE resources SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getResource(id);
  }

  deleteResource(id: string): boolean {
    const result = db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getAllPlans(): Plan[] {
    return db.prepare('SELECT * FROM plans ORDER BY durationMonths').all() as Plan[];
  }

  getPlan(id: string): Plan | undefined {
    return db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan | undefined;
  }

  updatePlan(id: string, updates: Partial<InsertPlan>): Plan | undefined {
    const fields: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.durationMonths !== undefined) {
      fields.push('durationMonths = ?');
      values.push(updates.durationMonths);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.razorpayLink !== undefined) {
      fields.push('razorpayLink = ?');
      values.push(updates.razorpayLink);
    }
    
    if (fields.length === 0) return this.getPlan(id);
    
    values.push(id);
    db.prepare(`UPDATE plans SET ${fields.join(', ')} WHERE id = ?`).run(...values);
    return this.getPlan(id);
  }

  getSettings(): Settings | undefined {
    return db.prepare('SELECT * FROM settings LIMIT 1').get() as Settings | undefined;
  }

  updateSettings(updates: InsertSettings): Settings {
    const existing = this.getSettings();
    const now = new Date().toISOString();
    
    if (existing) {
      db.prepare('UPDATE settings SET supportEmail = ?, updatedAt = ? WHERE id = ?')
        .run(updates.supportEmail, now, existing.id);
      return this.getSettings()!;
    } else {
      const id = randomUUID();
      db.prepare('INSERT INTO settings (id, supportEmail, updatedAt) VALUES (?, ?, ?)')
        .run(id, updates.supportEmail, now);
      return this.getSettings()!;
    }
  }

  getAllUpdates(): Update[] {
    return db.prepare('SELECT * FROM updates ORDER BY createdAt DESC').all() as Update[];
  }

  getUpdate(id: string): Update | undefined {
    return db.prepare('SELECT * FROM updates WHERE id = ?').get(id) as Update | undefined;
  }

  createUpdate(update: InsertUpdate): Update {
    const id = randomUUID();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO updates (id, title, content, createdAt) VALUES (?, ?, ?, ?)')
      .run(id, update.title, update.content, now);
    return this.getUpdate(id)!;
  }

  deleteUpdate(id: string): boolean {
    const result = db.prepare('DELETE FROM updates WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

export const storage = new SQLiteStorage();
