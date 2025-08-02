import { useState } from "react";
import { useRouter } from "next/router";

function LoginForm({ onToggle }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h1 className="text-2xl font-bold text-center">Login</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <input
        type="email"
        placeholder="Email"
        className="w-full border px-4 py-2 rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border px-4 py-2 rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

     <button
  onClick={async (e) => {
    setIsLoggingIn(true);
    try {
      await handleLogin(e);
    } finally {
      setIsLoggingIn(false);
    }
  }}
  disabled={isLoggingIn}
  className={`w-full flex items-center justify-center gap-2 py-2 rounded transition duration-300 ${
    isLoggingIn
      ? "bg-blue-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  } text-white`}
>
  {isLoggingIn ? (
    <>
      <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></span>
      Logging in...
    </>
  ) : (
    "Login"
  )}
</button>

    </form>
  );
}

export default LoginForm;
