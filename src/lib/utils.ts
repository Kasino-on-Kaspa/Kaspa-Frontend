import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatKAS(sompi: bigint) {
  return (sompi / BigInt(100000000)).toString();
}

export function kasToSompi(kas: string): number {
  try {
    // Remove any non-numeric characters except decimal point
    const cleanKas = kas.replace(/[^\d.]/g, "");

    // Convert to number and multiply by 100000000 (1 KAS = 100,000,000 Sompi)
    const sompi = Math.floor(parseFloat(cleanKas) * 100000000);

    // Check if the result is a valid number
    if (isNaN(sompi)) {
      throw new Error("Invalid KAS amount");
    }

    return sompi;
  } catch (error) {
    throw new Error("Invalid KAS amount");
  }
}

export function validateKasAmount(amount: string, maxAmount: number): boolean {
  try {
    const sompi = kasToSompi(amount);
    return sompi > 0 && sompi <= maxAmount;
  } catch {
    return false;
  }
}

// Gas fee calculation
export function calculateGasFee(amount: number): number {
  // Base gas fee is 0.00001 KAS (1000 sompi)
  const BASE_GAS_FEE = 1000;
  // Additional gas fee per KAS (0.00001 KAS per KAS)
  const GAS_PER_KAS = 1000;

  // Calculate total gas fee
  const totalGasFee = BASE_GAS_FEE + (amount * GAS_PER_KAS) / 100000000;

  return Math.ceil(totalGasFee);
}

export function getMaxAmountWithGas(totalAmount: number): number {
  const gasFee = calculateGasFee(totalAmount);
  return totalAmount - gasFee;
}

export function formatMaxAmount(totalAmount: number): string {
  const maxAmount = getMaxAmountWithGas(totalAmount);
  return formatKAS(BigInt(maxAmount));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
