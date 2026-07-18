import { createPublicClient, http, createWalletClient, custom, type Chain } from 'viem';
import { getChainById } from '@/config/chains.config';

export function getViemChain(chainId: number): Chain {
  const chain = getChainById(chainId);
  if (!chain) throw new Error("Unsupported chain");
  return {
    id: chain.chainId,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: { default: { http: [chain.rpcUrl] } },
    blockExplorers: { default: { name: 'Explorer', url: chain.explorerUrl } }
  };
}

export function getPublicClient(chainId: number) {
  return createPublicClient({
    chain: getViemChain(chainId),
    transport: http(),
  });
}