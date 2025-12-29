"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function VideoPlayer() {
    const { user } = useAuth();
    const [targetId, setTargetId] = useState("");
    const [status, setStatus] = useState("Idle");

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const ws = useRef<WebSocket | null>(null);
    const peerConnection = useRef<RTCPeerConnection | null>(null);

    const iceServers = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" }, // Public STUN
            // { urls: "turn:..." } // Add TURN for production
        ],
    };

    useEffect(() => {
        if (!user) return;

        // Connect to Signaling WS
        const token = localStorage.getItem("access_token");
        const wsUrl = `ws://localhost:8000/api/v1/video/signal/${user.id}?token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => console.log("Signaling Connected");

        ws.current.onmessage = async (event) => {
            const data = JSON.parse(event.data);
            // data: { sender_id, type, payload }
            handleSignalingMessage(data);
        };

        return () => {
            ws.current?.close();
            peerConnection.current?.close();
        };
    }, [user]);

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            return stream;
        } catch (err) {
            console.error("Error accessing media devices", err);
            setStatus("Error: No Camera/Mic");
            return null;
        }
    };

    const createPeerConnection = (stream: MediaStream) => {
        const pc = new RTCPeerConnection(iceServers);

        // Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // Handle remote stream
        pc.ontrack = (event) => {
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && ws.current) {
                // Send candidate to peer (we need to know who the peer is... stored in state?)
                // For simplicity, we assume we are talking to 'targetId' that initiated or received call.
                // We might need to store 'currentPeerId'.
            }
        };

        return pc;
    };

    // Simplified: Does not handle reliable targetId tracking in this snippet for brevity, 
    // but assumes `targetId` input is used for initiating. 
    // For RECEIVING, we need to extract sender_id.

    const handleSignalingMessage = async (data: any) => {
        const { sender_id, type, payload } = data;

        // If receiving an offer, we must set targetId to sender_id essentially
        // But we are using `targetId` state for INPUT.

        if (type === "offer") {
            setStatus(`Receiving call from ${sender_id}`);
            const stream = await startLocalStream();
            if (!stream) return;

            const pc = createPeerConnection(stream);
            peerConnection.current = pc;

            // Handle ICE for this specific peer (need to modify createPeerConnection to accept target)
            pc.onicecandidate = (event) => {
                if (event.candidate && ws.current) {
                    ws.current.send(JSON.stringify({
                        target_id: sender_id,
                        type: "candidate",
                        payload: event.candidate
                    }));
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            if (ws.current) {
                ws.current.send(JSON.stringify({
                    target_id: sender_id,
                    type: "answer",
                    payload: answer
                }));
            }
            setStatus("Connected");
        } else if (type === "answer") {
            if (peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(payload));
                setStatus("Connected");
            }
        } else if (type === "candidate") {
            if (peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(payload));
            }
        }
    };

    const startCall = async () => {
        if (!targetId) return;
        setStatus("Calling...");
        const stream = await startLocalStream();
        if (!stream) return;

        const pc = createPeerConnection(stream);
        peerConnection.current = pc;

        // Correct ICE handler for initiator
        pc.onicecandidate = (event) => {
            if (event.candidate && ws.current) {
                ws.current.send(JSON.stringify({
                    target_id: targetId,
                    type: "candidate",
                    payload: event.candidate
                }));
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        if (ws.current) {
            ws.current.send(JSON.stringify({
                target_id: targetId,
                type: "offer",
                payload: offer
            }));
        }
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Target User ID"
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                />
                <Button onClick={startCall}>Call</Button>
            </div>
            <p className="text-sm text-gray-400">Status: {status}</p>

            <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="bg-black rounded border border-gray-800 relative">
                    <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/50 px-2 rounded">You</span>
                </div>
                <div className="bg-black rounded border border-gray-800 relative">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <span className="absolute bottom-2 left-2 bg-black/50 px-2 rounded">Remote</span>
                </div>
            </div>
        </div>
    );
}
