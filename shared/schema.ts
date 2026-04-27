import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===================================
// BRANCHES TABLE (NEW)
// ===================================
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  email: text("email"),
  isActive: boolean("is_active").notNull().default(true),
  operatingHours: json("operating_hours").$type<{
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Branch = typeof branches.$inferSelect;
export type InsertBranch = typeof branches.$inferInsert;

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(2, "Branch name is required"),
  address: z.string().min(5, "Branch address is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// ===================================
// USERS TABLE (Enhanced with Roles)
// ===================================
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull().default("customer"), // 'customer', 'admin', 'super_admin', 'guest'
  isGuest: boolean("is_guest").notNull().default(false),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  role: z.enum(["customer", "admin", "super_admin", "guest"]).default("customer"),
  isGuest: z.boolean().default(false),
  isVerified: z.boolean().default(false),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ===================================
// BOOKINGS/ORDERS TABLE (Updated with branchId)
// ===================================
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  branchId: varchar("branch_id").references(() => branches.id), // NEW FIELD
  orderNumber: varchar("order_number").notNull().unique(), // e.g., "CB-2024-0001"
  
  // Customer Info
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  
  // Address Details
  pickupAddress: text("pickup_address").notNull(),
  pickupCoordinates: json("pickup_coordinates").$type<{ lat: number, lng: number }>(),
  deliveryAddress: text("delivery_address"),
  deliveryCoordinates: json("delivery_coordinates").$type<{ lat: number, lng: number }>(),
  
  // Service Details
  serviceType: text("service_type").notNull(), // 'laundry', 'dry-cleaning', 'express', etc.
  isExpress: boolean("is_express").notNull().default(false),
  preferredPickupDate: text("preferred_pickup_date"),
  preferredPickupTime: text("preferred_pickup_time"),
  
  // Items & Pricing
  items: json("items").$type<Array<{
    garmentType: string;
    quantity: number;
    pricePerItem: number;
  }>>(),
  totalItems: decimal("total_items", { precision: 10, scale: 0 }),
  estimatedPrice: decimal("estimated_price", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  
  // Payment
  paymentStatus: text("payment_status").notNull().default("pending"), // 'pending', 'paid', 'failed'
  paymentMethod: text("payment_method"), // 'transfer', 'card', 'cash'
  
  // Order Status
  status: text("status").notNull().default("pending"), // See status enum below
  
  // Additional Info
  notes: text("notes"),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  
  // Timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  pickedUpAt: timestamp("picked_up_at"),
  completedAt: timestamp("completed_at"),
  deliveredAt: timestamp("delivered_at"),
});

/**
 * Order Status Flow:
 * 1. pending        → Order placed, awaiting confirmation
 * 2. confirmed      → Order confirmed, awaiting pickup
 * 3. picked_up      → Items collected from customer
 * 4. in_progress    → Currently being cleaned
 * 5. ready          → Cleaning complete, ready for delivery
 * 6. out_for_delivery → On the way to customer
 * 7. delivered      → Order completed
 * 8. cancelled      → Order cancelled
 */

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
  pickedUpAt: true,
  completedAt: true,
  deliveredAt: true,
}).extend({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone number required"),
  customerEmail: z.string().email("Valid email is required"),
  pickupAddress: z.string().min(5, "Pickup address is required"),
  branchId: z.string().optional().nullable(), // NEW FIELD
  serviceType: z.string().min(1, "Service type is required"),
  isExpress: z.boolean().default(false),
  status: z.enum([
    "pending",
    "confirmed", 
    "picked_up",
    "in_progress",
    "ready",
    "out_for_delivery",
    "delivered",
    "cancelled"
  ]).default("pending"),
  paymentStatus: z.enum(["pending", "paid", "failed"]).default("pending"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

// ===================================
// GARMENT PRICING TABLE (For reference)
// ===================================
export const garmentPricing = pgTable("garment_pricing", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  garmentType: text("garment_type").notNull().unique(), // 'shirt', 'trouser', 'agbada', etc.
  category: text("category").notNull(), // 'standard', 'premium', 'special'
  laundryPrice: decimal("laundry_price", { precision: 10, scale: 2 }),
  dryCleanPrice: decimal("dry_clean_price", { precision: 10, scale: 2 }),
  ironingPrice: decimal("ironing_price", { precision: 10, scale: 2 }),
  expressMultiplier: decimal("express_multiplier", { precision: 3, scale: 1 }).default("4.0"), // 4x for express
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type GarmentPricing = typeof garmentPricing.$inferSelect;

// ===================================
// INVOICES TABLE
// ===================================
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey(),
  bookingId: varchar("booking_id").references(() => bookings.id),
  invoiceHtml: text("invoice_html"),
  items: json("items"),
  subtotal: decimal("subtotal"),
  tax: decimal("tax"),
  total: decimal("total"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
