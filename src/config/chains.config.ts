export type ChainEnvironment = "mainnet" | "testnet";

export interface ChainConfig {
  id: string;
  name: string;
  environment: ChainEnvironment;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  contractAddress: string;
  enabled: boolean;
  icon?: string;
  isStablecoin?: boolean; 
  priceFeedAddress?: string; 
}

export const CHAINS: ChainConfig[] = [
  {
    id: "arc-mainnet",
    name: "ARC Mainnet",
    environment: "mainnet",
    chainId: 5042,
    rpcUrl: "https://5042.rpc.thirdweb.com",
    explorerUrl: "https://explorer.arc.io",
    nativeCurrency: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 18,
    },
    contractAddress: "",
    enabled: true,
    isStablecoin: true,
  },
  {
    id: "arc-testnet",
    name: "ARC Testnet",
    environment: "testnet",
    chainId: 5042002,
    rpcUrl: "https://rpc.testnet.arc.io",
    explorerUrl: "https://testnet.arcscan.app",
    nativeCurrency: {
      name: "USD Coin",
      symbol: "USDC",
      decimals: 18,
    },
    contractAddress: "0x0fECd0a87Db6D143Ab4b2d8a31f79EA11A53643e",
    enabled: true,
    isStablecoin: true,
  }
];

export const getSupportedChains = () =>
  CHAINS.filter((chain) => chain.enabled);

// यहाँ गलती ठीक की गई है -> chain.enabled && 
export const getChainById = (chainId: number) =>
  CHAINS.find((chain) => chain.enabled && chain.chainId === chainId);

export const getDefaultChain = () =>
  CHAINS.find((chain) => chain.id === "arc-mainnet")!;

export const isSupportedChain = (chainId: number) =>
  CHAINS.some(
    (chain) => chain.enabled && chain.chainId === chainId
  );