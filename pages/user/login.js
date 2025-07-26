import Layout from "@/components/Layout";
import { LockKeyhole } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useState } from "react";

export default function Login() {
  const [authMode, setAuthMode] = useState("login");
  const [loading, setLoading] = useState(false);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
  <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/70 backdrop-blur-md border border-gray-200">
  
        {/* Login card */}
        <div className="relative z-10 w-full max-w-md p-8 rounded-2xl shadow-xl bg-white/70 backdrop-blur-md border border-gray-500">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3 animate-bounce">
              <LockKeyhole className="text-blue-600 w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
              {authMode === "login" ? "Welcome Back" : "Create Your Account"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {authMode === "login"
                ? "Login to access your dashboard"
                : "Sign up to join the platform"}
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                disabled
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                disabled
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-100 cursor-not-allowed"
              />
            </div>

            {authMode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled
                  className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-100 cursor-not-allowed"
                />
              </div>
            )}

            <button
              type="button"
              disabled
              className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200 cursor-not-allowed"
            >
              {loading
                ? "Processing..."
                : authMode === "login"
                ? "Login (Coming Soon)"
                : "Sign Up (Coming Soon)"}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300" />
            <span className="mx-2 text-sm text-gray-400">or</span>
            <div className="flex-grow h-px bg-gray-300" />
          </div>

          <button
            disabled
            className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-gray-300 text-gray-600 font-medium rounded-lg shadow-sm bg-white hover:bg-gray-100 transition cursor-not-allowed"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          <p className="text-sm text-center text-gray-600 mt-6">
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() =>
                setAuthMode(authMode === "login" ? "signup" : "login")
              }
              className="text-blue-600 font-semibold hover:underline"
            >
              {authMode === "login" ? "Sign up" : "Login"}
            </button>
          </p>

          <p className="text-xs text-center text-gray-400 mt-2">
            🔒 Authentication system is under development. Please check back
            soon.
          </p>
        </div>
      </div>
      </div>
    </Layout>
  );
}
