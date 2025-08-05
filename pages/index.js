// /pages/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { LockKeyhole } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";

export default function HomeLoginPage() {
  const router = useRouter();
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) router.replace("/homePage");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-white px-4">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/70 backdrop-blur-md border border-gray-200">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3 animate-bounce">
            <LockKeyhole className="text-blue-600 w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            {isRegistering ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isRegistering
              ? "Sign up to join the platform"
              : "Login to access your homePage"}
          </p>
        </div>

        {/* Actual working form */}
        <div className="space-y-5">
          {isRegistering ? (
            <SignUpForm onToggle={() => setIsRegistering(false)} />
          ) : (
            <LoginForm onToggle={() => setIsRegistering(true)} />
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-sm text-gray-400">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Google (disabled placeholder) */}
        <button
          disabled
          className="w-full py-2 px-4 flex items-center justify-center gap-2 border border-gray-300 text-gray-600 font-medium rounded-lg shadow-sm bg-white hover:bg-gray-100 transition cursor-not-allowed"
        >
          <FcGoogle className="w-5 h-5" />
          Continue with Google (soon)
        </button>

        {/* Toggle auth mode */}
        <p className="text-sm text-center text-gray-600 mt-6">
          {isRegistering
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegistering ? "Login" : "Sign up"}
          </button>
        </p>

        <p className="text-xs text-center text-gray-400 mt-2">
          🔒 Authentication is live. Google login coming soon.
        </p>
      </div>
    </div>
  );
}
