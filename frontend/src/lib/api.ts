const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchClient(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("access_token");

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    } as HeadersInit;

    if (token) {
        (headers as any)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(error.detail || `Error ${response.status}`);
    }

    return response.json();
}
