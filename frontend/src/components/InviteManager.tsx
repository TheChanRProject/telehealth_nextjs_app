"use client";

import { useState } from "react";
import { fetchClient } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Copy } from "lucide-react";

export default function InviteManager() {
    const [link, setLink] = useState("");
    const [loading, setLoading] = useState(false);

    async function generateLink() {
        setLoading(true);
        try {
            const data = await fetchClient("/calls/invite", { method: "POST" });
            const url = `${window.location.origin}/call/${data.session_id}`;
            setLink(url);
        } catch (e) {
            console.error("Failed to generate invite", e);
        } finally {
            setLoading(false);
        }
    }

    function copyLink() {
        navigator.clipboard.writeText(link);
    }

    return (
        <Card className="bg-[#121212] border-none text-white">
            <CardHeader>
                <CardTitle className="text-xl">Invite Others</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {!link ? (
                    <Button onClick={generateLink} disabled={loading} className="w-full bg-[#1DB954] text-black">
                        {loading ? "Generating..." : "Create Invite Link"}
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Input value={link} readOnly className="bg-white/10 border-none text-white" />
                        <Button size="icon" variant="outline" onClick={copyLink}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                {link && (
                    <p className="text-xs text-gray-400">Share this link to invite a guest.</p>
                )}
            </CardContent>
        </Card>
    );
}
