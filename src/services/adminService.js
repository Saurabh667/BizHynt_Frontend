import api from "./api";

// All calls here hit /api/admin/*, which is locked to the super_admin
// role on the backend (see backend/middleware/authMiddleware.js).

const getOverview = async () => {
  const response = await api.get("/admin/overview");
  return response.data;
};

const getCompanies = async (params = {}) => {
  const response = await api.get("/admin/companies", { params });
  return response.data;
};

const getCompanyProfile = async (companyId) => {
  const response = await api.get(`/admin/companies/${companyId}`);
  return response.data;
};

const getCompanyLeads = async (companyId, params = {}) => {
  const response = await api.get(`/admin/companies/${companyId}/leads`, { params });
  return response.data;
};

const getCompanyLeadDetail = async (companyId, leadId) => {
  const response = await api.get(`/admin/companies/${companyId}/leads/${leadId}`);
  return response.data;
};

const getAllLeads = async (params = {}) => {
  const response = await api.get("/admin/leads", { params });
  return response.data;
};

const getAuditLogs=async(params={})=>(await api.get("/admin/audit-logs",{params})).data;

const getUserProfile=getCompanyProfile;
const getUserLeads=getCompanyLeads;
const getUserLeadDetail=getCompanyLeadDetail;

const adminService = {
  getAuditLogs,
  getUserProfile,
  getUserLeads,
  getUserLeadDetail,
  getAllLeads,
  getOverview,
  getCompanies,
  getCompanyProfile,
  getCompanyLeads,
  getCompanyLeadDetail,
};

export default adminService;
