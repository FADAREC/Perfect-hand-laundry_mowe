import { Booking } from "@shared/schema";

export interface EmailService {
  sendBookingConfirmation(booking: Booking): Promise<boolean>;
  sendStatusUpdate(booking: Booking, previousStatus: string): Promise<boolean>;
  sendInvoiceNotification(booking: Booking): Promise<boolean>;
}

const getTrackingUrl = (bookingId: string): string => {
  const baseUrl = process.env.BASE_URL || "https://www.caperberrylaundry.com";
  return `${baseUrl}/tracking/${bookingId}`;
};

const emailTemplates = {
  bookingConfirmation: (booking: Booking) => ({
    subject: `Booking Confirmation - Order #${booking.orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Booking Confirmation</h2>
        <p>Hi ${booking.customerName},</p>
        
        <p>Thank you for booking with us! Your order has been received and is awaiting confirmation.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${booking.orderNumber}</p>
          <p><strong>Service Type:</strong> ${booking.serviceType}</p>
          <p><strong>Pickup Date:</strong> ${booking.preferredPickupDate}</p>
          <p><strong>Pickup Time:</strong> ${booking.preferredPickupTime}</p>
          <p><strong>Pickup Address:</strong> ${booking.pickupAddress}</p>
          <p><strong>Status:</strong> <span style="color: #ff9800;">Pending Confirmation</span></p>
        </div>
        
        <!-- TRACKING LINK ADDED HERE -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${getTrackingUrl(booking.id)}" 
             style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, hsl(145,20%,75%), hsl(145,20%,65%)); color: hsl(145,100%,5%); text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Track Your Order
          </a>
        </div>
        
        <p>We will contact you shortly to confirm your pickup. You can track your order anytime using the link above or your order number.</p>
        
        <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0;"><strong>📱 Quick Tip:</strong> Save this tracking link to check your order status anytime!</p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions, please reply to this email or contact us directly.
        </p>
        
        <p>Best regards,<br/>The Caperberry Laundry Team</p>
      </div>
    `,
  }),

  statusUpdate: (booking: Booking, statusMessages: Record<string, string>) => {
    const statusMessage = statusMessages[booking.status] || "Your order has been updated.";
    const statusColors: Record<string, string> = {
      confirmed: "#4CAF50",
      picked_up: "#2196F3",
      in_progress: "#FF9800",
      ready: "#8BC34A",
      out_for_delivery: "#2196F3",
      delivered: "#4CAF50",
      cancelled: "#f44336",
    };

    return {
      subject: `Order Update - ${booking.orderNumber}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Order Status Update</h2>
          <p>Hi ${booking.customerName},</p>
          
          <div style="background: ${statusColors[booking.status] || "#2196F3"}; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="margin: 0; font-size: 24px;">${booking.status.toUpperCase().replace(/_/g, " ")}</h3>
            <p style="margin: 10px 0 0 0;">${statusMessage}</p>
          </div>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order Number:</strong> ${booking.orderNumber}</p>
            <p><strong>Service Type:</strong> ${booking.serviceType}</p>
            <p><strong>Pickup Address:</strong> ${booking.pickupAddress}</p>
            ${booking.deliveryAddress ? `<p><strong>Delivery Address:</strong> ${booking.deliveryAddress}</p>` : ""}
          </div>
          
          <!-- TRACKING LINK -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getTrackingUrl(booking.id)}" 
               style="display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, hsl(145,20%,75%), hsl(145,20%,65%)); color: hsl(145,100%,5%); text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Full Order Details
            </a>
          </div>
          
          <p>You can check the detailed status of your order anytime using the link above.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you have any questions, please reply to this email or contact us directly.
          </p>
          
          <p>Best regards,<br/>The Caperberry Laundry Team</p>
        </div>
      `,
    };
  },

  invoiceNotification: (booking: Booking) => ({
    subject: `Invoice Ready - Order #${booking.orderNumber}`,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Invoice is Ready</h2>
        <p>Hi ${booking.customerName},</p>
        
        <p>Your invoice for order <strong>${booking.orderNumber}</strong> is now ready for review.</p>
        
        <div style="background: linear-gradient(135deg, #f5f5f5, #e8f5e9); padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #4CAF50;">
          <div style="text-align: center;">
            <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Total Amount Due</div>
            <div style="font-size: 36px; font-weight: bold; color: #2e7d32;">
              ₦${booking.finalPrice || booking.estimatedPrice || '0.00'}
            </div>
          </div>
        </div>
        
        <!-- VIEW INVOICE BUTTON -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${getTrackingUrl(booking.id)}" 
             style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, hsl(145,20%,75%), hsl(145,20%,65%)); color: hsl(145,100%,5%); text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px;">
            View Invoice
          </a>
        </div>
        
        <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0;"><strong>💳 Payment Information:</strong></p>
          <p style="margin: 10px 0 0 0;">Please arrange payment before delivery. Contact us if you have any questions about the charges.</p>
        </div>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px;">
          If you have any questions about this invoice, please reply to this email or contact us directly.
        </p>
        
        <p>Best regards,<br/>The Caperberry Laundry Team</p>
      </div>
    `,
  }),
};

export class BrevoEmailService implements EmailService {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private brevoApiUrl = "https://api.brevo.com/v3/smtp/email";

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || "";
    this.senderEmail = process.env.SENDER_EMAIL || "noreply@caperberry.ng";
    this.senderName = process.env.SENDER_NAME || "Caperberry Laundry";

    if (!this.apiKey) {
      console.warn(
        "[Email] BREVO_API_KEY not configured. Emails will be logged only."
      );
    }
  }

  private async sendEmail(
    toEmail: string,
    subject: string,
    htmlContent: string
  ): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.log(`[EMAIL LOGGED - Not Sent] To: ${toEmail}, Subject: ${subject}`);
        console.log(`Tracking URL would be included in email`);
        return true;
      }

      const response = await fetch(this.brevoApiUrl, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: {
            name: this.senderName,
            email: this.senderEmail,
          },
          to: [
            {
              email: toEmail,
              name: toEmail.split("@")[0],
            },
          ],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[Brevo Error]", error);
        return false;
      }

      console.log(`[Email Sent] To: ${toEmail}, Subject: ${subject}`);
      return true;
    } catch (error) {
      console.error("[Email Send Error]", error);
      return false;
    }
  }

  async sendBookingConfirmation(booking: Booking): Promise<boolean> {
    const template = emailTemplates.bookingConfirmation(booking);
    return this.sendEmail(booking.customerEmail, template.subject, template.htmlContent);
  }

  async sendStatusUpdate(
    booking: Booking,
    previousStatus: string
  ): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      confirmed: "Your booking has been confirmed! Our team will pick up your items soon.",
      picked_up: "Your items have been picked up and are now at our facility.",
      in_progress: "Your items are currently being cleaned. We're taking great care of them!",
      ready: "Your items are ready! We're preparing them for delivery.",
      out_for_delivery: "Your items are on their way to you!",
      delivered: "Your items have been delivered. Thank you for using our service!",
      cancelled: "Your booking has been cancelled.",
    };

    const template = emailTemplates.statusUpdate(booking, statusMessages);
    return this.sendEmail(booking.customerEmail, template.subject, template.htmlContent);
  }

  async sendInvoiceNotification(booking: Booking): Promise<boolean> {
    const template = emailTemplates.invoiceNotification(booking);
    return this.sendEmail(booking.customerEmail, template.subject, template.htmlContent);
  }
}

// Export the service (will be initialized in index.ts)
let emailService: EmailService;

export function initializeEmailService(): EmailService {
  const useBrevo = process.env.BREVO_API_KEY;
  
  if (useBrevo) {
    console.log("[Email] Using Brevo Email Service");
    emailService = new BrevoEmailService();
  } else {
    console.log("[Email] Using Console Email Service (development mode)");
    emailService = new ConsoleEmailService();
  }

  return emailService;
}

export { emailService };

class ConsoleEmailService implements EmailService {
  async sendBookingConfirmation(booking: Booking): Promise<boolean> {
    const template = emailTemplates.bookingConfirmation(booking);
    console.log(`
[EMAIL LOGGED - DEVELOPMENT MODE]
To: ${booking.customerEmail}
Subject: ${template.subject}
Tracking URL: ${getTrackingUrl(booking.id)}
---
${template.htmlContent}
---
    `);
    return true;
  }

  async sendStatusUpdate(booking: Booking): Promise<boolean> {
    const statusMessages: Record<string, string> = {
      confirmed: "Booking confirmed",
      picked_up: "Items picked up",
      in_progress: "Being cleaned",
      ready: "Ready for delivery",
      out_for_delivery: "Out for delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const template = emailTemplates.statusUpdate(booking, statusMessages);
    console.log(`
[EMAIL LOGGED - DEVELOPMENT MODE]
To: ${booking.customerEmail}
Subject: ${template.subject}
Tracking URL: ${getTrackingUrl(booking.id)}
---
${template.htmlContent}
---
    `);
    return true;
  }

  async sendInvoiceNotification(booking: Booking): Promise<boolean> {
    const template = emailTemplates.invoiceNotification(booking);
    console.log(`
[EMAIL LOGGED - DEVELOPMENT MODE]
To: ${booking.customerEmail}
Subject: ${template.subject}
Tracking URL: ${getTrackingUrl(booking.id)}
---
${template.htmlContent}
---
    `);
    return true;
  }
}
