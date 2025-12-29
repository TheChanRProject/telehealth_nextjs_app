"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { fetchClient } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    full_name?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check if token exists
        const token = localStorage.getItem("access_token");
        if (token) {
            // Validate token or just decode user (for simplicity fetch profile if endpoint existed)
            // Since we don't have /me endpoint yet, we will optimistically assume valid or just fetch.
            // Let's implement /me endpoint or just wait for login.
            // For now, if token exists, we set loading false. 
            // Ideally call /users/me
            setIsLoading(false);
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem("access_token", token);
        // Ideally decode token to get user info or fetch /users/me
        // For now, we rely on the fact we are logged in.
        setUser({ id: 0, email: "user@example.com" }); // Placeholder
        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
