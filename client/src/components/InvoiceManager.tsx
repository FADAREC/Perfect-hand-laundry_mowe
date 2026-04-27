import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Save, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { updateBookingItems, generateInvoice } from "@/lib/api";
import { useLocation } from "wouter";

interface InvoiceManagerProps {
  bookingId: string;
  initialItems: any[];
  status: string;
}

export default function InvoiceManager({ bookingId, initialItems, status }: InvoiceManagerProps) {
  const [items, setItems] = useState<any[]>(initialItems || []);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Helper to add empty row
  const addRow = () => setItems([...items, { garmentType: "", quantity: 1, pricePerItem: 0 }]);

  // Save Items Mutation
  const saveMutation = useMutation({
    mutationFn: () => updateBookingItems(bookingId, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${bookingId}`] });
      toast({ title: "Items Saved", description: "Booking items updated successfully." });
    }
  });

  // Generate Invoice Mutation
  const generateMutation = useMutation({
    mutationFn: () => generateInvoice(bookingId),
    onSuccess: () => {
      toast({ title: "Invoice Generated", description: "Official invoice created." });
      setIsOpen(false);
      setLocation(`/invoice/${bookingId}`); // Redirect to view invoice
    }
  });

  const total = items.reduce((acc, i) => acc + (i.quantity * i.pricePerItem), 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="w-full sm:w-auto">
          <FileText className="mr-2 h-4 w-4" />
          {status === 'pending' ? 'Add Items & Invoice' : 'Manage Invoice'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Booking Items</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
            {items.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">No items added yet. Add items after pickup.</p>
            )}
            {items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <Input 
                  className="col-span-6" 
                  placeholder="Item Name" 
                  value={item.garmentType}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].garmentType = e.target.value;
                    setItems(newItems);
                  }}
                />
                <Input 
                  className="col-span-2" 
                  type="number" 
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].quantity = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <Input 
                  className="col-span-3" 
                  type="number" 
                  placeholder="Price"
                  value={item.pricePerItem}
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[idx].pricePerItem = Number(e.target.value);
                    setItems(newItems);
                  }}
                />
                <div className="col-span-1 text-center cursor-pointer text-red-500"
                   onClick={() => setItems(items.filter((_, i) => i !== idx))}>
                   x
                </div>
              </div>
            ))}
          </div>
          
          <Button variant="outline" size="sm" onClick={addRow} className="mt-4 w-full border-dashed">
            + Add Line Item
          </Button>

          <div className="flex justify-end mt-4 pt-4 border-t">
            <div className="text-lg font-bold">Total: ₦{total.toLocaleString()}</div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {/* Save Button */}
          <Button 
            variant="secondary" 
            onClick={() => saveMutation.mutate()} 
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>

          {/* Generate Invoice Button */}
          <Button 
            onClick={() => generateMutation.mutate()} 
            disabled={items.length === 0 || generateMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {generateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Finalize & Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}