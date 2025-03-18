import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/utils.ts";
import Navbar from "./components/Sidebar.tsx";
import Marquee from "./components/Marquee.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Marquee />
      <Navbar />
      <App />
    </QueryClientProvider>
  </StrictMode>
);
