import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

const db = new Database('archer.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    validUntil TEXT NOT NULL,
    isAdmin INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id TEXT PRIMARY KEY,
    subjectId TEXT NOT NULL,
    name TEXT NOT NULL,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS content (
    id TEXT PRIMARY KEY,
    chapterId TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS quiz_questions (
    id TEXT PRIMARY KEY,
    contentId TEXT NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    correctAnswer INTEGER NOT NULL DEFAULT 0,
    imageUrl TEXT,
    orderIndex INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (contentId) REFERENCES content(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT NOT NULL,
    type TEXT NOT NULL,
    category TEXT
  );
`);

async function seedAdmin() {
  const existingAdmin = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('Hola123_10', 10);
    const id = randomUUID();
    db.prepare(`
      INSERT INTO users (id, username, password, validUntil, isAdmin)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, 'admin', hashedPassword, '2099-12-31', 1);
    
    console.log('Admin user seeded successfully');
  }
}

seedAdmin().catch(console.error);

export default db;
