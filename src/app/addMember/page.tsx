"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddMember() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true)
      const res = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/notes"); 
        setLoading(false)
        
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch {
      setError("Something went wrong");
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-full w-full">
      <div className="border p-8 rounded-2xl w-fit shadow-gray-400  shadow-[0_0_10px_2px_rgba(156,163,175,0.5)] transition-transform duration-300">
        <h1 className="text-3xl font-bold mb-6 text-center w-full text-gray-700">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-6 w-80">
          <input
            type="email"
            placeholder="Email"
            className="border rounded p-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border rounded p-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button disabled={loading}  type="submit" className="bg-blue-600 hover:bg-blue-700 hover:cursor-pointer text-white p-2 rounded disabled:opacity-50 disabled:cursor-auto">
            {loading ? "logging..." : "Login"} 
          </button>
        </form>

      </div>
      
    </main>
  );
}