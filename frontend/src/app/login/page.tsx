"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchClient } from "@/lib/api";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/login/access-token`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Invalid credentials");
            const data = await res.json();
            login(data.access_token);
        } catch (err) {
            setError("Login failed. Check your credentials.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="w-[400px] border-none bg-[#121212]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">Log in</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold uppercase tracking-widest">
                            Log In
                        </Button>
                        <div className="text-center mt-4">
                            <p className="text-sm text-[#b3b3b3]">Don't have an account? <Link href="/signup" className="text-white hover:underline">Sign up for BetterHelp Clone</Link></p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
