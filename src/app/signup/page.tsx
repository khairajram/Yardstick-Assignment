"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);
      const res = await fetch("/api/tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.message || "Signup failed");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center h-screen ">
      <div className="border p-8 rounded-2xl w-fit shadow-[0_0_10px_2px_rgba(156,163,175,0.5)]  transition-transform duration-300">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Signup
        </h1>

        <form onSubmit={handleSignup} className="flex flex-col gap-4 w-80">
          <input
            type="text"
            placeholder="Tenant Name (e.g. acme pvt. ltd.)"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Tenant Slug (e.g. acme)"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Admin Email"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white p-2 rounded
                       hover:bg-green-700 transition-colors duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span>Already have an account?</span>{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold transition-colors duration-300 hover:text-blue-800 hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
