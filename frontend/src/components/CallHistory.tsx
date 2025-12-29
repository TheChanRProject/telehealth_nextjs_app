"use client";

import { useEffect, useState } from "react";
import { fetchClient } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface CallSession {
    id: number;
    session_id: string;
    start_time: string;
    end_time?: string;
}

export default function CallHistory() {
    const [history, setHistory] = useState<CallSession[]>([]);

    useEffect(() => {
        loadHistory();
    }, []);

    async function loadHistory() {
        try {
            const data = await fetchClient("/calls/history");
            setHistory(data);
        } catch (e) {
            console.error("Failed to load history", e);
        }
    }

    return (
        <Card className="bg-[#121212] border-none text-white h-full">
            <CardHeader>
                <CardTitle className="text-xl">History</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {history.length === 0 && <p className="text-gray-500">No calls yet.</p>}
                    {history.map((call) => (
                        <div key={call.id} className="p-3 bg-white/5 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-medium text-[#1DB954]">Call #{call.id}</p>
                                <p className="text-xs text-gray-400">
                                    {new Date(call.start_time).toLocaleString()}
                                </p>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                                {call.end_time ? "Finished" : "Active/Unknown"}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
