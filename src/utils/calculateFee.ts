import { parseUnits } from "viem";
import { getChainById } from "@/config/chains.config";
import { getPublicClient } from "@/wallet/clients";

const priceFeedAbi = [
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" }
    ],
    stateMutability: "view",
    type: "function"
  }
];

export async function calculateServiceFee(chainId: number): Promise<bigint> {
  const chain = getChainById(chainId);
  if (!chain) throw new Error("Chain not supported");

  const publicClient = getPublicClient(chainId);

  if (chain.isStablecoin) {
    // USDC के लिए (6 decimals) -> 0.05 * 10^6 = 50000
    return parseUnits("0.05", chain.nativeCurrency.decimals);
  } else {
    if (!chain.priceFeedAddress) throw new Error("Price feed missing");

    const roundData: any = await publicClient.readContract({
      address: chain.priceFeedAddress as `0x${string}`,
      abi: priceFeedAbi,
      functionName: "latestRoundData",
    });

    // .toString() लगाना सबसे सुरक्षित तरीका है
    const ethPriceUsd = BigInt(roundData[1].toString());

    // $0.05 को 8 decimals में निकालने के लिए parseUnits का इस्तेमाल (बिना 'n' वाला एरर)
    const feeInUsd = parseUnits("0.05", 8); 

    // 10 की पॉवर निकालने के लिए भी BigInt() का इस्तेमाल
    const decimalsBigInt = BigInt(chain.nativeCurrency.decimals);
    const multiplier = BigInt(10) ** decimalsBigInt;

    // फाइनल फीस कैलकुलेशन
    const feeInNative = (feeInUsd * multiplier) / ethPriceUsd;

    return feeInNative;
  }
}