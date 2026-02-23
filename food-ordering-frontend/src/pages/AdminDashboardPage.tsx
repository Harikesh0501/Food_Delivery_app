import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    Store,
    ShoppingCart,
    DollarSign,
    Search,
    Trash2,
    Shield,
    Loader2,
} from "lucide-react";
import {
    useAdminStats,
    useAdminUsers,
    useAdminRestaurants,
    useAdminOrders,
    useUpdateUserRole,
    useDeleteUser,
    useDeleteRestaurant,
} from "@/api/AdminApi";

const AdminDashboardPage = () => {
    const { data: stats, isLoading: statsLoading } = useAdminStats();
    const { data: users, isLoading: usersLoading } = useAdminUsers();
    const { data: restaurants, isLoading: restaurantsLoading } = useAdminRestaurants();
    const { data: orders, isLoading: ordersLoading } = useAdminOrders();
    const updateRole = useUpdateUserRole();
    const deleteUser = useDeleteUser();
    const deleteRestaurant = useDeleteRestaurant();

    const [userSearch, setUserSearch] = useState("");
    const [restaurantSearch, setRestaurantSearch] = useState("");
    const [orderSearch, setOrderSearch] = useState("");

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP",
        }).format((amount || 0) / 100);

    const formatDate = (d: string) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-red-100 text-red-800",
            restaurant_owner: "bg-blue-100 text-blue-800",
            user: "bg-gray-100 text-gray-800",
        };
        return colors[role] || colors.user;
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            placed: "bg-gray-100 text-gray-800",
            paid: "bg-blue-100 text-blue-800",
            inProgress: "bg-yellow-100 text-yellow-800",
            outForDelivery: "bg-orange-100 text-orange-800",
            delivered: "bg-green-100 text-green-800",
        };
        return colors[status] || colors.placed;
    };

    const filteredUsers = (users || []).filter(
        (u) =>
            u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            (u.name || "").toLowerCase().includes(userSearch.toLowerCase())
    );

    const filteredRestaurants = (restaurants || []).filter(
        (r) =>
            r.restaurantName.toLowerCase().includes(restaurantSearch.toLowerCase()) ||
            r.city.toLowerCase().includes(restaurantSearch.toLowerCase())
    );

    const filteredOrders = (orders || []).filter(
        (o) =>
            o.deliveryDetails.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
            o.deliveryDetails.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
            (o.restaurant?.restaurantName || "").toLowerCase().includes(orderSearch.toLowerCase())
    );

    if (statsLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-500" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                        <div className="flex gap-2 mt-1">
                            {stats?.roleCounts &&
                                Object.entries(stats.roleCounts).map(([role, count]) => (
                                    <Badge key={role} variant="outline" className="text-xs">
                                        {role.replace("_", " ")}: {count}
                                    </Badge>
                                ))}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
                        <Store className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.totalRestaurants || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {stats?.orderStatusCounts &&
                                Object.entries(stats.orderStatusCounts).map(
                                    ([status, count]) => (
                                        <Badge
                                            key={status}
                                            className={`text-xs ${getStatusBadge(status)}`}
                                        >
                                            {status}: {count}
                                        </Badge>
                                    )
                                )}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(stats?.totalRevenue || 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="users">
                <TabsList>
                    <TabsTrigger value="users">
                        Users ({users?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="restaurants">
                        Restaurants ({restaurants?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                        Orders ({orders?.length || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search users by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {usersLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">User</th>
                                            <th className="text-left p-3 font-medium">Email</th>
                                            <th className="text-left p-3 font-medium">Role</th>
                                            <th className="text-left p-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        {user.image ? (
                                                            <img
                                                                src={user.image}
                                                                alt=""
                                                                className="h-8 w-8 rounded-full"
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-medium">
                                                                {(user.name || user.email)[0].toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="font-medium">
                                                            {user.name || "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-muted-foreground">
                                                    {user.email}
                                                </td>
                                                <td className="p-3">
                                                    <Select
                                                        value={user.role}
                                                        onValueChange={(role) =>
                                                            updateRole.mutate({
                                                                userId: user._id,
                                                                role,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger className="w-[160px]">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="user">User</SelectItem>
                                                            <SelectItem value="restaurant_owner">
                                                                Restaurant Owner
                                                            </SelectItem>
                                                            <SelectItem value="admin">Admin</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="p-3">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            if (
                                                                confirm(
                                                                    `Delete user ${user.email}? This will also delete their restaurant and orders.`
                                                                )
                                                            )
                                                                deleteUser.mutate(user._id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredUsers.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No users found
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* Restaurants Tab */}
                <TabsContent value="restaurants" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search restaurants by name or city..."
                            value={restaurantSearch}
                            onChange={(e) => setRestaurantSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {restaurantsLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredRestaurants.map((r) => (
                                <Card key={r._id} className="overflow-hidden">
                                    <div className="h-32 overflow-hidden">
                                        <img
                                            src={r.imageUrl}
                                            alt={r.restaurantName}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <CardContent className="p-4 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-lg">
                                                {r.restaurantName}
                                            </h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            `Delete "${r.restaurantName}"? All orders will also be deleted.`
                                                        )
                                                    )
                                                        deleteRestaurant.mutate(r._id);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {r.city}, {r.country}
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {r.cuisines.slice(0, 3).map((c) => (
                                                <Badge key={c} variant="outline" className="text-xs">
                                                    {c}
                                                </Badge>
                                            ))}
                                            {r.cuisines.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{r.cuisines.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                        {r.user && (
                                            <p className="text-xs text-muted-foreground">
                                                Owner: {r.user.name || r.user.email}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                            {filteredRestaurants.length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground">
                                    No restaurants found
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                {/* Orders Tab */}
                <TabsContent value="orders" className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders by customer, email, or restaurant..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {ordersLoading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
                        </div>
                    ) : (
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Customer</th>
                                            <th className="text-left p-3 font-medium">Restaurant</th>
                                            <th className="text-left p-3 font-medium">Items</th>
                                            <th className="text-left p-3 font-medium">Total</th>
                                            <th className="text-left p-3 font-medium">Status</th>
                                            <th className="text-left p-3 font-medium">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredOrders.map((order) => (
                                            <tr key={order._id} className="hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div>
                                                        <div className="font-medium">
                                                            {order.deliveryDetails.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {order.deliveryDetails.email}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {order.restaurant?.restaurantName || "—"}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex flex-wrap gap-1">
                                                        {order.cartItems.map((item, i) => (
                                                            <Badge
                                                                key={i}
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {item.quantity}× {item.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="p-3 font-medium">
                                                    {formatCurrency(order.totalAmount)}
                                                </td>
                                                <td className="p-3">
                                                    <Badge
                                                        className={`${getStatusBadge(order.status)}`}
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-muted-foreground text-xs">
                                                    {formatDate(order.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredOrders.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No orders found
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminDashboardPage;
