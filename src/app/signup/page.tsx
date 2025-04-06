"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function LoginPage({ params }: any) {
    const router = useRouter();
    const [user, setUser] = React.useState({
        email: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const [username, setUsername] = useState("");
    useEffect(() => {
        const getUsername = async () => {
            const param = await params;
            const paramUsername = param.username;
            setUsername(paramUsername);
        };
        getUsername();
    }, [params]);

    const onLogin = async () => {
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);
            console.log("Login success", response.data);
            toast.success("Login success");
            router.push(`/home/${username}`);
        } catch (error: any) {
            console.log("Login failed", error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.email.length > 0 && user.password.length > 0) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 bg-gray-50">
            <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
                <h1 className="text-2xl font-semibold text-center mb-6">{loading ? "Processing..." : "Login"}</h1>
                <hr className="mb-4" />

                <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="email"
                        type="text"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                        placeholder="Enter your email"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        id="password"
                        type="password"
                        value={user.password}
                        onChange={(e) => setUser({ ...user, password: e.target.value })}
                        placeholder="Enter your password"
                    />
                </div>

                <button
                    onClick={onLogin}
                    disabled={buttonDisabled || loading}
                    className={`w-full p-3 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        buttonDisabled || loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-500 hover:text-blue-600">Sign up</Link>
                    </span>
                </div>
            </div>
        </div>
    );
}