// src/wallet/autoConnect.ts
import { createWalletClient, custom } from "viem";
import { getChainById } from "@/config/chains.config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function autoConnectWallet() {
  if (typeof window.ethereum === "undefined") return null;

  try {
    // MetaMask में अगर पहले से कोई अकाउंट कनेक्टेड है, तो उसका एड्रेस निकालो
    const accounts = await window.ethereum.request({ method: "eth_accounts" });
    
    if (accounts.length > 0) {
      const client = createWalletClient({
        transport: custom(window.ethereum),
      });

      const address = accounts[0];
      const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
      const chainId = parseInt(chainIdHex, 16);
      const chain = getChainById(chainId);

      return {
        client,
        address,
        chainId,
        chain,
        supported: !!chain,
      };
    }
    return null;
  } catch (error) {
    console.error("Auto-connect failed:", error);
    return null;
  }
}