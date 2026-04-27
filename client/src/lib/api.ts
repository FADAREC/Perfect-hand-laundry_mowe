// client/src/lib/api.ts

export async function createWalkInOrder(data: any) {
  const res = await fetch("/api/pos/walk-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create walk-in order");
  return res.json();
}

export async function generateInvoice(bookingId: string) {
  const res = await fetch(`/api/bookings/${bookingId}/invoice`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate invoice");
  return res.json();
}

export async function updateBookingItems(bookingId: string, items: any[]) {
  const res = await fetch(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, status: "confirmed" }),
  });
  if (!res.ok) throw new Error("Failed to update items");
  return res.json();
}