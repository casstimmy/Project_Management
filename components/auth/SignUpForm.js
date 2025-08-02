import { useState } from "react";
import { useRouter } from "next/router"; // Import useRouter

function AdminSignUpForm() {
  const router = useRouter(); // Initialize router

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

      setSuccess("Admin account created successfully.");

      // Redirect to login after short delay
      setTimeout(() => {
        router.push("/auth/login");
      }, 1000); // 1 second delay for user to see success message
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleRegister}
      className="space-y-4 max-w-md mx-auto mt-10"
    >
      <h1 className="text-2xl font-bold text-center">Create Admin</h1>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <input
        type="text"
        placeholder="Full Name"
        className="w-full border px-4 py-2 rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

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
        onClick={async () => {
          setIsCreatingAdmin(true);
          try {
            await handleCreateAdmin(); // your admin creation logic
          } finally {
            setIsCreatingAdmin(false);
          }
        }}
        disabled={isCreatingAdmin}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded transition duration-300 ${
          isCreatingAdmin
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {isCreatingAdmin ? (
          <>
            <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></span>
            Creating...
          </>
        ) : (
          "Create Admin"
        )}
      </button>
    </form>
  );
}

export default AdminSignUpForm;
