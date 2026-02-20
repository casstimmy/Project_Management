// /pages/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Building2, FolderKanban, Shield } from "lucide-react";
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
    <div className="min-h-screen flex bg-slate-50">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col justify-between p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
              O
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              OPAL<span className="text-blue-400 ml-1">shire</span>
            </span>
          </div>
          <p className="text-blue-200/60 text-sm mt-1">Enterprise Operations Platform</p>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Manage facilities.<br />
            <span className="text-blue-400">Deliver projects.</span><br />
            Stay in control.
          </h2>
          <div className="space-y-4">
            {[
              { icon: Building2, label: "Facility Management", desc: "Assets, maintenance, compliance & safety" },
              { icon: FolderKanban, label: "Project Management", desc: "Tasks, timelines, budgets & deliverables" },
              { icon: Shield, label: "Role-Based Access", desc: "Secure, permission-driven workflows" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{label}</p>
                  <p className="text-blue-200/50 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-blue-200/30 text-xs">
          &copy; {new Date().getFullYear()} OPALshire. All rights reserved.
        </p>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
              O
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              OPAL<span className="text-blue-600 ml-1">shire</span>
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {isRegistering ? "Create your account" : "Sign in to your account"}
            </h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {isRegistering
                ? "Get started with OPALshire"
                : "Welcome back — enter your credentials below"}
            </p>
          </div>

          <div className="space-y-5">
            {isRegistering ? (
              <SignUpForm onToggle={() => setIsRegistering(false)} />
            ) : (
              <LoginForm onToggle={() => setIsRegistering(true)} />
            )}
          </div>

          <p className="text-sm text-center text-gray-500 mt-8">
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              {isRegistering ? "Sign in" : "Create account"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
