import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { businessConfig } from "../../../config/business";
import { MapPin, Phone, Mail, Clock, MessageCircle, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";

type FormStep = "location" | "details" | "service" | "schedule" | "confirm";

export default function Contact() {
  const { services, locations, hours, email } = businessConfig;
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [userId, setUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [currentStep, setCurrentStep] = useState<FormStep>("location");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    service: "",
    location: "",
    pickupDate: "",
    pickupTime: "",
    message: "",
    termsAccepted: false,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/bookings", {
        ...data,
        userId,
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
        serviceType: data.service,
        pickupAddress: data.address,
        preferredPickupDate: data.pickupDate,
        preferredPickupTime: data.pickupTime,
        notes: data.message,
        termsAccepted: data.termsAccepted,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.booking.userId) {
        localStorage.setItem("userId", data.booking.userId);
        setUserId(data.booking.userId);
      }
      setCurrentStep("confirm");
      setTimeout(() => {
        setLocation(`/tracking/${data.booking.id}`);
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isValidPhone = (phone: string) => {
    // Basic format: allow +, spaces, digits. Min 10 chars.
    const clean = phone.replace(/[^\d+]/g, "");
    return clean.length >= 10 && clean.length <= 15;
  };

  const selectedLocation = locations.find(loc => loc.name === formData.location);
  const canProceedToService = 
    formData.location && 
    formData.name && 
    isValidPhone(formData.phone) && 
    formData.email.includes("@") && 
    formData.address;
  const canProceedToSchedule = formData.service;
  const canSubmit = formData.pickupDate && formData.pickupTime && formData.termsAccepted;

  const steps: { id: FormStep; label: string; description: string }[] = [
    { id: "location", label: "Location", description: "Choose your branch" },
    { id: "details", label: "Your Details", description: "Contact information" },
    { id: "service", label: "Service", description: "What you need" },
    { id: "schedule", label: "Schedule", description: "When to pick up" },
    { id: "confirm", label: "Done!", description: "Booking confirmed" },
  ];

  const getStepIndex = (step: FormStep) => steps.findIndex(s => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);
  const progressPercent = ((currentStepIndex + 1) / steps.length) * 100;

  // ========== RENDER LOGIC ==========

  if (currentStep === "confirm" && mutation.isSuccess) {
    return (
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="w-20 h-20 text-[hsl(145,20%,75%)]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Booking Confirmed! ✓
            </h1>
            <p className="text-xl text-gray-600">
              We've sent a confirmation to <span className="font-semibold">{formData.email}</span>
            </p>
            <div className="bg-white p-8 rounded-xl border border-gray-200 space-y-4">
              <div className="text-left space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Order Number</span>
                  <span className="font-mono font-semibold">{mutation.data?.booking.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Location</span>
                  <span className="font-semibold">{formData.location}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Pickup Date & Time</span>
                  <span className="font-semibold">{formData.pickupDate} at {formData.pickupTime}</span>
                </div>
              </div>
            </div>
            <div className="pt-4 space-y-3">
              <p className="text-gray-600">Redirecting to tracking page...</p>
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[hsl(145,20%,75%)] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between mb-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className="flex-1 relative"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                  idx <= currentStepIndex
                    ? "bg-[hsl(145,20%,75%)] border-[hsl(145,20%,75%)] text-gray-900"
                    : "bg-white border-gray-300 text-gray-400"
                }`}>
                  {idx < currentStepIndex ? (
                    <span className="text-lg">✓</span>
                  ) : (
                    <span className="text-sm font-semibold">{idx + 1}</span>
                  )}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`absolute top-5 left-[50%] w-[calc(100%-2.5rem)] h-0.5 transition-all duration-300 ${
                    idx < currentStepIndex ? "bg-[hsl(145,20%,75%)]" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <p className="font-semibold text-gray-900">{step.label}</p>
                <p className="text-gray-500 text-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 md:p-12">
            
            {/* STEP 1: Location & Branch Selection */}
            {currentStep === "location" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Branch</h2>
                  <p className="text-gray-600">Where would you like to use our service?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map((loc) => (
                    <button
                      key={loc.name}
                      onClick={() => handleChange("location", loc.name)}
                      className={`p-6 rounded-xl border-2 transition-all text-left ${
                        formData.location === loc.name
                          ? "border-[hsl(145,20%,75%)] bg-[hsl(145,20%,75%)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <MapPin className={`w-6 h-6 flex-shrink-0 mt-1 ${
                          formData.location === loc.name ? "text-[hsl(145,20%,75%)]" : "text-gray-400"
                        }`} />
                        <div>
                          <p className="font-semibold text-gray-900">{loc.name}</p>
                          <p className="text-sm text-gray-600 mt-1">{loc.address}</p>
                          <a
                            href={`tel:${loc.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm text-[hsl(145,20%,75%)] font-medium mt-2 inline-block hover:underline"
                          >
                            {loc.phone}
                          </a>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setCurrentStep("details")}
                    disabled={!formData.location}
                    className="gap-2 bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,70%)] text-gray-900"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Personal Details */}
            {currentStep === "details" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Details</h2>
                  <p className="text-gray-600">We'll use this to contact you about your order</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Full Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="John Doe"
                      className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900">Phone Number *</Label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        placeholder="+234 XXX XXX XXXX"
                        className={`h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 ${
                          formData.phone && !isValidPhone(formData.phone) ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                      />
                      {formData.phone && !isValidPhone(formData.phone) && (
                        <p className="text-xs text-red-500 mt-1">Please enter a valid phone number (10-15 digits)</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900">Email *</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        placeholder="john@example.com"
                        className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Pickup Address *</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Street address, Apartment, City"
                      className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <Button
                    onClick={() => setCurrentStep("location")}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("service")}
                    disabled={!canProceedToService}
                    className="gap-2 bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,70%)] text-gray-900"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Service Selection */}
            {currentStep === "service" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">What Service Do You Need?</h2>
                  <p className="text-gray-600">We'll contact you to confirm details</p>
                </div>

                <div className="space-y-3">
                  {services.filter(s => s.id !== "stain-removal").map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleChange("service", service.id)}
                      className={`p-5 rounded-xl border-2 transition-all text-left ${
                        formData.service === service.id
                          ? "border-[hsl(145,20%,75%)] bg-[hsl(145,20%,75%)]/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <p className="font-semibold text-gray-900">{service.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between gap-3">
                  <Button
                    onClick={() => setCurrentStep("details")}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("schedule")}
                    disabled={!canProceedToSchedule}
                    className="gap-2 bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,70%)] text-gray-900"
                  >
                    Next <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Schedule & Special Notes */}
            {currentStep === "schedule" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">When Do You Need Pickup?</h2>
                  <p className="text-gray-600">Choose your preferred date and time</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900">Pickup Date *</Label>
                      <Input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => handleChange("pickupDate", e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-12 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-gray-900">Preferred Time *</Label>
                      <Input
                        type="time"
                        value={formData.pickupTime}
                        onChange={(e) => handleChange("pickupTime", e.target.value)}
                        className="h-12 bg-white border-gray-300 text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-gray-900">Special Instructions (Optional)</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      rows={4}
                      placeholder="Gate codes, landmarks, preferred entry point, stained items..."
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex justify-between gap-3">
                  <Button
                    onClick={() => setCurrentStep("service")}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("confirm")}
                    className="gap-2 bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,70%)] text-gray-900"
                  >
                    Review & Confirm <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Confirmation */}
            {currentStep === "confirm" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Review Your Booking</h2>
                  <p className="text-gray-600">Make sure everything looks correct</p>
                </div>

                <div className="bg-[hsl(145,20%,75%)]/5 p-8 rounded-xl space-y-6 border border-[hsl(145,20%,75%)]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Location</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{formData.location}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Service</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{services.find(s => s.id === formData.service)?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{formData.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Pickup Date</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{formData.pickupDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Time</p>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{formData.pickupTime}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Address</p>
                    <p className="text-gray-900 mt-1">{formData.address}</p>
                  </div>
                  {formData.message && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Special Instructions</p>
                      <p className="text-gray-900 mt-1">{formData.message}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleChange("termsAccepted", checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                    >
                      I accept the{" "}
                      <a href="/terms" target="_blank" className="text-[hsl(145,20%,75%)] font-semibold hover:underline">
                        terms and conditions
                      </a>
                      , including 100% prepayment policy and damage/loss policies.
                    </label>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-3">
                  <Button
                    onClick={() => setCurrentStep("schedule")}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => mutation.mutate(formData)}
                    disabled={!canSubmit || mutation.isPending}
                    className="gap-2 bg-[hsl(145,20%,75%)] hover:bg-[hsl(145,20%,70%)] text-gray-900 md:min-w-48"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Confirm Booking <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info Below Form */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3 p-6 bg-white rounded-lg border border-gray-200">
            <Clock className="w-5 h-5 text-[hsl(145,20%,75%)] flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Business Hours</p>
              {hours.map((h, i) => (
                <p key={i} className="text-sm text-gray-600">{h.days}: {h.hours}</p>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-3 p-6 bg-white rounded-lg border border-gray-200">
            <Mail className="w-5 h-5 text-[hsl(145,20%,75%)] flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">Email</p>
              <a href={`mailto:${email}`} className="text-sm text-[hsl(145,20%,75%)] hover:underline">{email}</a>
            </div>
          </div>

          <div className="flex items-start gap-3 p-6 bg-white rounded-lg border border-gray-200">
            <MessageCircle className="w-5 h-5 text-[hsl(145,20%,75%)] flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-900">WhatsApp</p>
              <a href={`https://wa.me/${businessConfig.whatsapp?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[hsl(145,20%,75%)] hover:underline">Message us</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}