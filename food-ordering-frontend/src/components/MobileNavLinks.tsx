import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  FileText,
  Activity,
  UtensilsCrossed,
  Package,
  BarChart3,
  Zap,
  LogIn,
  Store,
} from "lucide-react";
import UsernameMenu from "./UsernameMenu";
import { useAppContext } from "@/contexts/AppContext";

const linkClass =
  "flex items-center gap-2 w-full py-3 font-bold hover:text-orange-500 transition-colors";

const MobileNavLinks = () => {
  const { isLoggedIn, userRole } = useAppContext();

  const canManageRestaurant = userRole === "restaurant_owner" || userRole === "admin";

  return (
    <div className="flex flex-col gap-1">
      <Link to="/search/all" className={linkClass}>
        <UtensilsCrossed className="h-4 w-4" />
        Restaurants
      </Link>
      <Link to="/order-status" className={linkClass}>
        <Package className="h-4 w-4" />
        Order Status
      </Link>
      {canManageRestaurant && (
        <Link to="/manage-restaurant" className={linkClass}>
          <Store className="h-4 w-4" />
          Manage Restaurant
        </Link>
      )}
      {userRole === "admin" && (
        <Link to="/admin" className={linkClass}>
          <Store className="h-4 w-4" />
          Admin Dashboard
        </Link>
      )}
      {canManageRestaurant && (
        <Link to="/business-insights" className={linkClass}>
          <BarChart3 className="h-4 w-4" />
          Business Insights
        </Link>
      )}
      {canManageRestaurant && (
        <Link to="/optimization" className={linkClass}>
          <Zap className="h-4 w-4" />
          Optimization
        </Link>
      )}
      {canManageRestaurant && (
        <div className="py-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            API
          </p>
          <Link to="/api-docs" className={`${linkClass} pl-4`}>
            <FileText className="h-4 w-4" />
            API Docs
          </Link>
          <Link to="/api-status" className={`${linkClass} pl-4`}>
            <Activity className="h-4 w-4" />
            API Status
          </Link>
        </div>
      )}

      <div className="h-px bg-border my-4" />

      <div className="min-h-[52px] flex items-center justify-center">
        {isLoggedIn ? (
          <UsernameMenu />
        ) : (
          <Link to="/sign-in" className="w-full">
            <Button className="w-full font-bold bg-orange-500 hover:bg-orange-600">
              <LogIn className="h-4 w-4 mr-2" />
              Log In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default MobileNavLinks;
