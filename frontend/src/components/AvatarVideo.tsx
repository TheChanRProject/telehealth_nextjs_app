"use client";

import { useEffect, useRef, useState } from "react";
import StreamingAvatar, { AvatarQuality, TaskType } from "@heygen/streaming-avatar";
import { Button } from "./ui/button";
import { fetchClient } from "@/lib/api";

interface AvatarVideoProps {
    className?: string;
}

export default function AvatarVideo({ className }: AvatarVideoProps) {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [debug, setDebug] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTalking, setIsTalking] = useState(false);
    const [avatar, setAvatar] = useState<StreamingAvatar | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && stream) {
            console.log("Stream attached to video element", stream);
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
                console.log("Video metadata loaded, attempting to play");
                setDebug("Video metadata loaded");
                videoRef.current?.play().catch(e => {
                    console.error("Video play failed", e);
                    setDebug("Video play failed: " + e.message);
                });
            };
            videoRef.current.onplay = () => {
                console.log("Video started playing");
                setDebug("Video playing");
            };
        } else {
            console.log("Effect triggered but refs missing:", { video: !!videoRef.current, stream: !!stream });
        }
    }, [stream]);

    async function startAvatar() {
        setIsLoading(true);
        setDebug(""); // Clear previous errors
        try {
            // 1. Get Token from Backend
            setDebug("Fetching token...");
            const { token } = await fetchClient("/video/heygen-token", { method: "POST" });
            console.log("Token obtained:", token?.slice(0, 10) + "...");

            // 2. Get Avatars List (ensure we have a valid ID)
            setDebug("Fetching avatars...");
            let avatarId = "Angela-ewg";
            let voiceId = "";
            try {
                const avatars = await fetchClient("/video/heygen-avatars");
                console.log("Avatars fetched:", avatars?.length);
                if (Array.isArray(avatars) && avatars.length > 0) {
                    avatarId = avatars[0].avatar_id || avatars[0].id || avatarId;
                    voiceId = avatars[0].default_voice;
                    console.log("Selected Avatar ID:", avatarId, "Voice:", voiceId);
                }
            } catch (e) {
                console.warn("Failed to fetch avatar list, using default.", e);
                setDebug("Avatar list fetch failed, trying default...");
            }

            // 3. Init SDK
            setDebug("Initializing SDK...");
            const newAvatar = new StreamingAvatar({
                token: token,
            });

            // 4. Create Start Request
            setDebug(`Starting Session (${avatarId})...`);
            try {
                const startRequest: any = {
                    quality: AvatarQuality.Low,
                    avatarName: avatarId,
                };
                if (voiceId) {
                    startRequest.voice = { voiceId: voiceId }; // Note: SDK usually expects voiceId
                }

                const sessionData = await newAvatar.createStartAvatar(startRequest);
                console.log("Avatar Session:", sessionData);
                setDebug("Session started!");
            } catch (sdkError: any) {
                console.error("SDK createStartAvatar failed:", sdkError);
                // Try to extract more details if available
                let msg = sdkError.message || sdkError;
                try {
                    msg += " " + JSON.stringify(sdkError);
                } catch (e) { }

                throw new Error(`SDK Start Failed: ${msg}`);
            }

            newAvatar.on("STREAM_READY", (event) => {
                setStream(event.detail);
                setDebug("Stream ready");
            });

            newAvatar.on("USER_START", (event) => {
                setIsTalking(true);
            });

            newAvatar.on("USER_STOP", (event) => {
                setIsTalking(false);
            });

            setAvatar(newAvatar);
        } catch (err: any) {
            console.error("Avatar error:", err);
            let message = err.message || String(err);
            if (message.toLowerCase().includes("concurrent") || message.toLowerCase().includes("limit")) {
                message = "Concurrent session limit reached. Please close other sessions or wait.";
            }
            setDebug("Error: " + message);
        } finally {
            setIsLoading(false);
        }
    }

    async function stopAvatar() {
        if (avatar) {
            await avatar.stopAvatar();
            setAvatar(null);
            setStream(null);
        }
    }

    async function speak(text: string) {
        if (avatar) {
            await avatar.speak({ text: text, task_type: TaskType.REPEAT });
        }
    }

    // Cleanup
    useEffect(() => {
        return () => {
            if (avatar) {
                avatar.stopAvatar();
            }
        };
    }, []);


    return (
        <div className={`flex flex-col items-center justify-center bg-black/50 rounded-lg p-4 ${className}`}>
            <div className="relative w-full aspect-video bg-gray-900 rounded-md overflow-hidden mb-4">
                {stream ? (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-500">
                        Avatar Idle
                    </div>
                )}
            </div>

            <div className="flex gap-2 mb-2">
                {!stream && (
                    <Button onClick={startAvatar} disabled={isLoading} className="bg-[#1DB954] text-black hover:bg-[#1ed760]">
                        {isLoading ? "Connecting..." : "Start Avatar Friend"}
                    </Button>
                )}
                {stream && (
                    <Button onClick={stopAvatar} className="bg-red-500 hover:bg-red-600 text-white">
                        Stop
                    </Button>
                )}
            </div>

            {/* Simple Speak Test */}
            {stream && (
                <div className="flex gap-2 w-full">
                    <Button onClick={() => speak("Hello, I am your digital assistant.")} variant="outline" className="text-black bg-white">
                        Say "Hello"
                    </Button>
                    <Button onClick={() => speak("I am listening.")} variant="outline" className="text-black bg-white">
                        Say "Listening"
                    </Button>
                </div>
            )}

            {debug && <p className="text-red-500 text-xs mt-2">{debug}</p>}
        </div>
    );
}
