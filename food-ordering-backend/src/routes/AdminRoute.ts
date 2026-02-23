import express from "express";
import AdminController from "../controllers/AdminController";
import verifyToken, { requireRole } from "../middleware/auth";

const router = express.Router();

// All admin routes require authentication + admin role
router.use(verifyToken);
router.use(requireRole("admin"));

router.get("/stats", AdminController.getAdminStats);
router.get("/users", AdminController.getAllUsers);
router.patch("/users/:userId/role", AdminController.updateUserRole);
router.delete("/users/:userId", AdminController.deleteUser);
router.get("/restaurants", AdminController.getAllRestaurants);
router.delete("/restaurants/:restaurantId", AdminController.deleteRestaurant);
router.get("/orders", AdminController.getAllOrders);

export default router;
