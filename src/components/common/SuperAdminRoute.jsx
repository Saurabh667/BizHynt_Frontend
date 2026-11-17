import { Navigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import PageSkeleton from "./PageSkeleton";


function SuperAdminRoute({ children }) {
  const { token, user, initialized } = useAuthStore();

  if (!initialized) {
    return <PageSkeleton />;
  }

  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }

  if (user && user.role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default SuperAdminRoute;
