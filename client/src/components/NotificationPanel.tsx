import { X, Package, BellOff } from "lucide-react";
import { useEffect } from "react";
import { type Booking } from "@shared/schema";

interface NotificationPanelProps {
  onClose: () => void;
  bookings: Booking[];
}

export function NotificationPanel({ onClose, bookings }: NotificationPanelProps) {
  // When the panel opens, save the ID of the most recent booking to localStorage
  useEffect(() => {
    if (bookings && bookings.length > 0) {
      const latestId = bookings[0].id.toString();
      localStorage.setItem("lastSeenOrder", latestId);
      // Trigger a storage event so the bell icon red dot updates immediately
      window.dispatchEvent(new Event("storage"));
    }
  }, [bookings]);

  return (
    <div className="fixed top-16 right-6 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-2">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-bold text-gray-900">Notifications</h3>
        <button onClick={onClose} className="hover:bg-gray-100 rounded p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {bookings.length > 0 ? (
          bookings.slice(0, 5).map((booking) => (
            <div key={booking.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200 animate-in fade-in">
              <div className="flex items-start gap-2">
                <Package className="w-4 h-4 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-blue-900 capitalize">
                    New {booking.serviceType.replace('-', ' ')}
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Order #{booking.orderNumber} from {booking.customerName}
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