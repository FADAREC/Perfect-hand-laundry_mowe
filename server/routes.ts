import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { emailService } from "./email";
import rateLimit from "express-rate-limit";
import { authenticate } from "./auth.middleware";
import { authorize } from "./authorize.middleware";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Rate Limiter: 5 attempts per 10 minutes
  const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max: 5, 
    message: { message: "Too many login attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // -----------------------------------------
  // POST /api/register  →  Create new user
  // -----------------------------------------
  app.post("/api/register", async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    // check if user exists
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await storage.createUser({
      username,
      password: hashed,
      role: "customer",
      isGuest: false,
      isVerified: false
    });

    return res.json({
      message: "User registered successfully",
      user
    });
  });

  // -----------------------------------------
  // POST /api/login → Authenticate user
  // -----------------------------------------
  app.post("/api/login", loginLimiter, async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // sign a JWT
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ message: "Login successful", token, user });
  });

  // -----------------------------------------
  // GET /api/auth/verify → Verify JWT token
  // -----------------------------------------
  app.get("/api/auth/verify", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        return res.status(401).json({ message: "No authorization header" });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        return res.status(500).json({ message: "Server configuration error" });
      }

      try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const user = await storage.getUser(payload.userId);

        if (!user) {
          return res.status(401).json({ message: "User not found" });
        }

        return res.json({
          message: "Token valid",
          user,
        });
      } catch (e) {
        return res.status(401).json({ message: "Invalid token" });
      }
    } catch (error) {
      console.error("[Auth Verify Error]", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // -----------------------------------------
  // POST /api/logout → Logout user
  // -----------------------------------------
  app.post("/api/logout", (req: Request, res: Response) => {
    return res.json({ message: "Logout successful" });
  });

  // -----------------------------------------
  // POST /api/bookings → Create a booking
  // -----------------------------------------
  app.post("/api/bookings", async (req: Request, res: Response) => {
    console.log("[Booking Request] Received payload:", JSON.stringify(req.body, null, 2));
    
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        pickupAddress,
        deliveryAddress,
        branchId,
        serviceType,
        isExpress,
        preferredPickupDate,
        preferredPickupTime,
        notes,
        userId,
        termsAccepted,
      } = req.body;

      // Validate required fields
      if (!customerName || !customerPhone || !customerEmail || !pickupAddress || !serviceType) {
        return res.status(400).json({
          message: "Missing required booking fields",
        });
      }

      if (!termsAccepted) {
        return res.status(400).json({
          message: "You must accept the terms and conditions",
        });
      }

      let validUserId = null;

      if (userId) {
        // Check if this user actually exists in the DB
        const userExists = await storage.getUser(userId);
        
        if (userExists) {
          validUserId = userId;
        } else {
          console.warn(`[Booking Warning] User ID ${userId} not found in DB. Processing as Guest.`);
        }
      }

      // Create the booking
      const booking = await storage.createBooking({
        customerName,
        customerPhone,
        customerEmail,
        pickupAddress,
        deliveryAddress: deliveryAddress || null,
        branchId: branchId || null,
        serviceType,
        isExpress: !!isExpress,
        preferredPickupDate,
        preferredPickupTime,
        notes: notes || "",
        status: "pending",
        paymentStatus: "pending",
        termsAccepted: !!termsAccepted,
        userId: validUserId,
      });

      console.log("[Booking Success] Created booking:", booking.id);

      // Send confirmation email
      try {
        await emailService.sendBookingConfirmation(booking);
        console.log("[Booking Email] Confirmation sent to:", customerEmail);
      } catch (emailErr) {
        console.error("[Booking Email Error]", emailErr);
      }

      return res.status(201).json({
        message: "Booking created successfully",
        booking,
        trackingUrl: `/tracking/${booking.id}`,
      });

    } catch (error) {
      console.error("[Booking Error]", error);
      return res.status(500).json({
        message: "Failed to create booking",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  });

  // -------------------------------------------
  // PATCH /api/bookings/:id -> Patch booking
  // -------------------------------------------
  app.patch("/api/bookings/:id", authenticate, authorize("admin"), async (req, res) => {
    const { id } = req.params; 
    const { items, notes, status } = req.body;

    let totalItems = 0;
    let estimatedPrice = 0;

    if (items && Array.isArray(items)) {
      totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      estimatedPrice = items.reduce((sum, item) => sum + (Number(item.pricePerItem) * item.quantity), 0);
    }

    const updated = await storage.updateBooking(id, { 
      items, 
      notes, 
      status,
      totalItems: totalItems.toString(),
      estimatedPrice: estimatedPrice.toString(),
      finalPrice: estimatedPrice.toString()
    });

    return res.json(updated);
  });

  // -----------------------------------------
  // GET /api/bookings/user/:userId → Get user bookings
  // -----------------------------------------
  app.get("/api/bookings/user/:userId", async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }
    const bookings = await storage.getBookingsByUserId(userId);
    return res.json(bookings);
  });

  // -----------------------------------------
  // GET /api/bookings/:id → Get single booking
  // -----------------------------------------
  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    const booking = await storage.getBooking(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    return res.json(booking);
  });

  // -----------------------------------------
  // GET /api/bookings → Get all bookings (Admin)
  // -----------------------------------------
  // REFACTORED: Removed manual auth check; middleware handles it.
  app.get("/api/bookings", authenticate, authorize("admin"), async (req: Request, res: Response) => {
    const bookings = await storage.getAllBookings();
    return res.json(bookings);
  });

  // -----------------------------------------
  // PATCH /api/bookings/:id/status → Update booking status
  // -----------------------------------------
  // REFACTORED: Removed manual auth check; middleware handles it.
  app.patch("/api/bookings/:id/status", authenticate, authorize("admin"), async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    // Get current booking to save previous status
    const currentBooking = await storage.getBooking(id);
    if (!currentBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const previousStatus = currentBooking.status;

    // Update status
    const updated = await storage.updateBookingStatus(id, status);
    if (!updated) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Send status update email
    try {
      await emailService.sendStatusUpdate(updated, previousStatus);
      console.log(`[Status Update Email] Sent to: ${updated.customerEmail}`);
    } catch (emailErr) {
      console.error("[Status Update Email Error]", emailErr);
    }

    return res.json(updated);
  });
  
  // --------------------------------------------------
  // POST /api/bookings/:id/invoice -> Admin creates invoice
  // --------------------------------------------------
  app.post("/api/bookings/:id/invoice", async (req, res) => {
    const { id } = req.params;
    const { items, notes } = req.body;
  
    console.log("[Invoice] Creating invoice for booking:", id);
    console.log("[Invoice] Items received:", items);
  
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        message: "Items are required to generate invoice" 
      });
    }
  
    try {
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
  
      // Calculate totals from items
      const subtotal = items.reduce((sum: number, item: any) => 
        sum + (Number(item.qty) * Number(item.price)), 0
      );
      
      const taxRate = 0.075; 
      const tax = subtotal * taxRate;
      const total = subtotal + tax;
  
      console.log("[Invoice] Calculated totals:", { subtotal, tax, total });
  
      // Transform items to proper format
      const invoiceItems = items.map((item: any) => ({
        garmentType: item.name,
        quantity: item.qty,
        pricePerItem: item.price
      }));
  
      // Update booking with items and final price
      const updatedBooking = await storage.updateBooking(id, {
        items: invoiceItems,
        finalPrice: total.toFixed(2),
        estimatedPrice: total.toFixed(2),
        paymentStatus: "pending"
      });
  
      console.log("[Invoice] Updated booking with finalPrice:", updatedBooking.finalPrice);
  
      // Create invoice in database
      const invoice = await storage.createInvoice({
        bookingId: booking.id,
        items: invoiceItems,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes: notes || "Thank you for your business!",
        invoiceHtml: "",
      });
  
      console.log("[Invoice] Invoice created in DB:", invoice.id);
  
      // Send invoice notification email
      try {
        const freshBooking = await storage.getBooking(id);
        if (freshBooking) {
          await emailService.sendInvoiceNotification(freshBooking);
          console.log("[Invoice] Email sent to:", booking.customerEmail);
        }
      } catch (emailErr) {
        console.error("[Invoice] Email error (non-fatal):", emailErr);
        // Don't fail the request if email fails
      }
  
      return res.status(201).json({
        message: "Invoice created successfully",
        invoice,
        booking: updatedBooking
      });
  
    } catch (error) {
      console.error("[Invoice] Error:", error);
      return res.status(500).json({ 
        message: "Failed to create invoice",
        error: process.env.NODE_ENV === "development" ? error : undefined
      });
    }
  });

  // -----------------------------------------
  // GET /api/invoices/booking/:bookingId → Get invoice for a booking
  // -----------------------------------------
  app.get("/api/invoices/booking/:bookingId", async (req: Request, res: Response) => {
    const { bookingId } = req.params;
    
    try {
      const invoice = await storage.getInvoiceByBookingId(bookingId);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      return res.json(invoice);
    } catch (error) {
      console.error("[Get Invoice Error]", error);
      return res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  // --------------------------------------------------
  // POST /api/pos/walk-in -> One-click flow for physical drop-offs
  // --------------------------------------------------
  app.post("/api/pos/walk-in", authenticate, authorize("admin"), async (req, res) => {
    try {
      const { 
        customerName, 
        customerPhone, 
        customerEmail, 
        items, 
        notes 
      } = req.body;

      const subtotal = items.reduce((acc: number, item: any) => 
        acc + (Number(item.pricePerItem) * Number(item.quantity)), 0
      );

      const booking = await storage.createBooking({
        customerName,
        customerPhone,
        customerEmail: customerEmail || "",
        pickupAddress: "BRANCH DROP-OFF", 
        serviceType: "standard", 
        items: items,
        totalItems: items.reduce((acc: number, i: any) => acc + i.quantity, 0).toString(),
        estimatedPrice: subtotal.toString(),
        finalPrice: subtotal.toString(),
        status: "confirmed", 
        paymentStatus: "pending",
        termsAccepted: true,
        isExpress: false,
      } as any);

      const tax = subtotal * 0.05;
      const total = subtotal + tax;

      const invoice = await storage.createInvoice({
        bookingId: booking.id,
        items: items,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        notes: notes || "Walk-in Drop-off",
      });

      return res.json({
        message: "Walk-in order created successfully",
        bookingId: booking.id,
        invoiceId: invoice.id,
        total: total.toFixed(2)
      });

    } catch (error) {
      console.error("Walk-in Error:", error);
      return res.status(500).json({ message: "Failed to process walk-in" });
    }
  });

  // -----------------------------------------
  // GET /api/branches → Get active branches
  // -----------------------------------------
  app.get("/api/branches", async (req: Request, res: Response) => {
    try {
      const branches = await storage.getActiveBranches();
      return res.json(branches);
    } catch (error) {
      console.error("[Branches Error]", error);
      return res.status(500).json({ message: "Failed to fetch branches" });
    }
  });

  // -----------------------------------------
  // POST /api/admin/register → Super Admin creates new admin
  // -----------------------------------------
  // REFACTORED: Removed manual auth check; middleware handles it.
  app.post("/api/admin/register", authenticate, authorize("super_admin"), async (req: Request, res: Response) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing username or password" });
    }

    // Check if user exists
    const existing = await storage.getUserByUsername(username);
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create admin user
    const newAdmin = await storage.createUser({
      username,
      password: hashed,
      email: email || null,
      role: "admin",
      isGuest: false,
      isVerified: true,
    });

    return res.json({
      message: "Admin registered successfully",
      user: newAdmin,
    });
  });

  return httpServer;
}
