import { useMutation, useQuery } from "@tanstack/react-query";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface User {
  address: string;
  publicKey: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Query keys
export const authKeys = {
  tokens: ["auth", "tokens"],
} as const;

// API functions
const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data: AuthResponse = await response.json();
  return {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
};

export const getStoredTokens = (): AuthTokens | null => {
  const storedTokens = localStorage.getItem("authTokens");
  if (storedTokens) {
    return JSON.parse(storedTokens);
  }
  return null;
};

export const setAuthTokens = (tokens: AuthTokens): void => {
  localStorage.setItem("authTokens", JSON.stringify(tokens));
};

export const clearTokens = (): void => {
  localStorage.removeItem("authTokens");
};

// React Query hooks
export function useAuthTokens() {
  return useQuery({
    queryKey: authKeys.tokens,
    queryFn: getStoredTokens,
    staleTime: Infinity,
  });
}

export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshTokens,
    onSuccess: (newTokens) => {
      setAuthTokens(newTokens);
    },
  });
}

// Utility function for authenticated fetches
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  try {
    const storedTokens = getStoredTokens();
    if (!storedTokens) {
      throw new Error("No authentication tokens available");
    }

    const headers = new Headers(init?.headers || {});
    headers.set("Authorization", `Bearer ${storedTokens.accessToken}`);

    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (response.status === 401) {
      const newTokens = await refreshTokens(storedTokens.refreshToken);
      setAuthTokens(newTokens);

      headers.set("Authorization", `Bearer ${newTokens.accessToken}`);
      return fetch(input, {
        ...init,
        headers,
      });
    }

    return response;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
