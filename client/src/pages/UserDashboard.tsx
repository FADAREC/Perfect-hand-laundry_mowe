import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle } from "lucide-react";
import { type Booking } from "@shared/schema";

// Mock user ID for now - in a real app this would come from auth context
const MOCK_USER_ID = "user-123";

export default function UserDashboard() {
    const [, setLocation] = useLocation();

    // In a real implementation, we'd get the user ID from the auth context
    // For now, we'll assume the user is logged in or redirect if not
    const userId = localStorage.getItem("userId");

    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: [`/api/bookings/user/${userId}`],
        enabled: !!userId,
    });

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md mx-4">
                    <CardHeader>
                        <CardTitle className="text-center">Please Log In</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                        <Button onClick={() => setLocation("/auth")}>Go to Login</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                    <Button onClick={() => setLocation("/")}>New Booking</Button>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bookings && bookings.filter(b => b.status !== 'delivered' && b.status !== 'cancelled').length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No active orders</p>
                            ) : (
                                <div className="space-y-4">
                                    {bookings?.filter(b => b.status !== 'delivered' && b.status !== 'cancelled').map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => setLocation(`/tracking/${booking.id}`)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-primary/10 rounded-full">
                                                    <Package className="h-6 w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Order #{booking.id.slice(0, 8)}</p>
                                                    <p className="text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize
                          ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-green-100 text-green-800'}`}>
                                                    {booking.status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {bookings && bookings.filter(b => b.status === 'delivered' || b.status === 'cancelled').length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No past orders</p>
                            ) : (
                                <div className="space-y-4">
                                    {bookings?.filter(b => b.status === 'delivered' || b.status === 'cancelled').map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => setLocation(`/tracking/${booking.id}`)}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-gray-100 rounded-full">
                                                    <CheckCircle className="h-6 w-6 text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Order #{booking.id.slice(0, 8)}</p>
                                                    <p className="text-sm text-gray-500">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 capitalize">
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
