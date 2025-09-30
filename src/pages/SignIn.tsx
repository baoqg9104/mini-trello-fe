import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { jwtDecode } from "jwt-decode";
import axiosInstance from "../utils/axiosInstance";
import type { AxiosError } from "axios";
import { toast } from "react-toastify";
import { useGithubSignIn } from "../hooks/useGithubSignIn";
import type { JwtPayload } from "../types/auth";

interface FormValues {
  email: string;
  code: string;
}

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  code: yup
    .string()
    .default("")
    .test("code-format", "Code must be 6 digits", (value) => {
      if (!value) return true;
      return /^\d{6}$/.test(value);
    }),
}) as yup.ObjectSchema<FormValues>;

export const SignIn = () => {
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { email: "", code: "" },
    mode: "onChange",
  });

  const onSendCode: SubmitHandler<FormValues> = async (data: FormValues) => {
    setLoading(true);
    try {
      await axiosInstance.post("/auth/send-code", { email: data.email });
      setCodeSent(true);
      toast.success("Verification code sent to your email");
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const msg = axiosErr.response?.data?.error || "Failed to send code";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onSignIn: SubmitHandler<FormValues> = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/signin", {
        email: data.email,
        verificationCode: data.code,
      });
      const { accessToken } = res.data;
      if (accessToken) {
        const decoded = jwtDecode<JwtPayload>(accessToken);
        dispatch(login({ id: decoded.id, email: decoded.email, accessToken }));
      }
      toast.success("Sign in successful!");
      navigate("/", { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ error?: string }>;
      const msg = axiosErr.response?.data?.error || "Failed to sign in";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = useGithubSignIn();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/trello-icon.png"
            alt="App Logo"
            className="w-12 h-12 mb-2"
          />
          <h1 className="text-2xl font-bold text-gray-800">Sign In</h1>
        </div>
        <form
          onSubmit={
            codeSent ? handleSubmit(onSignIn) : handleSubmit(onSendCode)
          }
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register("email")}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={codeSent}
              autoComplete="email"
            />
            <div className="min-h-[25px] mt-1">
              {errors.email && (
                <p className="text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
          {!codeSent && (
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              disabled={loading || !isValid}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          )}
          {codeSent && (
            <>
              <div>
                <label
                  htmlFor="code"
                  className="block font-medium text-gray-700"
                >
                  Verification Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  {...register("code")}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\D/g, "");
                    setValue("code", input.value, { shouldValidate: true });
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 tracking-widest text-lg text-center"
                  autoComplete="one-time-code"
                />
                <div className="min-h-[25px] mt-1">
                  {errors.code && (
                    <p className="text-red-500">{errors.code.message}</p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-60"
                disabled={getValues("code").length !== 6}
              >
                Sign In
              </button>
            </>
          )}
        </form>
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-2 text-gray-400">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>
        <button
          onClick={handleGithubLogin}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md font-semibold bg-black text-white hover:bg-gray-900 transition"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.207 11.387.6.113.793-.262.793-.582 0-.288-.012-1.243-.017-2.252-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.606-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.804 5.624-5.475 5.92.43.37.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.192.699.8.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </button>
        <div className="mt-6 text-center">
          <span className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};
