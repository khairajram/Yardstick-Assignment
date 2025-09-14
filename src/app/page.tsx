"use client"

import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    
    const hasToken = document.cookie.split(";").some((c) => c.trim().startsWith("token="));

    // console.log(hasToken);

    if (hasToken) {
      router.replace("/notes"); 
    }
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center h-full">
      <h1 className="text-5xl text-cyan-450 font-bold mb-4">Welcome to sticky</h1>
      <p className="mb-6 text-xl text-gray-600">Manage your notes with tenant isolation & roles</p>

      <div className="flex gap-4">
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-800 text-white rounded-lg hover:cursor-pointer"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/signup")}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg hover:cursor-pointer"
        >
          Signup
        </button>
      </div>
    </main>

  );
}
