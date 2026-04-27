import { 
  type User, 
  type InsertUser, 
  type InsertInvoice, 
  type Invoice, 
  type Booking, 
  type InsertBooking,
  type Branch,
  type InsertBranch,
  bookings, 
  users, 
  invoices,
  branches 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Booking methods
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  getAllBookings(): Promise<Booking[]>;
  getBookingsByUserId(userId: string): Promise<Booking[]>;
  updateBooking(id: string, data: Partial<Booking>): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
  
  // Invoice methods
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoiceByBookingId(bookingId: string): Promise<Invoice | undefined>;
  
  // Branch methods (NEW)
  getBranch(id: string): Promise<Branch | undefined>;
  getAllBranches(): Promise<Branch[]>;
  getActiveBranches(): Promise<Branch[]>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, data: Partial<Branch>): Promise<Branch>;
}

export class DbStorage implements IStorage {
  // ===================================
  // USER METHODS
  // ===================================
  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if user exists by username first
    const existingByUsername = await this.getUserByUsername(insertUser.username);
    if (existingByUsername) return existingByUsername;

    // If email is provided, also check by email
    if (insertUser.email) {
      const existingByEmail = await this.getUserByEmail(insertUser.email);
      if (existingByEmail) return existingByEmail;
    }

    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // ===================================
  // BOOKING METHODS
  // ===================================
  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let userId = insertBooking.userId;

    // If no userId provided, find or create a guest user
    if (!userId) {
      // First, try to find existing user by email (preferred) or phone
      let existingUser: User | undefined;

      if (insertBooking.customerEmail) {
        existingUser = await this.getUserByEmail(insertBooking.customerEmail);
      }

      if (!existingUser && insertBooking.customerPhone) {
        existingUser = await this.getUserByUsername(insertBooking.customerPhone);
      }

      // If user exists, use their ID
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create a new guest user
        const newGuest = await this.createUser({
          username: insertBooking.customerPhone, // Use phone as username for guests
          password: await bcrypt.hash(`guest_${insertBooking.customerPhone}`, 10),
          email: insertBooking.customerEmail || null,
          phone: insertBooking.customerPhone,
          role: "guest",
          isGuest: true,
          isVerified: false,
        });
        userId = newGuest.id;
      }
    }

    // Now create the booking with the guaranteed valid userId
    const bookingData = {
      ...insertBooking,
      userId,
      orderNumber,
    };

    const [booking] = await db
      .insert(bookings)
      .values(bookingData as any)
      .returning();
    
    return booking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return db.query.bookings.findFirst({
      where: (bookings, { eq }) => eq(bookings.id, id),
    });
  }

  async getAllBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    return db.query.bookings.findMany({
      where: (bookings, { eq }) => eq(bookings.userId, userId),
      orderBy: (bookings, { desc }) => [desc(bookings.createdAt)],
    });
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  // ===================================
  // INVOICE METHODS
  // ===================================
  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const [invoice] = await db
      .insert(invoices)
      .values({ 
        ...insertInvoice, 
        id: `INV-${Date.now()}` // Simple ID generation
      })
      .returning();
    return invoice;
  }

  async getInvoiceByBookingId(bookingId: string): Promise<Invoice | undefined> {
    return db.query.invoices.findFirst({
      where: (invoices, { eq }) => eq(invoices.bookingId, bookingId),
    });
  }

  // ===================================
  // BRANCH METHODS (NEW)
  // ===================================
  async getBranch(id: string): Promise<Branch | undefined> {
    return db.query.branches.findFirst({
      where: (branches, { eq }) => eq(branches.id, id),
    });
  }

  async getAllBranches(): Promise<Branch[]> {
    return db.select().from(branches).orderBy(desc(branches.createdAt));
  }

  async getActiveBranches(): Promise<Branch[]> {
    return db.query.branches.findMany({
      where: (branches, { eq }) => eq(branches.isActive, true),
      orderBy: (branches, { desc }) => [desc(branches.createdAt)],
    });
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    const [branch] = await db.insert(branches).values(insertBranch).returning();
    return branch;
  }

  async updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
    const [updated] = await db
      .update(branches)
      .set(data)
      .where(eq(branches.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
