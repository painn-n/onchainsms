import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { base } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { defineChain } from "viem";
import "./styles/index.css";
import App from "./App.jsx";

export const robinhood = defineChain({
  id: 4663,
  name: "Robinhood Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.mainnet.chain.robinhood.com"] },
  },
  blockExplorers: {
    default: {
      name: "Robinhood Chain Explorer",
      url: "https://robinhoodchain.blockscout.com",
    },
  },
});

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || "";
const queryClient = new QueryClient();
const metadata = {
    name: "Onchain SMS",
    description: "Wallet-to-wallet notes on Robinhood Chain and Base",
    url: typeof window !== "undefined" ? window.location.origin : "https://wcsigner.vercel.app",
    icons: ["https://avatars.githubusercontent.com/u/179229932"],
};
const connectors = [injected()];
if (projectId) connectors.push(walletConnect({ projectId, metadata, showQrModal: true }));

const wagmiConfig = createConfig({
  chains: [robinhood, base],
  connectors,
  transports: {
    [robinhood.id]: http(robinhood.rpcUrls.default.http[0]),
    [base.id]: http(),
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
