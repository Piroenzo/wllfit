import { useState } from "react";
import api from "../api";

export default function AuthForm({ onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password);

      api.setToken(res.token);
      onLoginSuccess();
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 rounded-2xl p-8 shadow-lg w-[90%] max-w-md"
      >
        <h2 className="text-3xl font-semibold mb-6 text-center text-green-400">
          {mode === "login" ? "Welcome back 👋" : "Create your account 🧘‍♂️"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-4 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-6 p-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-green-400"
        />

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 text-gray-900 font-semibold py-2 rounded-lg transition"
        >
          {loading ? "Loading..." : mode === "login" ? "Login" : "Register"}
        </button>

        <p className="text-center text-gray-400 mt-6">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <span
                className="text-green-400 cursor-pointer"
                onClick={() => setMode("register")}
              >
                Sign up
              </span>
            </>
          ) : (
            <>
              Already registered?{" "}
              <span
                className="text-green-400 cursor-pointer"
                onClick={() => setMode("login")}
              >
                Log in
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
