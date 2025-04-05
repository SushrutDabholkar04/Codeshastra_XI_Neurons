"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react"; // or replace with Spinner from Shadcn if needed

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({ email: "", password: "" });
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/login", user);
      console.log("Login success", response.data);
      router.push("/profile");
    } catch (error: any) {
      console.log("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setButtonDisabled(!(user.email && user.password));
  }, [user]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 shadow-2xl w-full max-w-md text-white border border-white/20">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        <label htmlFor="email" className="block mb-2">
          Email
        </label>
        <input
          className="w-full p-2 mb-4 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          id="email"
          type="text"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
          placeholder="Enter your email"
        />

        <label htmlFor="password" className="block mb-2">
          Password
        </label>
        <input
          className="w-full p-2 mb-6 rounded-lg bg-white/10 text-white placeholder-gray-300 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40"
          id="password"
          type="password"
          value={user.password}
          onChange={(e) => setUser({ ...user, password: e.target.value })}
          placeholder="Enter your password"
        />

        <div className="flex items-center justify-center mb-4">
            <Button
            onClick={onLogin}
            disabled={buttonDisabled || loading}
            className="bg-blue-400 hover:bg-blue-500 text-black font-semibold px-6 py-2 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {loading ? (
                <div className="flex items-center justify-center gap-2">
                <Loader className="animate-spin w-4 h-4" />
                Logging in...
                </div>
            ) : (
                "Login"
            )}
            </Button>
        </div>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <Link href="/signup" className="underline text-blue-300">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
