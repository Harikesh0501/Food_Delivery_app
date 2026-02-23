import { Request, Response } from "express";
import User from "../models/user";
import Restaurant from "../models/restaurant";
import Order from "../models/order";
import mongoose from "mongoose";

const getAdminStats = async (req: Request, res: Response) => {
    try {
        const [totalUsers, totalRestaurants, totalOrders, revenueResult] =
            await Promise.all([
                User.countDocuments(),
                Restaurant.countDocuments(),
                Order.countDocuments(),
                Order.aggregate([
                    { $match: { status: { $ne: "placed" } } },
                    { $group: { _id: null, total: { $sum: "$totalAmount" } } },
                ]),
            ]);

        const totalRevenue = revenueResult[0]?.total || 0;

        const roleCounts = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]);

        const orderStatusCounts = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        res.json({
            totalUsers,
            totalRestaurants,
            totalOrders,
            totalRevenue,
            roleCounts: roleCounts.reduce(
                (acc, r) => ({ ...acc, [r._id || "user"]: r.count }),
                {}
            ),
            orderStatusCounts: orderStatusCounts.reduce(
                (acc, s) => ({ ...acc, [s._id]: s.count }),
                {}
            ),
        });
    } catch (error) {
        console.error("Admin stats error:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
    }
};

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ _id: -1 })
            .lean();
        res.json(users);
    } catch (error) {
        console.error("Get users error:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        const validRoles = ["user", "restaurant_owner", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // Prevent admin from demoting themselves
        if (userId === req.userId) {
            return res
                .status(400)
                .json({ message: "Cannot change your own role" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (error) {
        console.error("Update role error:", error);
        res.status(500).json({ message: "Failed to update role" });
    }
};

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        if (userId === req.userId) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }

        // Also delete their restaurant and orders
        const restaurant = await Restaurant.findOne({
            user: new mongoose.Types.ObjectId(userId),
        });
        if (restaurant) {
            await Order.deleteMany({ restaurant: restaurant._id });
            await Restaurant.findByIdAndDelete(restaurant._id);
        }

        await User.findByIdAndDelete(userId);
        res.json({ message: "User deleted" });
    } catch (error) {
        console.error("Delete user error:", error);
        res.status(500).json({ message: "Failed to delete user" });
    }
};

const getAllRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find()
            .populate("user", "email name role")
            .sort({ lastUpdated: -1 })
            .lean();
        res.json(restaurants);
    } catch (error) {
        console.error("Get restaurants error:", error);
        res.status(500).json({ message: "Failed to fetch restaurants" });
    }
};

const deleteRestaurant = async (req: Request, res: Response) => {
    try {
        const { restaurantId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ message: "Invalid restaurant ID" });
        }

        await Order.deleteMany({ restaurant: restaurantId });
        await Restaurant.findByIdAndDelete(restaurantId);
        res.json({ message: "Restaurant deleted" });
    } catch (error) {
        console.error("Delete restaurant error:", error);
        res.status(500).json({ message: "Failed to delete restaurant" });
    }
};

const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await Order.find()
            .populate("restaurant", "restaurantName city")
            .populate("user", "email name")
            .sort({ createdAt: -1 })
            .lean();
        res.json(orders);
    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

export default {
    getAdminStats,
    getAllUsers,
    updateUserRole,
    deleteUser,
    getAllRestaurants,
    deleteRestaurant,
    getAllOrders,
};
