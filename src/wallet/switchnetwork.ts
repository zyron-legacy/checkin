import { getChainById } from "@/config/chains.config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function switchNetwork(chainId: number) {
  if (!window.ethereum) {
    throw new Error("Wallet not found.");
  }

  const chain = getChainById(chainId);

  if (!chain) {
    throw new Error("Unsupported chain.");
  }

  const chainIdHex = `0x${chain.chainId.toString(16)}`;

  try {
    console.log(`Requesting MetaMask to switch to: ${chain.name} (${chainIdHex})`);
    
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });

    return true;
  } catch (error: any) {
    console.error("Switch Network Error:", error);
    
    // Chain not added in wallet (Error code 4902)
    if (error.code === 4902) {
      try {
        console.log(`Chain not found, requesting to add: ${chain.name}`);
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: chain.name,
              rpcUrls: [chain.rpcUrl],
              blockExplorerUrls: [chain.explorerUrl],
              nativeCurrency: chain.nativeCurrency,
            },
          ],
        });
        return true;
      } catch (addError: any) {
        console.error("Add Network Error:", addError);
        alert("Failed to add network. Please add it manually in MetaMask.");
        throw addError;
      }
    } else if (error.code === 4001) {
      alert("Network switch rejected by user.");
      throw error;
    } else {
      alert("Error switching network: " + error.message);
      throw error;
    }
  }
}