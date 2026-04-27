import { useQuery } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, ArrowLeft } from "lucide-react";
import { type Booking, type GarmentPricing } from "@shared/schema";
import { businessConfig } from "../../../config/business";

export default function Invoice() {
    const [, params] = useRoute("/invoice/:id");
    const [, setLocation] = useLocation();
    const id = params?.id;

    const { data: booking, isLoading } = useQuery<Booking>({
        queryKey: [`/api/bookings/${id}`],
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Invoice Not Found</h1>
                <Button onClick={() => setLocation("/")}>Go Home</Button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const totalPrice = booking.finalPrice || booking.estimatedPrice || "0.00";
    const items = booking.items || [];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
            <div className="max-w-3xl mx-auto print:max-w-none">

                {/* Navigation - Hidden in Print */}
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <Button variant="outline" onClick={() => setLocation(`/tracking/${id}`)}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Tracking
                    </Button>
                    <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Invoice
                    </Button>
                </div>

                <Card className="print:shadow-none print:border-none">
                    <CardHeader className="border-b pb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-primary">{businessConfig.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">{businessConfig.tagline}</p>
                                <div className="mt-4 text-sm text-gray-600">
                                    <p>{businessConfig.locations[0].address}</p>
                                    <p>{businessConfig.primaryPhone}</p>
                                    <p>{businessConfig.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                                <p className="text-sm text-gray-500 mt-1">#{booking.orderNumber || booking.id.slice(0, 8)}</p>
                                <p className="text-sm font-medium mt-2">
                                    Date: {new Date(booking.createdAt).toLocaleDateString()}
                                </p>
                                <div className="mt-4 p-2 bg-gray-100 rounded text-sm print:bg-transparent print:border">
                                    <span className={`font-bold uppercase ${booking.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
                                        }`}>
                                        {booking.paymentStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bill To</h3>
                                <p className="font-bold text-gray-900">{booking.customerName}</p>
                                <p className="text-gray-600">{booking.customerPhone}</p>
                                <p className="text-gray-600">{booking.customerEmail}</p>
                                <p className="text-gray-600">{booking.pickupAddress}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Service Details</h3>
                                <p className="font-medium">{booking.serviceType.toUpperCase()}</p>
                                <p className="text-gray-600">Pickup: {booking.preferredPickupDate}</p>
                                <p className="text-gray-600">Time: {booking.preferredPickupTime}</p>
                                {booking.isExpress && <p className="text-red-500 font-bold mt-1">EXPRESS SERVICE</p>}
                            </div>
                        </div>

                        <div className="mt-8">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="py-3 font-semibold text-gray-700">Description</th>
                                        <th className="py-3 font-semibold text-gray-700 text-right">Quantity</th>
                                        <th className="py-3 font-semibold text-gray-700 text-right">Unit Price</th>
                                        <th className="py-3 font-semibold text-gray-700 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(items as any[]).length > 0 ? (
                                        (items as any[]).map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="py-4 text-gray-800">{item.garmentType}</td>
                                                <td className="py-4 text-right">{item.quantity}</td>
                                                <td className="py-4 text-right">₦{item.pricePerItem}</td>
                                                <td className="py-4 text-right">₦{(item.quantity * item.pricePerItem).toLocaleString()}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                                                Items will be itemized after pickup and inspection in the admin dashboard.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={3} className="pt-6 text-right font-medium">Subtotal</td>
                                        <td className="pt-6 text-right font-medium">₦{Number(totalPrice).toLocaleString()}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} className="pt-2 text-right font-medium">Tax (0%)</td>
                                        <td className="pt-2 text-right font-medium">₦0.00</td>
                                    </tr>
                                    <tr className="text-lg">
                                        <td colSpan={3} className="pt-4 text-right font-bold">Total</td>
                                        <td className="pt-4 text-right font-bold text-primary">₦{Number(totalPrice).toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="mt-12 text-sm text-gray-500 pt-6 border-t">
                            <p className="font-semibold mb-1">Terms & Conditions:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Payment is required before delivery.</li>
                                <li>We are not responsible for natural wear and tear.</li>
                                <li>Items left for more than 30 days will be donated.</li>
                            </ul>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-gray-50 border-t p-6 text-center text-xs text-gray-500 print:hidden">
                        Thank you for your business!
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
