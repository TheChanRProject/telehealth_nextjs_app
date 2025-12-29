"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ChatBox from "@/components/ChatBox";
import VideoPlayer from "@/components/VideoPlayer";
import CallHistory from "@/components/CallHistory";
import InviteManager from "@/components/InviteManager";
import AvatarVideo from "@/components/AvatarVideo";

export default function DashboardPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) {
        return <div className="flex h-screen items-center justify-center bg-black text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#1DB954]">Telehealth Portal</h1>
                <div className="flex items-center gap-4">
                    <span>Hello, User {user.id}</span>
                    <Button variant="outline" onClick={logout}>Sign Out</Button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Sidebar: History & Invites */}
                <div className="md:col-span-1 space-y-8">
                    <InviteManager />
                    <CallHistory />
                </div>

                {/* Main Content: Chat & Video */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-[#121212] border-none text-white h-[600px] flex flex-col">
                        <CardHeader>
                            <CardTitle>Chat Room</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col min-h-0">
                            <ChatBox />
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <Card className="bg-[#121212] border-none text-white h-[400px]">
                            <CardHeader>
                                <CardTitle>Video Session</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <VideoPlayer />
                            </CardContent>
                        </Card>

                        <Card className="bg-[#121212] border-none text-white h-[280px]">
                            <CardHeader>
                                <CardTitle>AI Avatar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AvatarVideo />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
