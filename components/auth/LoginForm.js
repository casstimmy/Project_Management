import { useState } from "react";
import { useRouter } from "next/router";
import { Building2, FolderKanban, ArrowLeft } from "lucide-react";
import { jwtDecode } from "jwt-decode";

function LoginForm({ onToggle }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [pendingToken, setPendingToken] = useState(null);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        setIsLoggingIn(false);
        return;
      }

      const decoded = jwtDecode(data.token);

      // Admin goes straight through — sees everything
      if (decoded.role === "admin") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("appMode", "admin");
        router.push("/homePage");
      } else {
        // Non-admin must choose their workspace
        setPendingToken(data.token);
        setShowModeSelect(true);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setIsLoggingIn(false);
    }
  }

  function selectMode(mode) {
    localStorage.setItem("token", pendingToken);
    localStorage.setItem("appMode", mode);
    router.push("/homePage");
  }

  if (showModeSelect) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => { setShowModeSelect(false); setPendingToken(null); }}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={14} /> Back to login
        </button>

        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-900">Choose your workspace</h2>
          <p className="text-sm text-gray-500 mt-1">Select the module you want to work in</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button
            onClick={() => selectMode("fm")}
            className="group flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition">
              <Building2 size={22} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Facility Management</p>
              <p className="text-xs text-gray-500 mt-0.5">Assets, maintenance, work orders, safety & compliance</p>
            </div>
          </button>

          <button
            onClick={() => selectMode("pm")}
            className="group flex items-center gap-4 p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/50 transition-all duration-200"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition">
              <FolderKanban size={22} className="text-indigo-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Project Management</p>
              <p className="text-xs text-gray-500 mt-0.5">Projects, tasks, Gantt charts, budgets & reports</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
        <input
          type="email"
          placeholder="you@company.com"
          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isLoggingIn}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isLoggingIn
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25"
        } text-white`}
      >
        {isLoggingIn ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}

export default LoginForm;
