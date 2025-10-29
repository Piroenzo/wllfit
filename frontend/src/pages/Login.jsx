import { useState } from "react";
import api from "../api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.login(email, password);
      onLoginSuccess(res.token);
    } catch (err) {
      setError("Invalid credentials or server error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-semibold mb-6 text-green-400">WellFit</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-72">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-800 border border-gray-700"
          required
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-400 text-gray-900 py-2 rounded font-semibold"
        >
          Log In
        </button>
      </form>
    </div>
  );
}
