import { authenticatedFetch } from "./auth";
import { UserData, LoginResponse } from "@/types/wallet";

export async function login(
  address: string,
  publicKey: string,
): Promise<LoginResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address, publicKey }),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  return response.json();
}

export async function fetchUserData(): Promise<UserData> {
  const response = await authenticatedFetch("/api/users/me");
  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }
  return response.json();
}

export async function updateUsername(username: string): Promise<UserData> {
  const response = await authenticatedFetch("/api/users/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error("Failed to update username");
  }

  return response.json();
}

export async function deleteUser(): Promise<void> {
  const response = await authenticatedFetch("/api/users/me", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
}

export async function updateReferredBy(
  referralCode: string,
): Promise<UserData> {
  const response = await authenticatedFetch("/api/users/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ referredBy: referralCode }),
  });

  if (!response.ok) {
    throw new Error("Failed to update referral code");
  }

  return response.json();
}
