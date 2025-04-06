"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function SignupPage() {
    const router = useRouter();
    const [user, setUser] = useState({
        email: "",
        password: "",
        username: "",
    });
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password:string) => {
        return password.length >= 6; // Example: Minimum 6 characters
    };

    const onSignup = async () => {
        setError(""); // Clear previous errors
        if (!validateEmail(user.email)) {
            setError("Invalid email format.");
            return;
        }
        if (!validatePassword(user.password)) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/users/signup", user);
            console.log("Signup success", response.data);
            toast.success("Signup successful!");
            router.push("/login");
        } catch (error) {
            console.error(error);
            const errorMessage = (error as any)?.response?.data?.message || "Signup failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const isFormValid = user.username && user.email && user.password &&
            validateEmail(user.email) && validatePassword(user.password);
        setButtonDisabled(!isFormValid || loading);
    }, [user, loading]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
                    {loading ? "Processing..." : "Sign Up"}
                </h1>
                <div className="space-y-6">
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div>
                        <label htmlFor="username" className="block text-gray-700 text-sm font-medium">Username</label>
                        <input
                            className="p-3 w-full mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="username"
                            type="text"
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-medium">Email</label>
                        <input
                            className="p-3 w-full mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="email"
                            type="text"
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-medium">Password</label>
                        <input
                            className="p-3 w-full mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="password"
                            type="password"
                            value={user.password}
                            onChange={(e) => setUser({ ...user, password: e.target.value })}
                            placeholder="Enter your password"
                        />
                    </div>
                    <div>
                        <button
                            onClick={onSignup}
                            className={`w-full p-3 text-white font-semibold rounded-lg focus:outline-none ${
                                buttonDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                            disabled={buttonDisabled}
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </div>
                </div>
                <div className="mt-6 text-center">
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm">
                        Already have an account? Login
                    </Link>
                </div>
            </div>
        </div>
    );
}