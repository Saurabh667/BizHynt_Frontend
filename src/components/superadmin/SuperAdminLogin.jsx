import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";
import ThemeToggle from "../common/ThemeToggle";

// A separate, unlinked entry point for the platform admin — kept out
// of the normal nav/login UI on purpose. Anyone landing here still
// needs a real super_admin account; a company account that logs in
// here is signed back out and told this area isn't for them.
function SuperAdminLogin() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login, logout, loading, token, user } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  if (token && user?.role === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }

  const onSubmit = async (data) => {
    try {
      const response = await login(data);

      if (response.user?.role !== "super_admin") {
        logout();
        toast.error("This account doesn't have platform admin access.");
        return;
      }

      toast.success("Welcome back.");
      navigate("/super-admin");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-xl shadow-black/30">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-indigo-400">
              <ShieldCheck size={26} />
            </div>

            <h1 className="text-2xl font-bold">Platform Admin</h1>

            <p className="mt-2 text-sm text-slate-400">
              Restricted access — sign in with your super admin account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type="email"
                  placeholder="superadmin@leadnova.com"
                  {...register("email", { required: "Email is required" })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-4 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Password</label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", { required: "Password is required" })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-10 pr-12 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLogin;
