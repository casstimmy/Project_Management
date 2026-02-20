import { useState } from "react";
import { useRouter } from "next/router";

function AdminSignUpForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsCreatingAdmin(true);

    try {
      const res = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      setSuccess("Admin account created successfully. Redirecting...");
      setTimeout(() => router.push("/"), 1200);
    } catch {
      setError("Something went wrong");
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg border border-red-100">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 text-sm px-4 py-2.5 rounded-lg border border-emerald-100">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
        <input
          type="email"
          placeholder="admin@company.com"
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
          placeholder="Create a strong password"
          className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder:text-gray-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isCreatingAdmin}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          isCreatingAdmin
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25"
        } text-white`}
      >
        {isCreatingAdmin ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating Admin...
          </>
        ) : (
          "Create Admin Account"
        )}
      </button>
    </form>
  );
}

export default AdminSignUpForm;
