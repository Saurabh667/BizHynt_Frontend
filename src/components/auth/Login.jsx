

import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useAuthStore from "../../store/authStore";
import ThemeToggle from "../common/ThemeToggle";
import logo from '../../assets/logo_transparent.png'
import quoteSlide from "../../data/slideQuotes.json"

const slides = quoteSlide;

function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { login, loading, token } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [quoteSlide] = useState(
    () => Math.floor(Math.random() * slides.length)
  );
  /*
   * -----------------------------------------
   * AUTH API LOGIC
   * -----------------------------------------
   */
  const onSubmit = async (data) => {
    try {
      await login(data);

      toast.success("Welcome back to LeadFlow!");

      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  // /*
  //  * -----------------------------------------
  //  * CAROUSEL
  //  * -----------------------------------------
  //  */
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // const slide = slides[currentSlide];
  const quote = slides[quoteSlide];
  return (
    // <div className="min-h-[99vh] bg-[#F1F4F9] px-4 py-6 font-sans sm:px-6 lg:px-8">
    <div className="flex min-h-screen h-screen items-center justify-center bg-[#F1F4F9] px-4 py-6 font-sans sm:px-6 lg:px-8">


      {/* Main Login Container */}
      <div className="mx-auto grid min-h-[680px] w-full max-w-[1100px] overflow-hidden rounded-[28px] bg-white shadow-[0_25px_70px_rgba(15,23,42,0.14)] lg:grid-cols-2 dark:bg-slate-900">
        {/* =====================================================
            LEFT SIDE - CAROUSEL
        ====================================================== */}
        <div
          className="relative hidden overflow-hidden lg:block"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background images */}
          {slides.map((item, index) => (
            <img
              key={`${item.image}-${index}`}
              src={item.image}
              alt=""
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === currentSlide
                ? "opacity-100"
                : "opacity-0"
                }`}
            />
          ))}

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/65 to-violet-950/75" />

          {/* Centered carousel content */}
          <div className="relative z-10 flex h-full items-center p-10 xl:p-12">
            <div className="w-full max-w-[480px]">

              <div className="max-w-[480px]">

                {/* CRM - Top Center */}
                <h1 className="absolute left-1/2 top-25 -translate-x-1/2 text-[110px] font-black leading-none tracking-tight text-white xl:text-7xl">
                  BizHynt
                </h1>

                {/* Bottom Center Content */}
                <div className="absolute bottom-40 left-1/2 w-full max-w-[500px] -translate-x-1/2 px-6 text-center">
                  {/* Divider */}
                  <div className="mx-auto mb-5 h-px w-20 bg-violet-400" />

                  {/* Slide Tag */}
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-200">
                    {quote.tag}
                  </p>

                  {/* Quote */}
                  <p className="mx-auto mt-4 max-w-[430px] text-lg leading-8 text-white/85 xl:text-xl">
                    {quote.quote}
                  </p>

                  {/* Author */}
                  <p className="mt-4 text-sm font-medium text-white/55">
                    — {quote.author}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            RIGHT SIDE - LOGIN FORM
        ====================================================== */}
        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-12 dark:bg-slate-900">
          <div className="w-full max-w-[340px]">
            {/* Logo */}

            <div className="mb-7 text-center">
              {/* <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-xl  text-xl font-black text-white  mx-auto">
                <img src={logo} alt="" />
              </div> */}
              <div className="mb-5 flex items-center justify-center mx-auto w-full">
                <img
                  src={logo}
                  alt="BizHynt Logo"
                  className="h-auto w-56 max-w-full object-contain"
                />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome to BizHynt
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Sign in to manage your leads
              </p>
            </div>

            {/* Login Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Email Address
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value:
                          /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message:
                          "Please enter a valid email address",
                      },
                    })}
                    className={`h-11 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/10 dark:border-slate-700"
                      }`}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    className={`h-11 w-full rounded-xl border bg-white pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 dark:bg-slate-950 dark:text-white ${errors.password
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-violet-500 focus:ring-violet-500/10 dark:border-slate-700"
                      }`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between gap-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                  />
                  Remember me
                </label>

              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-[11px] text-slate-400">
              © {new Date().getFullYear()} BizHynt. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;