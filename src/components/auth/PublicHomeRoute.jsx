import { Navigate } from "react-router-dom";

function PublicHomeRoute({ children }) {
  const token = localStorage.getItem(
    "leadflow_token"
  );

  if (token) {
    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }
  return children;
}

export default PublicHomeRoute;