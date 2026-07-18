import { ChainConfig } from "@/config/chains.config";

export interface WalletState {
  connected: boolean;
  connecting: boolean;
  switchingNetwork: boolean;
  address: string | null;
  currentChainId: number | null;
  currentChain: ChainConfig | null;
  selectedChain: ChainConfig | null;
  supportedNetwork: boolean;
}

export const initialWalletState: WalletState = {
  connected: false,
  connecting: false,
  switchingNetwork: false,
  address: null,
  currentChainId: null,
  currentChain: null,
  selectedChain: null,
  supportedNetwork: false,
};