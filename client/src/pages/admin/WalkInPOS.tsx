import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Calculator, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createWalkInOrder } from "@/lib/api";
import { useToast } from "@/hooks/use-toast"; // Assuming you have a toast hook

interface OrderItem {
  garmentType: string;
  quantity: number;
  pricePerItem: number;
}

export default function WalkInPOS() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Customer State
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "" });
  
  // Items State
  const [items, setItems] = useState<OrderItem[]>([
    { garmentType: "", quantity: 1, pricePerItem: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { garmentType: "", quantity: 1, pricePerItem: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.quantity * item.pricePerItem), 0);
  };

  const mutation = useMutation({
    mutationFn: createWalkInOrder,
    onSuccess: (data) => {
      toast({ title: "Success", description: "Order created! Redirecting to invoice..." });
      // Redirect immediately to the invoice page to print
      setLocation(`/invoice/${data.bookingId}`);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create order", variant: "destructive" });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) {
      toast({ title: "Missing Info", description: "Customer Name and Phone are required", variant: "destructive" });
      return;
    }
    mutation.mutate({ 
      customerName: customer.name, 
      customerPhone: customer.phone, 
      customerEmail: customer.email, 
      items 
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Walk-in / POS</h1>
        <div className="text-xl font-mono bg-primary/10 text-primary px-4 py-2 rounded-md">
          Total: ₦{calculateTotal().toLocaleString()}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Details Section */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Customer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input 
                id="phone" 
                placeholder="080..." 
                value={customer.phone}
                onChange={(e) => setCustomer({...customer, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={customer.name}
                onChange={(e) => setCustomer({...customer, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={customer.email}
                onChange={(e) => setCustomer({...customer, email: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items Section */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Order Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end border-b pb-4 last:border-0">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Garment Type</Label>
                    <Input 
                      placeholder="e.g. Shirt, Suit" 
                      value={item.garmentType}
                      onChange={(e) => updateItem(index, "garmentType", e.target.value)}
                    />
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Qty</Label>
                    <Input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label className="text-xs">Price (₦)</Label>
                    <Input 
                      type="number" 
                      min="0"
                      value={item.pricePerItem}
                      onChange={(e) => updateItem(index, "pricePerItem", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 mb-0.5"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t flex justify-end">
              <Button size="lg" disabled={mutation.isPending} type="submit">
                {mutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Calculator className="mr-2 h-4 w-4" />
                )}
                Generate Invoice & Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}