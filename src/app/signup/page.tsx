'use client';

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    username: "",
  });

  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const onSignup = async () => {
    try {
      setLoading(true);
      const response = await axios.post("/api/signup", user);
      console.log("Signup success", response.data);
      router.push("/login");
    } catch (error: any) {
      console.log("Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isValid = user.email && user.password && user.username;
    setButtonDisabled(!isValid);
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Card className="w-full max-w-md p-8 rounded-2xl border border-white/20 shadow-2xl drop-shadow-lg backdrop-blur-md bg-white/10 text-white">
        <CardContent className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-center mb-2">Signup</h1>

          <div className="flex flex-col gap-2">
            <label htmlFor="username">Username</label>
            <Input
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-300"
              id="username"
              type="text"
              placeholder="Enter your username"
              value={user.username}
              onChange={(e) => setUser({ ...user, username: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="email">Email</label>
            <Input
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-300"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password">Password</label>
            <Input
              className="bg-white/10 border-white/30 text-white placeholder:text-gray-300"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={user.password}
              onChange={(e) => setUser({ ...user, password: e.target.value })}
            />
          </div>

          <div className="flex justify-center mt-4">
            <Button
              onClick={onSignup}
              disabled={buttonDisabled || loading}
              className="w-fit bg-blue-400 hover:bg-blue-500 text-black font-semibold"
            >
              {loading && (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              )}
              {loading ? "Signing up..." : "Signup"}
            </Button>
          </div>

          <p className="text-center text-sm mt-4 text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="underline text-blue-300">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
