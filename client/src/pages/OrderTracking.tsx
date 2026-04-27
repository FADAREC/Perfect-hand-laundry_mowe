import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, Truck, Package, Shirt, Clock, Phone, Mail, Home, AlertCircle, Download } from "lucide-react";
import { type Booking } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { businessConfig } from "../../../config/business";

const STATUS_CONFIG = {
  pending: {
    label: "Order Placed",
    icon: Package,
    description: "We've received your booking request",
    color: "bg-gray-100 text-gray-900",
    borderColor: "border-gray-300",
    nextStep: "Confirmation coming soon",
  },
  confirmed: {
    label: "Confirmed",
    icon: Check,
    description: "Your pickup is scheduled",
    color: "bg-blue-100 text-blue-900",
    borderColor: "border-blue-300",
    nextStep: "We'll pick up your items soon",
  },
  picked_up: {
    label: "Picked Up",
    icon: Truck,
    description: "Your items are with us",
    color: "bg-purple-100 text-purple-900",
    borderColor: "border-purple-300",
    nextStep: "Currently being cleaned",
  },
  in_progress: {
    label: "Cleaning",
    icon: Shirt,
    description: "We're cleaning your items with care",
    color: "bg-orange-100 text-orange-900",
    borderColor: "border-orange-300",
    nextStep: "Almost ready",
  },
  ready: {
    label: "Ready",
    icon: Check,
    description: "Your items are ready for delivery",
    color: "bg-green-100 text-green-900",
    borderColor: "border-green-300",
    nextStep: "Coming to you soon",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    icon: Truck,
    description: "Your items are on the way",
    color: "bg-blue-100 text-blue-900",
    borderColor: "border-blue-300",
    nextStep: "Should arrive today",
  },
  delivered: {
    label: "Delivered",
    icon: Check,
    description: "Your items have been delivered",
    color: "bg-green-100 text-green-900",
    borderColor: "border-green-300",
    nextStep: "Order complete",
  },
  cancelled: {
    label: "Cancelled",
    icon: AlertCircle,
    description: "This order has been cancelled",
    color: "bg-red-100 text-red-900",
    borderColor: "border-red-300",
    nextStep: "Please contact us",
  },
};

const STEPS_TIMELINE = ["pending", "confirmed", "picked_up", "in_progress", "ready", "out_for_delivery", "delivered"];

export default function OrderTracking() {
  const [, params] = useRoute("/tracking/:id");
  const [_, setLocation] = useLocation();
  const id = params?.id;

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${id}`],
    refetchInterval: 2000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[hsl(145,20%,75%)]" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-0 shadow-lg">
          <CardContent className="pt-8 text-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
              <p className="text-gray-600">
                We couldn't find an order with this ID. Check your confirmation email.
              </p>
            </div>
            <Button onClick={() => setLocation("/")} className="w-full bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,70%)] text-gray-900">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const StatusIcon = statusConfig.icon;
  const currentStepIndex = STEPS_TIMELINE.indexOf(booking.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 md:py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-xl text-gray-600">
            Order #{booking.orderNumber}
          </p>
        </div>

        {/* Current Status Hero Card */}
        <Card className={`mb-10 border-0 shadow-xl ${statusConfig.color}`}>
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${statusConfig.color}`}>
                <StatusIcon className="w-12 h-12" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              {statusConfig.label}
            </h2>
            <p className="text-lg opacity-90 mb-4">
              {statusConfig.description}
            </p>
            <p className="text-sm font-semibold opacity-75">
              Next: {statusConfig.nextStep}
            </p>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-10 border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-7 top-0 bottom-0 w-1 bg-gradient-to-b from-[hsl(145,20%,75%)] to-gray-300" />

              <div className="space-y-8">
                {STEPS_TIMELINE.map((step, index) => {
                  const StepConfig = STATUS_CONFIG[step as keyof typeof STATUS_CONFIG];
                  const StepIcon = StepConfig.icon;
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step} className="relative pl-20">
                      {/* Circle indicator */}
                      <div className={`absolute -left-4 top-0 w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-[hsl(145,20%,75%)] border-[hsl(145,20%,75%)] text-gray-900"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}>
                        {isCompleted ? <Check className="w-6 h-6" /> : <StepIcon className="w-6 h-6" />}
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className={`font-bold text-lg ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                          {StepConfig.label}
                        </h3>
                        <p className={`text-sm mt-1 ${isCompleted ? "text-gray-600" : "text-gray-400"}`}>
                          {StepConfig.description}
                        </p>
                        {isCurrent && (
                          <div className="mt-2 inline-block px-3 py-1 bg-[hsl(145,20%,75%)] text-gray-900 text-xs font-semibold rounded-full">
                            Current Status
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Details & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Order Details Card */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[hsl(145,20%,75%)]" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {booking.serviceType.replace('-', ' ')}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pickup Date & Time</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {booking.preferredPickupDate} at {booking.preferredPickupTime}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {booking.finalPrice ? `₦${booking.finalPrice.toLocaleString()}` : "Contact for pricing"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Payment Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${booking.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <p className="font-semibold text-gray-900 capitalize">{booking.paymentStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Address */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">{booking.customerName}</p>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gray-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</p>
                  <a href={`tel:${booking.customerPhone}`} className="text-lg font-semibold text-[hsl(145,20%,75%)] hover:underline">
                    {booking.customerPhone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</p>
                  <a href={`mailto:${booking.customerEmail}`} className="text-lg font-semibold text-[hsl(145,20%,75%)] hover:underline break-all">
                    {booking.customerEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Home className="w-4 h-4 text-gray-400 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pickup Address</p>
                  <p className="text-gray-900 mt-1">{booking.pickupAddress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Instructions */}
        {booking.notes && (
          <Card className="mb-10 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Special Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{booking.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-10">
          <Button
            onClick={() => window.open(`https://wa.me/${businessConfig.whatsapp?.replace(/\D/g, "")}`, "_blank")}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Phone className="w-4 h-4" />
            Contact via WhatsApp
          </Button>
          <Button
            onClick={() => setLocation(`/invoice/${id}`)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4" />
            View Invoice
          </Button>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-gray-300"
          >
            Back to Home
          </Button>
        </div>

        {/* Info Box */}
        <Card className="border-l-4 border-l-[hsl(145,20%,75%)] bg-[hsl(145,20%,75%)]/5">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-700">
              <strong>Need help?</strong> Contact us via WhatsApp or email if you have any questions about your order.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}