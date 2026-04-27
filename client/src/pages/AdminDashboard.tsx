import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, LogOut, Download, Send, Eye, X, Search, BellOff, Filter, RefreshCw, TrendingUp, Clock, CheckCircle2, AlertCircle, FileText, DollarSign, Users, Calendar, Bell, Settings, BarChart3, Phone, Mail } from "lucide-react";
import { type Booking } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-100 text-amber-800 border-amber-300", icon: Clock },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800 border-blue-300", icon: CheckCircle2 },
  { value: "picked_up", label: "Picked Up", color: "bg-purple-100 text-purple-800 border-purple-300", icon: Package },
  { value: "in_progress", label: "In Progress", color: "bg-indigo-100 text-indigo-800 border-indigo-300", icon: RefreshCw },
  { value: "ready", label: "Ready", color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircle2 },
  { value: "out_for_delivery", label: "Out for Delivery", color: "bg-cyan-100 text-cyan-800 border-cyan-300", icon: Package },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CheckCircle2 },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800 border-red-300", icon: X },
];

const playNotificationSound = () => {
  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
  audio.play().catch(() => console.log("Sound blocked"));
};

const triggerBrowserNotification = (booking: Booking) => {
  if (Notification.permission === "granted") {
    new Notification("🎉 New Order Received!", {
      body: `${booking.customerName} - ${booking.serviceType.replace('-', ' ')}`,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
    playNotificationSound();
  }
};

async function fetchBookings(): Promise<Booking[]> {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  const res = await fetch("/api/bookings", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

interface InvoiceModalProps {
  booking: Booking;
  onClose: () => void;
  onInvoiceCreated: (bookingId: string, amount: number) => void;
}

function InvoiceModal({ booking, onClose, onInvoiceCreated }: InvoiceModalProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<{ name: string; qty: number; price: number }[]>([
    { name: "", qty: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [isSending, setIsSending] = useState(false);

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * 0.005;
  const total = subtotal + tax;

  const updateBookingPrice = useMutation({
    mutationFn: async (finalPrice: number) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ finalPrice }),
      });

      if (!res.ok) throw new Error("Failed to update price");
      return res.json();
    },
  });

  const handleDownloadInvoice = async () => {
    if (items.some(i => !i.name || i.qty <= 0 || i.price <= 0)) {
      toast({ 
        title: "Invalid items", 
        description: "Please fill in all item details",
        variant: "destructive" 
      });
      return;
    }

    try {
      await updateBookingPrice.mutateAsync(total);
      
      const invoiceHTML = generateInvoiceHTML(booking, items, notes, subtotal, tax, total);
      const blob = new Blob([invoiceHTML], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${booking.orderNumber}.html`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      onInvoiceCreated(booking.id, total);
      toast({ title: "✓ Invoice created and downloaded" });
    } catch (error) {
      toast({ 
        title: "Error creating invoice",
        variant: "destructive" 
      });
    }
  };

  const handleSendToCustomer = async () => {
    if (items.some(i => !i.name || i.qty <= 0 || i.price <= 0)) {
      toast({ 
        title: "Invalid items", 
        description: "Please fill in all item details",
        variant: "destructive" 
      });
      return;
    }
  
    setIsSending(true);
    try {
      const token = localStorage.getItem("token");
      
      // Send items to backend to create invoice
      const res = await fetch(`/api/bookings/${booking.id}/invoice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          items: items,
          notes: notes 
        }),
      });
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create invoice");
      }
  
      const invoice = await res.json();
      
      onInvoiceCreated(booking.id, total);
      toast({
        title: "✓ Invoice sent successfully",
        description: `Delivered to ${booking.customerEmail}`,
      });
      onClose();
    } catch (error: any) {
      console.error("Invoice error:", error);
      toast({
        title: "Failed to send invoice",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const isValid = items.every(i => i.name && i.qty > 0 && i.price > 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border-0 animate-in zoom-in-95 duration-200">
        <CardHeader className="border-b bg-[hsl(145,20%,75%)] text-[hsl(145,100%,5%)] pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-1">Generate Invoice</CardTitle>
              <p className="text-[hsl(145,100%,5%)]/70 text-sm">Order #{booking.orderNumber}</p>
            </div>
            <button 
              onClick={onClose}
              aria-label="Close invoice modal"
              className="text-[hsl(145,100%,5%)]/70 hover:text-[hsl(145,100%,5%)] hover:bg-[hsl(145,100%,5%)]/10 rounded-lg p-2 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[hsl(0,0%,11%)] rounded-xl flex items-center justify-center text-[hsl(145,20%,85%)] text-lg font-bold shadow-lg">
                  {booking.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Customer Details</h3>
                  <p className="text-sm text-gray-500">Billing information</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-4 h-4 text-[hsl(145,20%,75%)]" />
                  <span className="font-medium">{booking.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 text-[hsl(145,20%,75%)]" />
                  <span className="text-sm">{booking.customerEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 text-[hsl(145,20%,75%)]" />
                  <span className="text-sm">{booking.customerPhone}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[hsl(145,20%,95%)] to-[hsl(145,20%,90%)] p-6 rounded-2xl border border-[hsl(145,20%,75%)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[hsl(0,0%,11%)] rounded-xl flex items-center justify-center text-[hsl(145,20%,85%)] shadow-lg">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Order Details</h3>
                  <p className="text-sm text-gray-500">Service information</p>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service Type:</span>
                  <span className="font-semibold text-gray-900 capitalize">{booking.serviceType.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Order Date:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(booking.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-gray-900 capitalize">{booking.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-[hsl(145,20%,75%)]" />
                Invoice Items
              </h3>
              <Button 
                onClick={addItem} 
                size="sm" 
                className="bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,65%)] text-[hsl(145,100%,5%)] shadow-md"
              >
                + Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border-2 border-gray-200 hover:border-[hsl(145,20%,75%)] transition-all shadow-sm">
                  <div className="grid grid-cols-12 gap-3">
                    <Input
                      placeholder="Item description (e.g., Shirt - Dry Clean)"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      className="col-span-5 border-gray-300 focus:border-[hsl(145,20%,75%)] focus:ring-[hsl(145,20%,75%)]"
                      aria-label="Item description"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 0)}
                      className="col-span-2 border-gray-300 focus:border-[hsl(145,20%,75%)] focus:ring-[hsl(145,20%,75%)]"
                      aria-label="Quantity"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                      className="col-span-3 border-gray-300 focus:border-[hsl(145,20%,75%)] focus:ring-[hsl(145,20%,75%)]"
                      aria-label="Unit price"
                    />
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-gray-900">₦{(item.qty * item.price).toLocaleString()}</span>
                      {items.length > 1 && (
                        <Button
                          onClick={() => removeItem(idx)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          aria-label="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[hsl(145,20%,95%)] to-[hsl(145,20%,90%)] p-6 rounded-2xl border-2 border-[hsl(145,20%,75%)] shadow-inner">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-lg">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-gray-700">
                <span className="font-medium">Tax (7.5%)</span>
                <span className="font-bold text-lg">₦{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t-2 border-[hsl(145,20%,75%)] pt-3">
                <span className="text-xl font-bold text-gray-900">Total Amount</span>
                <span className="text-3xl font-bold text-[hsl(145,20%,55%)]">
                  ₦{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="invoice-notes" className="text-sm font-bold text-gray-900">Additional Notes</label>
            <textarea
              id="invoice-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, special instructions, or thank you message..."
              rows={3}
              className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[hsl(145,20%,75%)] focus:border-[hsl(145,20%,75%)] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleDownloadInvoice}
              disabled={!isValid || updateBookingPrice.isPending}
              variant="outline"
              className="flex-1 gap-2 border-2 border-gray-300 hover:bg-gray-50 h-12 text-base font-semibold disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Download PDF
            </Button>
            <Button
              onClick={handleSendToCustomer}
              disabled={!isValid || isSending || updateBookingPrice.isPending}
              className="flex-1 gap-2 bg-[hsl(145,20%,55%)] hover:bg-[hsl(145,20%,45%)] text-white h-12 text-base font-semibold shadow-lg disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send to Customer
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function generateInvoiceHTML(
  booking: Booking,
  items: any[],
  notes: string,
  subtotal: number,
  tax: number,
  total: number
): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${booking.orderNumber} - Caperberry Laundry</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; padding: 40px 20px; }
        .invoice { background: white; max-width: 900px; margin: 0 auto; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        .header { background: hsl(145,20%,75%); color: hsl(145,100%,5%); padding: 40px 50px; }
        .header-content { display: flex; justify-content: space-between; align-items: start; }
        .company-name { font-size: 32px; font-weight: 800; letter-spacing: -0.5px; }
        .company-tagline { font-size: 14px; opacity: 0.8; margin-top: 4px; }
        .invoice-badge { background: hsl(0,0%,11%); color: hsl(145,20%,85%); padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 16px; }
        .content { padding: 50px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding-bottom: 40px; border-bottom: 2px solid #e2e8f0; }
        .info-section h3 { color: hsl(145,20%,55%); font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin-bottom: 12px; }
        .info-section p { color: #334155; line-height: 1.8; margin: 4px 0; }
        .info-section strong { color: #0f172a; font-weight: 600; }
        .items-table { width: 100%; border-collapse: collapse; margin: 40px 0; }
        .items-table thead { background: #f8fafc; }
        .items-table th { padding: 16px; text-align: left; font-weight: 700; color: #475569; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        .items-table td { padding: 18px 16px; border-bottom: 1px solid #f1f5f9; color: #334155; }
        .items-table tbody tr:hover { background: #fafafa; }
        .items-table .text-right { text-align: right; }
        .items-table .amount { font-weight: 700; color: #0f172a; }
        .totals-section { margin-left: auto; width: 400px; background: linear-gradient(135deg, hsl(145,20%,95%), hsl(145,20%,90%)); padding: 30px; border-radius: 12px; border: 2px solid hsl(145,20%,75%); }
        .total-row { display: flex; justify-content: space-between; padding: 12px 0; color: #6b7280; font-size: 15px; }
        .total-row span:last-child { font-weight: 600; color: #111827; }
        .total-final { border-top: 3px solid hsl(145,20%,75%); padding-top: 16px; margin-top: 12px; font-size: 20px; font-weight: 800; color: hsl(145,20%,55%); }
        .notes-section { margin-top: 40px; padding: 25px; background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; }
        .notes-section strong { color: #92400e; display: block; margin-bottom: 8px; font-size: 14px; }
        .notes-section p { color: #78350f; line-height: 1.7; }
        .footer { margin-top: 50px; text-align: center; padding: 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
        .footer-title { font-weight: 700; color: #0f172a; font-size: 16px; margin-bottom: 8px; }
        .footer-text { color: #64748b; font-size: 14px; }
        @media print { body { background: white; padding: 0; } .invoice { box-shadow: none; } }
      </style>
    </head>
    <body>
      <main class="invoice">
        <header class="header">
          <div class="header-content">
            <div>
              <h1 class="company-name">Caperberry Laundry</h1>
              <p class="company-tagline">Premium Laundry & Dry Cleaning</p>
            </div>
            <div class="invoice-badge">INVOICE</div>
          </div>
        </header>

        <div class="content">
          <div class="info-grid">
            <section class="info-section">
              <h3>Bill To</h3>
              <p><strong style="font-size: 18px;">${booking.customerName}</strong></p>
              <p>${booking.customerEmail}</p>
              <p>${booking.customerPhone}</p>
              <p style="margin-top: 8px;">${booking.pickupAddress}</p>
            </section>
            <section class="info-section">
              <h3>Invoice Details</h3>
              <p><strong>Invoice #:</strong> ${booking.orderNumber}</p>
              <p><strong>Date Issued:</strong> ${new Date(booking.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Service:</strong> ${booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1).replace('-', ' ')}</p>
              <p><strong>Due Date:</strong> Upon Receipt</p>
            </section>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><strong>${item.name}</strong></td>
                  <td class="text-right">${item.qty}</td>
                  <td class="text-right">₦${item.price.toLocaleString()}</td>
                  <td class="text-right amount">₦${(item.qty * item.price).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₦${subtotal.toLocaleString()}</span>
            </div>
            <div class="total-row">
              <span>Tax (7.5%)</span>
              <span>₦${tax.toFixed(2)}</span>
            </div>
            <div class="total-row total-final">
              <span>Total Due</span>
              <span>₦${total.toFixed(2)}</span>
            </div>
          </div>

          ${notes ? `
            <aside class="notes-section">
              <strong>Additional Notes:</strong>
              <p>${notes}</p>
            </aside>
          ` : ''}

          <footer class="footer">
            <p class="footer-title">Thank You For Your Business!</p>
            <p class="footer-text">Questions? Contact us anytime for assistance.</p>
          </footer>
        </div>
      </main>
    </body>
    </html>
  `;
}

function NotificationPanel({ onClose, bookings }: { onClose: () => void; bookings: Booking[] }) {
  const recentOrders = bookings.slice(0, 5);
  
  return (
    <div className="fixed top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        <button onClick={onClose} aria-label="Close notifications" className="hover:bg-gray-100 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {recentOrders.length > 0 ? (
          recentOrders.map((booking) => (
            <div key={booking.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {booking.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    #{booking.orderNumber} - {booking.customerName}
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {new Date(booking.createdAt).toLocaleString('en-NG', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <BellOff className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed top-16 right-6 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Settings</h3>
        <button onClick={onClose} aria-label="Close settings" className="hover:bg-gray-100 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <p className="font-medium text-gray-900">Account Settings</p>
          <p className="text-xs text-gray-500">Manage your profile</p>
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <p className="font-medium text-gray-900">Business Settings</p>
          <p className="text-xs text-gray-500">Configure business details</p>
        </button>
        <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors">
          <p className="font-medium text-gray-900">Notification Preferences</p>
          <p className="text-xs text-gray-500">Email and SMS alerts</p>
        </button>
      </div>
    </div>
  );
}

interface WalkInPOSModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function WalkInPOSModal({ onClose, onSuccess }: WalkInPOSModalProps) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<{ name: string; qty: number; price: number }[]>([
    { name: "", qty: 1, price: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!customerName || !customerPhone) {
      toast({
        title: "Missing information",
        description: "Name and phone are required",
        variant: "destructive"
      });
      return;
    }

    if (items.some(i => !i.name || i.qty <= 0 || i.price <= 0)) {
      toast({
        title: "Invalid items",
        description: "All items must have name, quantity, and price",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch("/api/pos/walk-in", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail || "",
          items: items.map(item => ({
            garmentType: item.name,
            quantity: item.qty,
            pricePerItem: item.price
          })),
          notes
        }),
      });

      if (!res.ok) throw new Error("Failed to create walk-in order");

      const data = await res.json();

      toast({
        title: "✓ Walk-in order created",
        description: `Total: ₦${total.toFixed(2)}`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to create order",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isValid = customerName && customerPhone && items.every(i => i.name && i.qty > 0 && i.price > 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl border-0">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold mb-1">Walk-In Customer</CardTitle>
              <p className="text-white/80 text-sm">Process in-store drop-off</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-8">
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Customer Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Name *</Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Phone *</Label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+234 XXX XXX XXXX"
                  className="h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Email (Optional)</Label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Items
              </h3>
              <Button onClick={addItem} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                + Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <div className="grid grid-cols-12 gap-3">
                    <Input
                      placeholder="Item"
                      value={item.name}
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      className="col-span-5"
                    />
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 0)}
                      className="col-span-2"
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(idx, "price", parseFloat(e.target.value) || 0)}
                      className="col-span-3"
                    />
                    <div className="col-span-2 flex items-center justify-between gap-2">
                      <span className="text-sm font-bold">₦{(item.qty * item.price).toLocaleString()}</span>
                      {items.length > 1 && (
                        <Button onClick={() => removeItem(idx)} size="sm" variant="ghost" className="text-red-600">
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-300">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-lg">₦{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tax (7.5%)</span>
                <span className="font-bold text-lg">₦{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-blue-300 pt-3">
                <span className="text-xl font-bold">Total</span>
                <span className="text-3xl font-bold text-blue-600">₦{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold">Notes</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              rows={2}
              className="w-full p-4 border-2 border-gray-300 rounded-xl resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1 h-12" disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isProcessing}
              className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Create Order
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface SuperAdminPanelProps {
  onOpenWalkIn: () => void;
}

function SuperAdminPanel({ onOpenWalkIn }: SuperAdminPanelProps) {
  const { toast } = useToast();
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async () => {
    if (!username || !password) {
      toast({ title: "Missing fields", description: "Username and password required", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Weak password", description: "Min 8 characters", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      toast({ title: "✓ Admin created", description: `Username: ${username}` });
      setUsername(""); setPassword(""); setEmail(""); setShowCreateAdmin(false);
    } catch (error: any) {
      toast({ title: "Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-0 shadow-xl mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Super Admin Panel</h3>
            <p className="text-white/80 text-sm">Manage admins and walk-in customers</p>
          </div>
          <Settings className="w-8 h-8 text-white/60" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
            className="h-20 bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white flex-col gap-2"
          >
            <Users className="w-6 h-6" />
            <span className="font-semibold">Create Admin User</span>
          </Button>

          <Button
            onClick={onOpenWalkIn}
            className="h-20 bg-white/20 hover:bg-white/30 border-2 border-white/40 text-white flex-col gap-2"
          >
            <Package className="w-6 h-6" />
            <span className="font-semibold">Walk-In Customer</span>
          </Button>
        </div>

        {showCreateAdmin && (
          <div className="mt-6 bg-white/10 p-6 rounded-xl border border-white/20">
            <h4 className="font-bold text-lg mb-4">Create New Admin</h4>
            <div className="space-y-4">
              <div>
                <Label className="text-white/90 text-sm mb-2 block">Username *</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin_username" className="bg-white/90 text-gray-900 h-12" />
              </div>
              <div>
                <Label className="text-white/90 text-sm mb-2 block">Password *</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" className="bg-white/90 text-gray-900 h-12" />
              </div>
              <div>
                <Label className="text-white/90 text-sm mb-2 block">Email (Optional)</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" className="bg-white/90 text-gray-900 h-12" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowCreateAdmin(false)} variant="outline" className="flex-1 bg-white/10 border-white/30 text-white" disabled={isCreating}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAdmin} disabled={isCreating || !username || !password} className="flex-1 bg-white text-purple-600 hover:bg-white/90 font-semibold">
                  {isCreating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "Create Admin"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [invoiceModal, setInvoiceModal] = useState<Booking | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSeenId, setLastSeenId] = useState(localStorage.getItem("lastSeenOrder") || "");
  const [showWalkInPOS, setShowWalkInPOS] = useState(false);
  const [userRole, setUserRole] = useState<string>("");

  const { data: bookings = [], isLoading, error, refetch } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
    refetchInterval: 5000,
    retry: 1,
    enabled: !!localStorage.getItem("token"),
  });

  // Check user role on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(user.role || "");
  }, []);
  
  // Browser notification permission request
  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // New order notification watcher
  useEffect(() => {
    if (bookings.length > 0) {
      const latestBooking = bookings[0];
      const lastNotifiedId = localStorage.getItem("lastNotifiedId");

      if (lastNotifiedId !== latestBooking.id.toString()) {
        triggerBrowserNotification(latestBooking);
        localStorage.setItem("lastNotifiedId", latestBooking.id.toString());
      }
    }
  }, [bookings]);

  // Check for unread notifications
  const hasUnread = useMemo(() => {
    return bookings.length > 0 && bookings[0].id.toString() !== lastSeenId;
  }, [bookings, lastSeenId]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({
        title: "✓ Status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({ title: "✓ Logged out successfully" });
    setLocation("/login");
  };

  const handleInvoiceCreated = (bookingId: string, amount: number) => {
    refetch();
  };

  const toggleNotifications = () => {
    if (!showNotifications && bookings.length > 0) {
      const newestId = bookings[0].id.toString();
      localStorage.setItem("lastSeenOrder", newestId);
      setLastSeenId(newestId);
    }
    setShowNotifications(!showNotifications);
    setShowSettings(false);
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.includes(searchQuery);
    
    const matchesStatus = !filterStatus || booking.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = bookings.filter(b => new Date(b.createdAt) >= today);
    
    return {
      total: bookings.length,
      today: todayOrders.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      inProgress: bookings.filter(b => ['confirmed', 'picked_up', 'in_progress'].includes(b.status)).length,
      completed: bookings.filter(b => b.status === 'delivered').length,
      revenue: bookings.reduce((sum, b) => sum + (Number(b.finalPrice) || 0), 0),
      todayRevenue: todayOrders.reduce((sum, b) => sum + (Number(b.finalPrice) || 0), 0),
    };
  }, [bookings]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[hsl(145,20%,95%)] to-[hsl(145,20%,85%)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[hsl(145,20%,75%)] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Loader2 className="w-10 h-10 text-[hsl(145,100%,5%)] animate-spin" />
          </div>
          <p className="text-gray-700 font-semibold text-lg">Loading your dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Fetching latest orders</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-12 px-4 flex items-center justify-center">
        <Card className="max-w-2xl w-full border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-red-600 to-orange-600 text-white pb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Connection Error</CardTitle>
                <p className="text-red-100 text-sm mt-1">Unable to load dashboard data</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <p className="text-gray-700">
              {error instanceof Error ? error.message : "Failed to connect to the server. Please check your connection."}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700 gap-2 flex-1">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button onClick={handleLogout} variant="outline" className="flex-1">
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(145,20%,95%)] to-[hsl(145,20%,85%)]">
      
      {/* Premium Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[hsl(145,20%,75%)] to-[hsl(145,20%,65%)] rounded-2xl flex items-center justify-center text-[hsl(145,100%,5%)] text-xl font-bold shadow-lg">
                C
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Caperberry Admin</h1>
                <p className="text-sm text-gray-600">Operations Dashboard</p>
              </div>
            </div>
            <nav className="flex items-center gap-3" aria-label="Admin navigation">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 relative"
                onClick={toggleNotifications}
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {hasUnread && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="gap-2 border-gray-300"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {showNotifications && <NotificationPanel onClose={() => setShowNotifications(false)} bookings={bookings} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Super Admin Panel - Only for super_admin */}
        {userRole === "admin" && (
          <SuperAdminPanel onOpenWalkIn={() => setShowWalkInPOS(true)} />
        )}
        
        {/* Premium Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" aria-label="Dashboard statistics">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-[hsl(145,20%,75%)] to-[hsl(145,20%,65%)] text-[hsl(145,100%,5%)] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-[hsl(0,0%,11%)]/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Package className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{stats.total}</div>
                  <div className="text-[hsl(145,100%,5%)]/70 text-sm font-medium">Total Orders</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[hsl(145,100%,5%)]/70 text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>{stats.today} today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{stats.pending}</div>
                  <div className="text-orange-100 text-sm font-medium">Pending</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-100 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Needs attention</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <RefreshCw className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{stats.inProgress}</div>
                  <div className="text-blue-100 text-sm font-medium">In Progress</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-100 text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>Active orders</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-600 to-green-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <CardContent className="p-6 relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">{stats.completed}</div>
                  <div className="text-green-100 text-sm font-medium">Completed</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-100 text-sm">
                <DollarSign className="w-4 h-4" />
                <span>₦{stats.revenue.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Search & Filter Section */}
        <Card className="border-0 shadow-xl mb-6 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search orders by name, order number, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 border-2 border-gray-200 focus:border-[hsl(145,20%,75%)] bg-white"
                  aria-label="Search orders"
                />
              </div>
              <div className="flex gap-3">
                <Select value={filterStatus || "all"} onValueChange={(val) => setFilterStatus(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-48 h-12 border-2 border-gray-200 bg-white font-medium" aria-label="Filter by status">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">All Statuses</SelectItem>
                    {STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  className="gap-2 h-12 border-2 border-gray-200 hover:bg-gray-50"
                  aria-label="Refresh orders"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>
            </div>
            
            {(searchQuery || filterStatus) && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-gray-600">
                  Showing <strong className="text-[hsl(145,20%,55%)] font-bold">{filteredBookings.length}</strong> of <strong className="text-gray-900">{bookings.length}</strong> orders
                </span>
                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setFilterStatus("");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-[hsl(145,20%,55%)] hover:text-[hsl(145,20%,45%)]"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-0 shadow-xl overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-[hsl(145,20%,75%)]" />
                Order Management
              </CardTitle>
              <div className="text-sm text-gray-600 font-medium">
                {filteredBookings.length} {filteredBookings.length === 1 ? 'order' : 'orders'}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredBookings.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[hsl(145,20%,90%)] to-[hsl(145,20%,85%)] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-[hsl(145,20%,55%)]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders found</h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  {searchQuery || filterStatus 
                    ? "Try adjusting your search criteria or filters" 
                    : "New orders will appear here when customers make bookings"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Order Info</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Service</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBookings.map((booking) => {
                      const statusOption = STATUS_OPTIONS.find(s => s.value === booking.status);
                      const StatusIcon = statusOption?.icon || Clock;
                      return (
                        <tr key={booking.id} className="hover:bg-[hsl(145,20%,95%)]/50 transition-all group">
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(145,20%,75%)] to-[hsl(145,20%,65%)] rounded-xl flex items-center justify-center text-[hsl(145,100%,5%)] text-xs font-bold shadow-lg">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-[hsl(145,20%,55%)]">{booking.orderNumber}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(booking.createdAt).toLocaleDateString('en-NG', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[hsl(0,0%,11%)] to-[hsl(0,0%,20%)] rounded-xl flex items-center justify-center text-[hsl(145,20%,85%)] font-bold shadow-md">
                                {booking.customerName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{booking.customerName}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                  <Phone className="w-3 h-3" />
                                  {booking.customerPhone}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {booking.customerEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300">
                              <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                              {booking.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <Select
                              value={booking.status}
                              onValueChange={(value) =>
                                updateStatusMutation.mutate({ id: booking.id, status: value })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <SelectTrigger className={`w-48 h-10 border-2 ${statusOption?.color || 'bg-gray-100'} font-semibold text-xs shadow-sm`} aria-label={`Update status for order ${booking.orderNumber}`}>
                                <div className="flex items-center gap-2">
                                  <StatusIcon className="w-4 h-4" />
                                  <SelectValue />
                                </div>
                              </SelectTrigger>
                              <SelectContent className="bg-white">
                                {STATUS_OPTIONS.map((option) => {
                                  const Icon = option.icon;
                                  return (
                                    <SelectItem key={option.value} value={option.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {option.label}
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="px-6 py-5">
                            {booking.finalPrice ? (
                              <div className="text-left">
                                <div className="text-lg font-bold text-gray-900">₦{booking.finalPrice.toLocaleString()}</div>
                                <div className="text-xs text-green-600 font-medium">Invoiced</div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">Not invoiced</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex gap-2 flex-wrap">
                              {/* WhatsApp Contact Button */}
                              <Button
                                onClick={() => {
  let phone = booking.customerPhone.replace(/\D/g, '');

  // Normalize Nigerian numbers
  if (phone.startsWith('0')) {
    phone = '234' + phone.slice(1);
  } else if (phone.startsWith('234')) {
    // already correct
  } else if (phone.length === 10) {
    // fallback: assume it's missing country code
    phone = '234' + phone;
  }

  const message = encodeURIComponent(
    `Hello ${booking.customerName}, this is Caperberry Laundry regarding your order ${booking.orderNumber}. We'd like to confirm your booking details.`
  );

  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}}
                                size="sm"
                                variant="outline"
                                className="gap-1 border-green-600 text-green-600 hover:bg-green-50"
                                title="Contact via WhatsApp"
                              >
                                <Phone className="w-3 h-3" />
                                WhatsApp
                              </Button>
                              
                              {/* Invoice Button */}
                              <Button
                                onClick={() => setInvoiceModal(booking)}
                                size="sm"
                                className="gap-1 bg-gradient-to-r from-[hsl(145,20%,75%)] to-[hsl(145,20%,65%)] hover:from-[hsl(145,20%,70%)] hover:to-[hsl(145,20%,60%)] text-[hsl(145,100%,5%)] shadow-md"
                              >
                                <FileText className="w-3 h-3" />
                                Invoice
                              </Button>
                              
                              {/* View Tracking Button */}
                              <Button
                                onClick={() => window.open(`/tracking/${booking.id}`, "_blank")}
                                size="sm"
                                variant="outline"
                                className="border-2 border-gray-300 hover:bg-gray-50"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Summary Footer */}
        <Card className="mt-6 border-0 shadow-xl bg-gradient-to-r from-[hsl(145,20%,75%)] to-[hsl(145,20%,65%)] text-[hsl(145,100%,5%)] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <CardContent className="p-8 relative z-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-[hsl(145,100%,5%)]/70 text-sm font-medium mb-2 uppercase tracking-wide">Total Revenue</div>
                <div className="text-4xl font-bold">₦{stats.revenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[hsl(145,100%,5%)]/70 text-sm font-medium mb-2 uppercase tracking-wide">Today's Revenue</div>
                <div className="text-4xl font-bold">₦{stats.todayRevenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[hsl(145,100%,5%)]/70 text-sm font-medium mb-2 uppercase tracking-wide">Average Order Value</div>
                <div className="text-4xl font-bold">
                  ₦{stats.total > 0 ? Math.round(stats.revenue / stats.total).toLocaleString() : '0'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Invoice Modal */}
      {invoiceModal && (
        <InvoiceModal
          booking={invoiceModal}
          onClose={() => setInvoiceModal(null)}
          onInvoiceCreated={handleInvoiceCreated}
        />
      )}

      {/* Walk-In POS Modal */}
      {showWalkInPOS && (
        <WalkInPOSModal
          onClose={() => setShowWalkInPOS(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
