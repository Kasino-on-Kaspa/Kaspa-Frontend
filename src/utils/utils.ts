import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

// Fallback data in case API fails
const fallbackPrice = {
  price: 0.07863,
  change24h: 2.5,
};

const fallbackChartData = [
  0.0775, 0.0778, 0.078, 0.0782, 0.0784, 0.0786, 0.0788, 0.0789, 0.07863,
  0.0787, 0.0788, 0.0789,
].map((value) => ({ value }));

export async function getKaspaPrice() {
  try {
    // Use proxy or direct API based on environment
    const apiUrl = "https://api.coingecko.com/api/v3";
    const response = await fetch(
      `${apiUrl}/simple/price?ids=kaspa&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn("Using fallback price data");
      return fallbackPrice;
    }

    const data = await response.json();
    return {
      price: data.kaspa.usd,
      change24h: data.kaspa.usd_24h_change,
    };
  } catch (error) {
    console.error("Error fetching Kaspa price:", error);
    return fallbackPrice;
  }
}

export async function getKaspaChart() {
  try {
    const apiUrl = "https://api.coingecko.com/api/v3";
    const response = await fetch(
      `${apiUrl}/coins/kaspa/market_chart?vs_currency=usd&days=1&interval=hourly`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn("Using fallback chart data");
      return fallbackChartData;
    }

    const data = await response.json();
    const formattedData = data.prices
      .map(([_, price]: [number, number]) => ({
        value: Number(price.toFixed(8)),
      }))
      .filter((item: any) => !isNaN(item.value));

    return formattedData.length > 0 ? formattedData : fallbackChartData;
  } catch (error) {
    console.error("Error fetching Kaspa chart:", error);
    return fallbackChartData;
  }
}
