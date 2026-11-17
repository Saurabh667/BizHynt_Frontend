import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import authService from "../../services/authService";
import useAuthStore from "../../store/authStore";
import SelectField from "../common/SelectField";

function Register() {
  const currentUser=useAuthStore(s=>s.user);
  const navigate = useNavigate();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await authService.register(data);

      toast.success(
        "User account created successfully!"
      );

      navigate("/admin/users");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Register User</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a new CRM user account. Access remains limited to the standard CRM routes.
        </p>
      </div>

      <div className="flex justify-center">

      

        <div
          className="
            w-full
            max-w-[441px]
            rounded-2xl
            border
            border-slate-200
            bg-white
            px-6
            py-5
            shadow-lg
            shadow-slate-200/50
            dark:border-slate-800
            dark:bg-slate-900
            dark:shadow-black/20
          "
        >

         

          <div className="mb-4 text-center">

            <div
              className="
                mx-auto
                mb-2
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-indigo-600
                text-lg
                font-bold
                text-white
              "
            >
              L
            </div>

            <h1
              className="
                text-xl
                font-bold
              "
            >
              User Account Details
            </h1>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
                dark:text-slate-400
              "
            >
              Enter the user and organization details below.
            </p>

          </div>



          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3"
          >

          

            <div>

              <label
                className="
                  mb-1
                  block
                  text-xs
                  font-medium
                "
              >
                Name
              </label>

              <div className="relative">

                <User
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="text"
                  placeholder="Your name"
                  {...register("name", {
                    required:
                      "Name is required",
                  })}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-3
                    text-xs
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/20
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                />

              </div>

              {errors.name && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.name.message}
                </p>
              )}

            </div>


          

            <div>

              <label
                className="
                  mb-1
                  block
                  text-xs
                  font-medium
                "
              >
                Email
              </label>

              <div className="relative">

                <Mail
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type="email"
                  placeholder="admin@company.com"
                  {...register("email", {
                    required:
                      "Email is required",
                  })}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-3
                    text-xs
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/20
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                />

              </div>

              {errors.email && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.email.message}
                </p>
              )}

            </div>


          
            <div>

              <label
                className="
                  mb-1
                  block
                  text-xs
                  font-medium
                "
              >
                Password
              </label>

              <div className="relative">

                <LockKeyhole
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="••••••••"
                  {...register("password", {
                    required:
                      "Password is required",
                    minLength: {
                      value: 8,
                      message:
                        "Minimum 8 characters",
                    },
                  })}
                  className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-slate-200
                    bg-slate-50
                    pl-9
                    pr-10
                    text-xs
                    outline-none
                    transition
                    focus:border-indigo-500
                    focus:ring-2
                    focus:ring-indigo-500/20
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>

              </div>

              {errors.password && (
                <p className="mt-0.5 text-[10px] text-red-500">
                  {errors.password.message}
                </p>
              )}

            </div>


          

            <div>
              <label className="mb-1 block text-xs font-medium">User Type</label>
              <Controller name="userType" control={control} defaultValue="lead_user" rules={{required:"User type is required"}} render={({field})=><SelectField {...field} error={errors.userType?.message} options={[{value:'lead_user',label:'Lead User'},...(currentUser?.role==='super_admin'?[{value:'admin',label:'Admin'}]:[])]}/>}/>
              <p className="mt-1 text-[10px] text-slate-500">Only Super Admin can create an Admin. Admins can create Lead Users.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                h-10
                w-full
                rounded-lg
                bg-indigo-600
                text-xs
                font-semibold
                text-white
                transition
                hover:bg-indigo-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading
                ? "Creating account..."
                : "Create Account"}
            </button>

          </form>


        </div>

      </div>

    </div>
  );
}

export default Register;