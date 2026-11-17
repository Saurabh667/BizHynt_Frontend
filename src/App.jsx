import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useEffect } from "react";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AdminRoleRoute from "./components/common/AdminRoleRoute";

import Login from "./components/auth/Login";
import Dashboard from "./components/admin/Dashboard";
import Leads from "./components/admin/Leads";
import Analytics from "./components/admin/Analytics";
import NotFound from "./pages/NotFound";

import Home from "./pages/Home";
import useAuthStore from "./store/authStore";
import Profile from "./components/admin/Profile";

import LeadDetails from "./components/admin/LeadDetails";
import LeadImport from "./components/admin/LeadImport";

import Register from "./components/auth/Register";

import PublicHomeRoute from "./components/auth/PublicHomeRoute";

import SuperAdminCompanies from "./components/superadmin/SuperAdminCompanies";
import SuperAdminCompanyDetail from "./components/superadmin/SuperAdminCompanyDetail";
import SuperAdminLeadDetail from "./components/superadmin/SuperAdminLeadDetail";
import DomainTypes from "./components/admin/DomainTypes";
import Teams from "./components/admin/Teams";
import TeamDetails from "./components/admin/TeamDetails";
import Customers from "./components/admin/Customers";
import AuditLogs from "./components/admin/AuditLogs";
import SocialMediaCustomers from "./features/social-media-customers/SocialMediaCustomers";
import BusinessCategories from "./features/social-media-customers/BusinessCategories";
import SocialMediaPlatforms from "./features/social-media-customers/SocialMediaPlatforms";
import SocialCustomerForm from "./features/social-media-customers/CustomerForm";
import SocialCustomerEditPage from "./features/social-media-customers/CustomerEditPage";
import SocialCustomerDetails from "./features/social-media-customers/CustomerDetails";
import TermsConditions from "./features/social-media-customers/TermsConditions";


function App() {

  const loadUser = useAuthStore(
    (state) => state.loadUser
  );

  useEffect(() => {
    loadUser();
  }, [loadUser]);


  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={
            <PublicHomeRoute>
              <Login />
            </PublicHomeRoute>
          }
        />



        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          <Route index element={<Navigate to="dashboard" replace />} />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="leads"
            element={<Leads />}
          />


          <Route
            path="analytics"
            element={<Analytics />}
          />
          <Route
            path="profile"
            element={<Profile />}
          />
          <Route
            path="leads/:id"
            element={<LeadDetails />}
          />

          {/* Super-admin capabilities use the same Admin layout/design. */}
          <Route path="platform" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="leads/import" element={<AdminRoleRoute><LeadImport /></AdminRoleRoute>} />

          <Route path="users" element={<AdminRoleRoute><SuperAdminCompanies /></AdminRoleRoute>} />
          <Route path="users/register" element={<AdminRoleRoute><Register /></AdminRoleRoute>} />
          <Route path="all-leads" element={<Navigate to="/admin/leads" replace />} />
          <Route path="domains" element={<DomainTypes />} />
          <Route path="teams" element={<AdminRoleRoute><Teams /></AdminRoleRoute>} />
          <Route path="teams/:id" element={<AdminRoleRoute><TeamDetails /></AdminRoleRoute>} />
          <Route path="customers" element={<Customers />} />
          <Route path="social-media" element={<AdminRoleRoute><SocialMediaCustomers /></AdminRoleRoute>} />
          <Route path="social-media/terms" element={<AdminRoleRoute><TermsConditions /></AdminRoleRoute>} />
          <Route path="social-media/platforms" element={<AdminRoleRoute><SocialMediaPlatforms /></AdminRoleRoute>} />
          <Route path="social-media/business-categories" element={<AdminRoleRoute><BusinessCategories /></AdminRoleRoute>} />
          <Route path="social-media-customers" element={<AdminRoleRoute><SocialMediaCustomers /></AdminRoleRoute>} />
          <Route path="social-media-customers/new" element={<AdminRoleRoute><SocialCustomerForm /></AdminRoleRoute>} />
          <Route path="social-media-customers/:id/edit" element={<AdminRoleRoute><SocialCustomerEditPage /></AdminRoleRoute>} />
          <Route path="social-media-customers/:id" element={<AdminRoleRoute><SocialCustomerDetails /></AdminRoleRoute>} />
          <Route path="activity" element={<AdminRoleRoute><AuditLogs /></AdminRoleRoute>} />
          <Route path="users/:companyId" element={<AdminRoleRoute><SuperAdminCompanyDetail /></AdminRoleRoute>} />
          <Route path="users/:companyId/leads/:leadId" element={<AdminRoleRoute><SuperAdminLeadDetail /></AdminRoleRoute>} />

        </Route>

        <Route path="/super-admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/super-admin/*" element={<Navigate to="/admin/dashboard" replace />} />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;