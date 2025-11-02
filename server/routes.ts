import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import bcrypt from "bcryptjs";
import multer from "multer";
import { Catbox } from "node-catbox";
import { Readable } from "stream";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertSubjectSchema,
  insertChapterSchema,
  insertContentSchema,
  insertQuizQuestionSchema,
  insertResourceSchema,
} from "@shared/schema";

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const user = storage.getUser(req.session.userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'User not found' });
  }

  const today = new Date().toISOString().split('T')[0];
  if (user.validUntil < today) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'Access expired' });
  }

  next();
}

function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm',
      'application/pdf'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only videos (MP4, MOV, AVI, MKV, WEBM) and PDFs are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'archer-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.post('/api/upload', isAuthenticated, isAdmin, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large', details: 'Maximum file size is 500MB' });
          }
          return res.status(400).json({ error: 'Upload error', details: err.message });
        }
        return res.status(400).json({ error: 'Invalid file', details: err.message });
      }
      next();
    });
  }, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const catbox = new Catbox();
      const stream = Readable.from(req.file.buffer);
      
      const uploadUrl = await catbox.uploadFileStream({
        stream,
        filename: req.file.originalname,
      });
      
      res.json({ url: uploadUrl });
    } catch (error: any) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'File upload failed', details: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const today = new Date().toISOString().split('T')[0];
      if (user.validUntil < today) {
        return res.status(401).json({ error: 'Access expired' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;

      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
        validUntil: user.validUntil,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/me', isAuthenticated, (req, res) => {
    const user = storage.getUser(req.session.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin,
      validUntil: user.validUntil,
    });
  });

  app.get('/api/admin/users', isAuthenticated, isAdmin, (req, res) => {
    const users = storage.getAllUsers().map(u => ({
      id: u.id,
      username: u.username,
      validUntil: u.validUntil,
      isAdmin: u.isAdmin,
    }));
    res.json(users);
  });

  app.post('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(data.password, 10);
      
      const user = storage.createUser({
        ...data,
        password: hashedPassword,
      });

      res.json({
        id: user.id,
        username: user.username,
        validUntil: user.validUntil,
        isAdmin: user.isAdmin,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/users/:id', isAuthenticated, isAdmin, (req, res) => {
    const user = storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ error: 'Cannot delete admin user' });
    }

    storage.deleteUser(req.params.id);
    res.json({ success: true });
  });

  app.put('/api/admin/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { username, currentPassword, newPassword } = req.body;
      const user = storage.getUser(req.session.userId!);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password required' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
          return res.status(401).json({ error: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        storage.updateUser(user.id, {
          username: username || user.username,
          password: hashedPassword,
          validUntil: user.validUntil,
          isAdmin: user.isAdmin,
        });
      } else if (username && username !== user.username) {
        storage.updateUser(user.id, {
          username,
          password: user.password,
          validUntil: user.validUntil,
          isAdmin: user.isAdmin,
        });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/admin/subjects', isAuthenticated, isAdmin, (req, res) => {
    const subjects = storage.getAllSubjects();
    res.json(subjects);
  });

  app.post('/api/admin/subjects', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertSubjectSchema.parse(req.body);
      const subject = storage.createSubject(data);
      res.json(subject);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/subjects/:id', isAuthenticated, isAdmin, (req, res) => {
    storage.deleteSubject(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/subjects/:id/chapters', isAuthenticated, isAdmin, (req, res) => {
    const chapters = storage.getChaptersBySubject(req.params.id);
    res.json(chapters);
  });

  app.post('/api/admin/chapters', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertChapterSchema.parse(req.body);
      const chapter = storage.createChapter(data);
      res.json(chapter);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/chapters/:id', isAuthenticated, isAdmin, (req, res) => {
    storage.deleteChapter(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/chapters/:id/content', isAuthenticated, isAdmin, (req, res) => {
    const content = storage.getContentByChapter(req.params.id);
    res.json(content);
  });

  app.post('/api/admin/content', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertContentSchema.parse(req.body);
      const content = storage.createContent(data);
      res.json(content);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/admin/content/:id', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertContentSchema.partial().parse(req.body);
      const content = storage.updateContent(req.params.id, data);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(content);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/content/:id', isAuthenticated, isAdmin, (req, res) => {
    storage.deleteContent(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/admin/content/:id/questions', isAuthenticated, isAdmin, (req, res) => {
    const questions = storage.getQuestionsByContent(req.params.id);
    res.json(questions);
  });

  app.post('/api/admin/questions', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertQuizQuestionSchema.parse(req.body);
      const question = storage.createQuizQuestion(data);
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/admin/questions/:id', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertQuizQuestionSchema.partial().parse(req.body);
      const question = storage.updateQuizQuestion(req.params.id, data);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/questions/:id', isAuthenticated, isAdmin, (req, res) => {
    storage.deleteQuizQuestion(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/subjects', isAuthenticated, (req, res) => {
    const subjects = storage.getAllSubjects();
    const subjectsWithCounts = subjects.map(subject => {
      const chapters = storage.getChaptersBySubject(subject.id);
      return {
        ...subject,
        chapterCount: chapters.length
      };
    });
    res.json(subjectsWithCounts);
  });

  app.get('/api/subjects/:id/chapters', isAuthenticated, (req, res) => {
    const chapters = storage.getChaptersBySubject(req.params.id);
    res.json(chapters);
  });

  app.get('/api/chapters/:id/content', isAuthenticated, (req, res) => {
    const content = storage.getContentByChapter(req.params.id);
    res.json(content);
  });

  app.get('/api/content/:id/questions', isAuthenticated, (req, res) => {
    const questions = storage.getQuestionsByContent(req.params.id);
    res.json(questions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
    })));
  });

  app.post('/api/questions/:id/submit', isAuthenticated, (req, res) => {
    try {
      const answerSchema = z.object({
        answer: z.string().min(1),
      });
      
      const { answer } = answerSchema.parse(req.body);
      const questionId = req.params.id;
      
      const question = storage.getQuizQuestion(questionId);
      
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      
      const options = JSON.parse(question.options);
      const answerIndex = options.indexOf(answer);
      const isCorrect = answerIndex === question.correctAnswer;
      
      res.json({
        correct: isCorrect,
        correctAnswer: options[question.correctAnswer],
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/admin/resources', isAuthenticated, isAdmin, (req, res) => {
    const resources = storage.getAllResources();
    res.json(resources);
  });

  app.post('/api/admin/resources', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertResourceSchema.parse(req.body);
      const resource = storage.createResource(data);
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put('/api/admin/resources/:id', isAuthenticated, isAdmin, (req, res) => {
    try {
      const data = insertResourceSchema.partial().parse(req.body);
      const resource = storage.updateResource(req.params.id, data);
      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      res.json(resource);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete('/api/admin/resources/:id', isAuthenticated, isAdmin, (req, res) => {
    storage.deleteResource(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/resources', isAuthenticated, (req, res) => {
    const resources = storage.getAllResources();
    res.json(resources);
  });

  const httpServer = createServer(app);
  return httpServer;
}
