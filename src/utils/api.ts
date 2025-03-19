import axios from "axios";
import {
  KaspaData,
  HistoricalDataPoint,
  HistoricalDataResponse,
  CoinMarketCapResponse,
} from "../types/coinmarketcap";

// Types for CoinMarketCap API responses

const CMC_API_KEY = import.meta.env.VITE_CMC_API_KEY;
const BASE_URL = "https://pro-api.coinmarketcap.com/v2";

// Create an axios instance with default headers
const cmcApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "X-CMC_PRO_API_KEY": CMC_API_KEY,
    Accept: "application/json",
  },
});

// Fallback data for development
const fallbackKaspaData: KaspaData = {
  id: 5730,
  name: "Kaspa",
  symbol: "KAS",
  slug: "kaspa",
  cmc_rank: 42,
  num_market_pairs: 25,
  circulating_supply: 21735435234.235,
  total_supply: 21735435234.235,
  max_supply: null,
  last_updated: new Date().toISOString(),
  date_added: "2022-08-12T00:00:00.000Z",
  tags: ["pow", "blockchain", "scaling"],
  quote: {
    USD: {
      price: 0.1185,
      volume_24h: 15234523.45,
      volume_change_24h: 5.23,
      percent_change_1h: 0.25,
      percent_change_24h: 2.5,
      percent_change_7d: 15.3,
      market_cap: 2575648673.12,
      market_cap_dominance: 0.15,
      fully_diluted_market_cap: 2575648673.12,
      last_updated: new Date().toISOString(),
    },
  },
};

// Generate mock historical data
const generateMockHistoricalData = (days: number): HistoricalDataPoint[] => {
  const data: HistoricalDataPoint[] = [];
  const now = Date.now();
  const basePrice = 0.1185;
  const volatility = 0.05; // 5% volatility

  for (let i = 0; i < days * 24; i++) {
    const timestamp = new Date(
      now - (days * 24 - i) * 60 * 60 * 1000
    ).toISOString();
    const randomChange = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + randomChange);

    data.push({
      timestamp,
      price,
      volume_24h: 15000000 + Math.random() * 1000000,
      market_cap: price * fallbackKaspaData.circulating_supply,
    });
  }

  return data;
};

// Function to get latest Kaspa data
export const getKaspaData = async (): Promise<KaspaData> => {
  try {
    const response = await cmcApi.get<CoinMarketCapResponse>(
      "/cryptocurrency/quotes/latest",
      {
        params: {
          symbol: "KAS",
          convert: "USD",
        },
      }
    );

    if (response.data.status.error_code !== 0) {
      throw new Error(
        response.data.status.error_message || "Failed to fetch Kaspa data"
      );
    }

    return response.data.data.KAS;
  } catch (error) {
    console.error("Error fetching Kaspa data:", error);
    return fallbackKaspaData; // Fallback if the API call fails
  }
};

// Function to get historical Kaspa data
export const getKaspaHistoricalData = async (
  interval: "1d" | "7d" | "30d" | "3m" | "1y" = "7d"
): Promise<HistoricalDataPoint[]> => {
  try {
    const response = await cmcApi.get<HistoricalDataResponse>(
      "/cryptocurrency/quotes/historical",
      {
        params: {
          symbol: "KAS",
          convert: "USD",
          interval,
          count: 500,
        },
      }
    );

    if (response.data.status.error_code !== 0) {
      throw new Error(
        response.data.status.error_message || "Failed to fetch historical data"
      );
    }

    return response.data.data.quotes;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    const days =
      interval === "1d"
        ? 1
        : interval === "7d"
          ? 7
          : interval === "30d"
            ? 30
            : interval === "3m"
              ? 90
              : 365;
    return generateMockHistoricalData(days); // Fallback if the API call fails
  }
};

// React Query keys
export const queryKeys = {
  kaspaData: ["kaspa-data"],
  kaspaHistorical: (interval: string) => ["kaspa-historical", interval],
} as const;
