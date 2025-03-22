import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authenticatedFetch } from "./fetchWrapper";
import { NetworkType } from "@/types/kaspa";
import { toast } from "sonner";

interface UserData {
  username?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  totalEarnings?: number;
}

interface MessageResponse {
  message: string;
  nonce: string;
  expiry: number;
}

interface MessageInputs {
  domain: string;
  address: string;
  uri: string;
  chainId: string;
  tos: string;
  nonce: string;
  issuedAt: number;
  expiry: number;
}

function constructMessage(inputs: MessageInputs): string {
  return `${inputs.domain} wants you to sign in with your Kaspa account:
${inputs.address}

${inputs.tos}

URI: ${inputs.uri}
Version: 1
Chain ID: ${inputs.chainId}
Nonce: ${inputs.nonce}
Issued At: ${inputs.issuedAt}
Expiration Time: ${inputs.expiry}`;
}

function generateNonce(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function generateMessageInputs(
  address: string,
  chainId: NetworkType,
): MessageInputs {
  const domain = window.location.origin;
  const uri = window.location.host;
  const nonce = generateNonce();
  const now = Math.floor(Date.now() / 1000);
  const issuedAt = now;
  const expiry = now + 24 * 60 * 60; // 24 hours from now

  return {
    domain,
    address,
    uri,
    chainId,
    tos: `By signing in, you agree to the terms of service ${uri}/tos`,
    nonce,
    issuedAt,
    expiry,
  };
}

// Query keys
export const queryKeys = {
  userData: ["userData"],
  auth: ["auth"],
};

// Queries
export function useUserData() {
  return useQuery({
    queryKey: queryKeys.userData,
    queryFn: async () => {
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me`,
      );

      if (!response.ok) throw new Error("Failed to fetch user data");
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUpdateUsername() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        },
      );

      if (!response.ok) throw new Error("Failed to update username");
      return response.json() as Promise<UserData>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userData });
    },
  });
}

export function useDeleteUser() {
  return useMutation({
    mutationFn: async () => {
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_BACKEND_URL}/users/me`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete user");
      return response.json();
    },
  });
}

export function useUpdateReferredBy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (referralCode: string) => {
      try {
        const response = await authenticatedFetch(
          `${import.meta.env.VITE_BACKEND_URL}/users/me`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              referredBy: referralCode,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          toast.error(errorData.message || "Failed to update referral code");
          throw new Error(
            errorData.message || "Failed to update referral code",
          );
        }

        const data = await response.json();
        return data as UserData;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("An unexpected error occurred");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.userData });
    },
  });
}

// Helper function to get message for signing
export async function getMessageForSigning(
  address: string,
  network: NetworkType,
): Promise<MessageResponse> {
  try {
    const messageInputs = generateMessageInputs(address, network);
    const message = constructMessage(messageInputs);

    return {
      message,
      nonce: messageInputs.nonce,
      expiry: messageInputs.expiry,
    };
  } catch (error) {
    console.error("Error generating message:", error);
    throw new Error("Failed to generate message for signing");
  }
}

// Wallet Balance Queries
export function useWalletBalance() {
  return useQuery({
    queryKey: ["walletBalance"],
    queryFn: async () => {
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_BACKEND_URL}/wallet/balance`,
      );
      return response.json();
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useUpdateWalletBalance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ address }: { address: string }) => {
      const response = await authenticatedFetch(
        `${import.meta.env.VITE_BACKEND_URL}/wallet/balance/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        },
      );
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch wallet balance after successful update
      queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
    },
  });
}
