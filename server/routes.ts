import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertBookSchema, insertLoanSchema } from "@shared/schema";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireRole(roles: string[]) {
  return (req: Express.Request, res: Express.Response, next: Express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Books routes
  app.get("/api/books", requireAuth, async (req, res) => {
    const books = await storage.getAllBooks();
    res.json(books);
  });

  app.post("/api/books", requireAuth, requireRole(["admin", "teacher"]), async (req, res) => {
    const bookData = insertBookSchema.parse(req.body);
    const book = await storage.createBook(bookData);
    res.status(201).json(book);
  });

  app.put("/api/books/:id", requireAuth, requireRole(["admin", "teacher"]), async (req, res) => {
    const bookData = insertBookSchema.partial().parse(req.body);
    const book = await storage.updateBook(parseInt(req.params.id), bookData);
    res.json(book);
  });

  app.delete("/api/books/:id", requireAuth, requireRole(["admin"]), async (req, res) => {
    await storage.deleteBook(parseInt(req.params.id));
    res.sendStatus(204);
  });

  // Users routes
  app.get("/api/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Loans routes
  app.get("/api/loans", requireAuth, async (req, res) => {
    const loans = await storage.getAllLoans();
    // Filter loans for non-admin users to show only their own
    if (req.user?.role !== "admin" && req.user?.role !== "teacher") {
      const userLoans = loans.filter(loan => loan.userId === req.user?.id);
      return res.json(userLoans);
    }
    res.json(loans);
  });

  app.post("/api/loans", requireAuth, async (req, res) => {
    const loanData = insertLoanSchema.parse(req.body);
    const loan = await storage.createLoan(loanData);
    res.status(201).json(loan);
  });

  app.put("/api/loans/:id", requireAuth, requireRole(["admin", "teacher"]), async (req, res) => {
    const loanData = insertLoanSchema.partial().parse(req.body);
    const loan = await storage.updateLoan(parseInt(req.params.id), loanData);
    res.json(loan);
  });

  const httpServer = createServer(app);
  return httpServer;
}
