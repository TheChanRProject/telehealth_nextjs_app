"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import VideoPlayer from "@/components/VideoPlayer";

export default function GuestCallPage() {
    const params = useParams();
    const router = useRouter();
    const { sessionId } = params;

    const [guestName, setGuestName] = useState("");
    const [joined, setJoined] = useState(false);

    // In a real app, verify sessionId with backend before showing join screen

    function handleJoin() {
        if (guestName.trim()) {
            setJoined(true);
            // In a real app, you would pass guestName and sessionId to VideoPlayer 
            // to authenticate the signaling connection for this specific room.
            // For now, we reuse the generic VideoPlayer which expects manual ID entry.
            // Enhancing VideoPlayer to accept props for auto-connection is the next step.
        }
    }

    if (joined) {
        return (
            <div className="min-h-screen bg-black text-white p-8">
                <h1 className="text-2xl font-bold mb-4 text-[#1DB954]">Guest Session: {guestName}</h1>
                <p className="text-gray-400 mb-8">Session ID: {sessionId}</p>
                <div className="h-[600px] bg-[#121212] rounded-lg border border-gray-800 p-4">
                    <VideoPlayer />
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <Card className="w-[400px] border-none bg-[#121212]">
                <CardHeader>
                    <CardTitle className="text-xl text-[#1DB954]">Join Telehealth Session</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">You have been invited to a video session.</p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Your Name</label>
                        <Input
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </div>
                    <Button onClick={handleJoin} className="w-full bg-[#1DB954] text-black font-bold">
                        Join Call
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
