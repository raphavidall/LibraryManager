import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type UserRole = "admin" | "teacher" | "student" | "visitor";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().$type<UserRole>(),
  name: text("name").notNull(),
  email: text("email").notNull(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  author: text("author").notNull(),
  isbn: text("isbn").notNull().unique(),
  quantity: integer("quantity").notNull().default(1),
  available: integer("available").notNull().default(1),
});

export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  bookId: integer("book_id").references(() => books.id),
  loanDate: timestamp("loan_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  returnDate: timestamp("return_date"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
});

export const insertBookSchema = createInsertSchema(books);
export const insertLoanSchema = createInsertSchema(loans, {
  userId: (schema) => schema.userId.positive(),
  bookId: (schema) => schema.bookId.positive(),
}).extend({
  loanDate: z.string(),
  dueDate: z.string(),
  returnDate: z.string().nullable().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Book = typeof books.$inferSelect;
export type Loan = typeof loans.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;
export type InsertLoan = z.infer<typeof insertLoanSchema>;
