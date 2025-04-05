"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const [token, setToken] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const verifyUserEmail = async () => {
    try {
      setLoading(true);
      await axios.post("/api/verifyemail", { token });
      setVerified(true);
    } catch (error: any) {
      setError(true);
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlToken = window.location.search.split("=")[1];
    setToken(urlToken || "");
  }, []);

  useEffect(() => {
    if (token.length > 0) {
      verifyUserEmail();
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-lg max-w-md w-full text-white">
        <h1 className="text-3xl font-semibold mb-4 text-center">Verify Email</h1>

        {loading ? (
          <div className="flex justify-center items-center my-4">
            <Loader2 className="animate-spin h-6 w-6 text-white" />
          </div>
        ) : verified ? (
          <div className="text-center">
            <h2 className="text-xl mb-2">✅ Email Verified!</h2>
            <Link href="/login" className="underline text-blue-400 hover:text-blue-600">
              Go to Login
            </Link>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 font-medium">
            ❌ Something went wrong. Try again later.
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-300">Verifying token...</p>
          </div>
        )}

        {token && (
          <div className="mt-4 text-xs text-gray-400 break-all text-center">
            Token: {token}
          </div>
        )}
      </div>
    </div>
  );
}
