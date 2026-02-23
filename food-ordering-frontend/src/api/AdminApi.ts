import { useMutation, useQuery, useQueryClient } from "react-query";
import { axiosInstance } from "@/lib/api-client";
import { toast } from "sonner";

// Types
export interface AdminStats {
    totalUsers: number;
    totalRestaurants: number;
    totalOrders: number;
    totalRevenue: number;
    roleCounts: Record<string, number>;
    orderStatusCounts: Record<string, number>;
}

export interface AdminUser {
    _id: string;
    email: string;
    name?: string;
    role: string;
    image?: string;
    city?: string;
    country?: string;
}

export interface AdminRestaurant {
    _id: string;
    restaurantName: string;
    city: string;
    country: string;
    cuisines: string[];
    imageUrl: string;
    lastUpdated: string;
    user?: { _id: string; email: string; name?: string; role: string };
}

export interface AdminOrder {
    _id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    deliveryDetails: {
        email: string;
        name: string;
        addressLine1: string;
        city: string;
    };
    cartItems: { menuItemId: string; name: string; quantity: number }[];
    restaurant?: { _id: string; restaurantName: string; city: string };
    user?: { _id: string; email: string; name?: string };
}

// Hooks
export const useAdminStats = () => {
    return useQuery<AdminStats>("adminStats", async () => {
        const res = await axiosInstance.get("/api/admin/stats");
        return res.data;
    });
};

export const useAdminUsers = () => {
    return useQuery<AdminUser[]>("adminUsers", async () => {
        const res = await axiosInstance.get("/api/admin/users");
        return res.data;
    });
};

export const useAdminRestaurants = () => {
    return useQuery<AdminRestaurant[]>("adminRestaurants", async () => {
        const res = await axiosInstance.get("/api/admin/restaurants");
        return res.data;
    });
};

export const useAdminOrders = () => {
    return useQuery<AdminOrder[]>("adminOrders", async () => {
        const res = await axiosInstance.get("/api/admin/orders");
        return res.data;
    });
};

export const useUpdateUserRole = () => {
    const qc = useQueryClient();
    return useMutation(
        async ({ userId, role }: { userId: string; role: string }) => {
            const res = await axiosInstance.patch(`/api/admin/users/${userId}/role`, {
                role,
            });
            return res.data;
        },
        {
            onSuccess: () => {
                qc.invalidateQueries("adminUsers");
                qc.invalidateQueries("adminStats");
                toast.success("User role updated");
            },
            onError: () => { toast.error("Failed to update role"); },
        }
    );
};

export const useDeleteUser = () => {
    const qc = useQueryClient();
    return useMutation(
        async (userId: string) => {
            const res = await axiosInstance.delete(`/api/admin/users/${userId}`);
            return res.data;
        },
        {
            onSuccess: () => {
                qc.invalidateQueries("adminUsers");
                qc.invalidateQueries("adminStats");
                toast.success("User deleted");
            },
            onError: () => { toast.error("Failed to delete user"); },
        }
    );
};

export const useDeleteRestaurant = () => {
    const qc = useQueryClient();
    return useMutation(
        async (restaurantId: string) => {
            const res = await axiosInstance.delete(
                `/api/admin/restaurants/${restaurantId}`
            );
            return res.data;
        },
        {
            onSuccess: () => {
                qc.invalidateQueries("adminRestaurants");
                qc.invalidateQueries("adminStats");
                toast.success("Restaurant deleted");
            },
            onError: () => { toast.error("Failed to delete restaurant"); },
        }
    );
};
