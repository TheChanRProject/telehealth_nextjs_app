"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchClient } from "@/lib/api";

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetchClient("/auth/signup", {
                method: "POST",
                body: JSON.stringify({ email, password, full_name: fullName }),
            });
            router.push("/login");
        } catch (err: any) {
            setError(err.message || "Signup failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-black">
            <Card className="w-[400px] border-none bg-[#121212]">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold text-white">Sign up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input
                                id="fullname"
                                placeholder="What should we call you?"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
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
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold uppercase tracking-widest">
                            Sign Up
                        </Button>
                        <div className="text-center mt-4">
                            <p className="text-sm text-[#b3b3b3]">Have an account? <Link href="/login" className="text-white hover:underline">Log in</Link></p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
