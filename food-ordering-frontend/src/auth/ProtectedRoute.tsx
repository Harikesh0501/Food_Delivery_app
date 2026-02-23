import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "@/contexts/AppContext";
import { useEffect } from "react";

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isLoggedIn, userRole } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/sign-in", { state: { from: location } });
    } else if (allowedRoles && !allowedRoles.includes(userRole)) {
      navigate("/", { replace: true });
    }
  }, [isLoggedIn, userRole, allowedRoles, navigate, location]);

  if (!isLoggedIn) return null;
  if (allowedRoles && !allowedRoles.includes(userRole)) return null;
  return <Outlet />;
};

export default ProtectedRoute;
