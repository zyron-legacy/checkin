import { createWalletClient, custom } from "viem";
import { getChainById } from "@/config/chains.config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No wallet found. Please install MetaMask or another EVM wallet.");
  }

  const client = createWalletClient({
    transport: custom(window.ethereum),
  });

  const [address] = await client.requestAddresses();

  const chainIdHex = await window.ethereum.request({
    method: "eth_chainId",
  });

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