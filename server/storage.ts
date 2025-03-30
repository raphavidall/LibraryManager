
import { users, books, loans, type User, type Book, type Loan, type InsertUser, type InsertBook, type InsertLoan } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  
  createBook(book: InsertBook): Promise<Book>;
  getBook(id: number): Promise<Book | undefined>;
  getAllBooks(): Promise<Book[]>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  
  createLoan(loan: InsertLoan): Promise<Loan>;
  getLoan(id: number): Promise<Loan | undefined>;
  getAllLoans(): Promise<Loan[]>;
  updateLoan(id: number, loan: Partial<InsertLoan>): Promise<Loan>;
  
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private books: Map<number, Book>;
  private loans: Map<number, Loan>;
  private currentId: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.loans = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Dataset de livros
    const libraryDataset = [
      { title: "Dom Casmurro", author: "Machado de Assis", isbn: "9788535910682", quantity: 5 },
      { title: "O Pequeno Príncipe", author: "Antoine de Saint-Exupéry", isbn: "9788574068794", quantity: 3 },
      { title: "1984", author: "George Orwell", isbn: "9788535914849", quantity: 4 },
      { title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", isbn: "9788535910699", quantity: 3 },
      { title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", isbn: "9788533613379", quantity: 2 },
      { title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", isbn: "9788532530783", quantity: 5 },
      { title: "Cem Anos de Solidão", author: "Gabriel García Márquez", isbn: "9788535914849", quantity: 3 },
      { title: "O Alquimista", author: "Paulo Coelho", isbn: "9788576655299", quantity: 4 },
      { title: "A Metamorfose", author: "Franz Kafka", isbn: "9788535910699", quantity: 2 },
      { title: "O Código Da Vinci", author: "Dan Brown", isbn: "9788532525781", quantity: 3 },
      { title: "A Revolução dos Bichos", author: "George Orwell", isbn: "9788535909555", quantity: 4 },
      { title: "O Hobbit", author: "J.R.R. Tolkien", isbn: "9788595084742", quantity: 3 },
      { title: "A Culpa é das Estrelas", author: "John Green", isbn: "9788580573466", quantity: 4 },
      { title: "O Nome do Vento", author: "Patrick Rothfuss", isbn: "9788599296363", quantity: 2 },
      { title: "O Silmarillion", author: "J.R.R. Tolkien", isbn: "9788595084759", quantity: 3 }
    ];

    // Adicionar livros do dataset
    for (const book of libraryDataset) {
      this.createBook(book);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async createBook(insertBook: InsertBook): Promise<Book> {
    const id = this.currentId++;
    const book: Book = { ...insertBook, id };
    this.books.set(id, book);
    return book;
  }

  async getBook(id: number): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getAllBooks(): Promise<Book[]> {
    return Array.from(this.books.values());
  }

  async updateBook(id: number, bookData: Partial<InsertBook>): Promise<Book> {
    const book = await this.getBook(id);
    if (!book) throw new Error("Book not found");
    const updatedBook = { ...book, ...bookData };
    this.books.set(id, updatedBook);
    return updatedBook;
  }

  async deleteBook(id: number): Promise<void> {
    this.books.delete(id);
  }

  async createLoan(insertLoan: InsertLoan): Promise<Loan> {
    const id = this.currentId++;
    const loan: Loan = { ...insertLoan, id };
    this.loans.set(id, loan);
    return loan;
  }

  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async getAllLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  async updateLoan(id: number, loanData: Partial<InsertLoan>): Promise<Loan> {
    const loan = await this.getLoan(id);
    if (!loan) throw new Error("Loan not found");
    const updatedLoan = { ...loan, ...loanData };
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }
}

export const storage = new MemStorage();
