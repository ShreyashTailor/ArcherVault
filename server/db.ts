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

  CREATE TABLE IF NOT EXISTS plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    durationMonths INTEGER NOT NULL,
    price INTEGER NOT NULL,
    razorpayLink TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    supportEmail TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS updates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL
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

  const existingPlans = db.prepare('SELECT COUNT(*) as count FROM plans').get() as { count: number };
  if (existingPlans.count === 0) {
    const plans = [
      { id: randomUUID(), name: '1 Month Plan', durationMonths: 1, price: 500, razorpayLink: 'https://razorpay.me/@yourbusiness' },
      { id: randomUUID(), name: '6 Months Plan', durationMonths: 6, price: 2000, razorpayLink: 'https://razorpay.me/@yourbusiness' },
      { id: randomUUID(), name: '1 Year Plan', durationMonths: 12, price: 3000, razorpayLink: 'https://razorpay.me/@yourbusiness' }
    ];
    
    const insertPlan = db.prepare(`
      INSERT INTO plans (id, name, durationMonths, price, razorpayLink)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    for (const plan of plans) {
      insertPlan.run(plan.id, plan.name, plan.durationMonths, plan.price, plan.razorpayLink);
    }
    
    console.log('Plans seeded successfully');
  }

  const existingSettings = db.prepare('SELECT * FROM settings LIMIT 1').get();
  if (!existingSettings) {
    const id = randomUUID();
    db.prepare('INSERT INTO settings (id, supportEmail, updatedAt) VALUES (?, ?, ?)')
      .run(id, 'support@archer.com', new Date().toISOString());
    console.log('Settings seeded successfully');
  }
}

seedAdmin().catch(console.error);

export default db;
