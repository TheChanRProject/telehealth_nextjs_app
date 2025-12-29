"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatBox() {
    const { user } = useAuth();
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("access_token");
        // Connect to WS
        // URL: ws://localhost:8000/api/v1/chat/ws/{client_id}?token={token}
        // We use user.id as client_id for simplicity
        const wsUrl = `ws://localhost:8000/api/v1/chat/ws/${user.id}?token=${token}`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log("Connected to chat");
        };

        ws.current.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        ws.current.onclose = () => {
            console.log("Disconnected from chat");
        };

        return () => {
            ws.current?.close();
        };
    }, [user]);

    const sendMessage = () => {
        if (ws.current && input.trim()) {
            ws.current.send(input);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto mb-4 space-y-2 p-2 bg-[#181818] rounded">
                {messages.map((msg, i) => (
                    // Simple display, parsing could happen if JSON
                    <div key={i} className="p-2 bg-[#282828] rounded w-fit max-w-[80%]">
                        {msg}
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1"
                />
                <Button onClick={sendMessage}>Send</Button>
            </div>
        </div>
    );
}
