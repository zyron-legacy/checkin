'use client'

import { useState, useEffect } from 'react'
import {
  CalendarCheck, Flame, Trophy, CalendarDays, Coins, Gift, Check, Info, Sparkles, ChevronDown, Medal, Award, Star, Crown, Shield
} from 'lucide-react'
import { createWalletClient, custom } from 'viem'
import { connectWallet, disconnectWallet, autoConnectWallet, switchNetwork, getPublicClient, getViemChain } from '@/wallet'
import { getChainById, getSupportedChains } from '@/config/chains.config'
import { checkInAbi } from '@/config/abi.config'
import { calculateServiceFee } from '@/utils/calculateFee'

// --- Reward Calculation Helpers ---
const getDailyReward = (streak: number) => {
  if (streak <= 0) return 10;
  return 10 + (streak - 1) * 5;
};

const getWeeklyBonus = (streak: number) => {
  if (streak <= 0 || streak % 7 !== 0) return 0;
  const week = streak / 7;
  return 50 + (week * 25);
};

const getTotalReward = (streak: number) => {
  return getDailyReward(streak) + getWeeklyBonus(streak);
};

const getNextBonusDay = (streak: number) => {
  if (streak % 7 === 0) return streak + 7;
  return Math.ceil(streak / 7) * 7;
};


export default function Home() {
  // Wallet States
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showNetworks, setShowNetworks] = useState(false)

  // Contract States
  const [stats, setStats] = useState({ currentStreak: 0, highestStreak: 0, totalCheckIns: 0, totalZP: 0, lastCheckIn: 0 })
  const [isClaiming, setIsClaiming] = useState(false)
  const [txMessage, setTxMessage] = useState("")
  const [hasClaimedToday, setHasClaimedToday] = useState(false)

  // 1. Auto-Connect on Refresh
  useEffect(() => {
    const init = async () => {
      const autoConnect = await autoConnectWallet();
      if (autoConnect) {
        setAddress(autoConnect.address);
        setChainId(autoConnect.chainId);
        setIsConnected(true);
      }
    };
    init();
  }, []);

  // 2. Fetch User Data from Smart Contract
  const loadUserData = async (walletAddress: string, cId: number) => {
    try {
      const publicClient = getPublicClient(cId);
      const chain = getChainById(cId);
      if (!publicClient || !chain) return;

      const data: any = await publicClient.readContract({
        address: chain.contractAddress as `0x${string}`,
        abi: checkInAbi,
        functionName: 'getUserData',
        args: [walletAddress as `0x${string}`]
      });

      const currentStreak = Number(data[0]);
      const highestStreak = Number(data[1]);
      const totalCheckIns = Number(data[2]);
      const totalZP = Number(data[3]);
           const lastClaimDay = Number(data[4]);
      setStats({ currentStreak, highestStreak, totalCheckIns, totalZP, lastCheckIn: lastClaimDay });

      // आज का दिन निकालो (मिलीसेकंड को 86400000 से भाग देकर दिन में बदला)
      const currentDay = Math.floor(Date.now() / 86400000);
      
      // अगर कॉन्ट्रैक्ट पर सेव किया गया दिन आज के दिन के बराबर है, तो क्लेम हो चुका है
      if (lastClaimDay === currentDay) {
        setHasClaimedToday(true);
      } else {
        setHasClaimedToday(false);
      }
    } catch (error) {
      console.error("Failed to load user data (RPC Limit or Network Issue):");
    }
  };
  // Fetch data whenever wallet or chain changes
  useEffect(() => {
    if (isConnected && address && chainId) {
      loadUserData(address, chainId);
    }
  }, [isConnected, address, chainId]);

  // 3. MetaMask Event Listeners
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      // जब यूज़र अकाउंट बदले या डिस्कनेक्ट करे
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) handleDisconnect();
        else setAddress(accounts[0]);
      });
      
      // जब यूज़र नेटवर्क बदले, तो पेज खुद-ब-खुद रिफ्रेश हो जाएगा
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  // 4. Handlers
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await connectWallet();
      setAddress(res.address);
      setChainId(res.chainId);
      setIsConnected(true);
    } catch (error) { console.error(error); }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    await disconnectWallet();
    setIsConnected(false);
    setAddress(null);
    setChainId(null);
    setStats({ currentStreak: 0, highestStreak: 0, totalCheckIns: 0, totalZP: 0, lastCheckIn: 0 });
  };

  const handleSwitchNetwork = async (targetChainId: number) => {
    setShowNetworks(false);
    try { await switchNetwork(targetChainId); } catch (error) { console.error(error); }
  };

  // 5. Claim Reward Function
  const handleClaim = async () => {
    if (!isConnected || !address || !chainId) return;
    setIsClaiming(true);
    setTxMessage("Calculating Transaction Fee...");

    try {
      const publicClient = getPublicClient(chainId);
      const chain = getChainById(chainId);
      if (!publicClient || !chain) throw new Error("Network not supported");

      const fee = await calculateServiceFee(chainId);
      setTxMessage("Please approve the transaction in your wallet...");

      const walletClient = createWalletClient({
        chain: getViemChain(chainId),
        account: address as `0x${string}`,
        transport: custom(window.ethereum)
      });

      const hash = await walletClient.writeContract({
        address: chain.contractAddress as `0x${string}`,
        abi: checkInAbi,
        functionName: 'claimDaily',
        value: fee,
        account: address as `0x${string}`,
        chain: getViemChain(chainId)
      });

      setTxMessage("Transaction submitted! Waiting for confirmation...");
      await publicClient.waitForTransactionReceipt({ hash });

      setTxMessage("Successfully Claimed! 🎉");
      setHasClaimedToday(true);
      await loadUserData(address, chainId);

    } catch (error: any) {
      console.error("Claim Error:", error);
      setTxMessage(error.shortMessage || "Transaction failed or rejected.");
    }
    setIsClaiming(false);
  };

  const currentChain = chainId ? getChainById(chainId) : null;
  const supportedChains = getSupportedChains();

  return (
    <div className="min-h-screen w-full flex items-start sm:items-center justify-center px-3 py-4 sm:py-6" style={{ background: 'radial-gradient(circle at 30% 10%, #1a0d2e 0%, #0a0614 55%, #050208 100%)' }}>
      <div className="relative w-full max-w-[1100px] my-auto" style={{ background: 'linear-gradient(180deg, #1a0d2e 0%, #120920 60%, #0a0614 100%)', borderRadius: '20px', border: '1px solid rgba(168, 118, 255, 0.35)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,118,255,0.08), inset 0 0 40px rgba(138,43,226,0.06)' }}>
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]" style={{ opacity: 0.5 }}>
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#8a2be2] blur-[80px] opacity-30" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-[#a876ff] blur-[80px] opacity-20" />
        </div>

        <div className="relative p-5 sm:p-6">
          <header className="flex items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #8a2be2 0%, #6b1fb8 100%)', boxShadow: '0 6px 18px rgba(138,43,226,0.4), inset 0 1px 0 rgba(255,255,255,0.2)', border: '1px solid rgba(168,118,255,0.5)' }}>
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold tracking-wide text-lg sm:text-xl leading-tight" style={{ textShadow: '0 2px 12px rgba(138,43,226,0.4)' }}>DAILY CHECK-IN</h1>
              <p className="text-[#b8a2ff] text-xs font-medium">Check-in daily and earn ZP!</p>
            </div>
          </header>

          <section className="rounded-2xl p-3.5 mb-3 relative" style={{ background: 'linear-gradient(135deg, rgba(138,43,226,0.10) 0%, rgba(168,118,255,0.05) 100%)', border: '1px solid rgba(168,118,255,0.25)' }}>
            <div className="flex flex-wrap items-center gap-3">
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-full border border-[#4ade80]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" /> WALLET CONNECTED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> NOT CONNECTED
                </span>
              )}

              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">👛</span>
                <span className="text-[10px] tracking-wider text-[#b8a2ff] font-semibold shrink-0">WALLET</span>
                {isConnected && address ? (
                  <span className="text-white font-mono text-xs sm:text-sm truncate">
                    {address.substring(0, 6)}<span className="text-white/40">...</span>{address.substring(address.length - 4)}
                  </span>
                ) : (
                  <button onClick={handleConnect} disabled={isConnecting} className="text-[#a876ff] font-mono text-xs hover:text-white transition-colors">
                    {isConnecting ? "Connecting..." : "Click to Connect"}
                  </button>
                )}
              </div>

              {isConnected && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">⛓</span>
                  <span className="text-[10px] tracking-wider text-[#b8a2ff] font-semibold shrink-0">NETWORK</span>
                  <span className={`text-xs sm:text-sm font-medium ${currentChain ? 'text-white' : 'text-red-400'}`}>
                    {currentChain ? currentChain.name : "Unsupported Network"}
                  </span>
                </div>
              )}

              {isConnected ? (
                <div className="ml-auto flex gap-2 relative">
                  <button onClick={() => setShowNetworks(!showNetworks)} className="flex items-center justify-between gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#8a2be2]/20 hover:bg-[#8a2be2]/35 text-white border border-[#a876ff]/40 transition-colors whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-[#627eea] to-[#a876ff]" /> Select Network
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#a876ff]" />
                  </button>

                  {showNetworks && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a0d2e] border border-[#a876ff]/40 rounded-lg shadow-xl z-50 overflow-hidden">
                      {supportedChains.map((chain) => (
                        <button key={chain.chainId} onClick={() => handleSwitchNetwork(chain.chainId)} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-white hover:bg-[#8a2be2]/30 transition-colors">
                          <span className="w-2 h-2 rounded-full bg-[#a876ff]"></span> {chain.name}
                        </button>
                      ))}
                    </div>
                  )}

                  <button onClick={handleDisconnect} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/35 text-red-300 border border-red-400/40 transition-colors whitespace-nowrap">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button onClick={handleConnect} disabled={isConnecting} className="ml-auto flex items-center justify-between gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#8a2be2] hover:bg-[#a876ff] text-white border border-[#a876ff]/40 transition-colors whitespace-nowrap disabled:opacity-50">
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              )}
            </div>
          </section>

          {/* Dynamic Stats Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
            {[
              { icon: Flame, label: 'CURRENT STREAK', value: stats.currentStreak, sub: 'Days', note: 'Keep it up!', color: '#ff7a3d' },
              { icon: Trophy, label: 'HIGHEST STREAK', value: stats.highestStreak, sub: 'Days', note: 'Your record', color: '#ffd700' },
              { icon: CalendarDays, label: 'TOTAL CHECK-INS', value: stats.totalCheckIns, sub: '', note: 'All time', color: '#7c5cff' },
              { icon: Coins, label: 'TOTAL ZP EARNED', value: stats.totalZP, sub: '', note: 'All time', color: '#ffd700' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl p-3 flex flex-col" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(168,118,255,0.18)' }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                    <span className="text-[10px] tracking-wider text-[#b8a2ff] font-semibold">{s.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-xl font-bold leading-none">{s.value.toString()}</span>
                    {s.sub && <span className="text-[#b8a2ff] text-xs">{s.sub}</span>}
                  </div>
                  <span className="text-[10px] text-[#b8a2ff]/80 mt-1">{s.note}</span>
                </div>
              )
            })}
          </section>

          {/* Dynamic Rewards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
            {[
              { 
                header: "TODAY'S REWARD", 
                amount: getTotalReward(stats.currentStreak).toString(),
                unit: 'ZP', 
                desc: `Day ${stats.currentStreak} of your streak`, 
                icon: Coins, 
                accent: '#a876ff' 
              },
              { 
                header: 'NEXT REWARD', 
                amount: getTotalReward(stats.currentStreak + 1).toString(),
                unit: 'ZP', 
                desc: `Tomorrow (Day ${stats.currentStreak + 1})`, 
                icon: Coins, 
                accent: '#ffd700' 
              },
              { 
                header: 'NEXT BONUS', 
                amount: (50 + (getNextBonusDay(stats.currentStreak) / 7) * 25).toString(),
                unit: 'ZP', 
                desc: `Day ${getNextBonusDay(stats.currentStreak)} Weekly Bonus`, 
                icon: Gift, 
                accent: '#ff7a3d' 
              },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.header} className="rounded-xl p-3 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(138,43,226,0.08) 100%)', border: '1px solid rgba(168,118,255,0.25)' }}>
                  <div className="text-[10px] tracking-wider text-[#b8a2ff] font-semibold mb-1.5">{r.header}</div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" style={{ color: r.accent }} />
                    <span className="text-white text-xl font-bold leading-none">{r.amount}</span>
                    <span className="text-[#b8a2ff] text-xs font-semibold">{r.unit}</span>
                  </div>
                  <div className="text-[10px] text-[#b8a2ff]/80 mt-1">{r.desc}</div>
                </div>
              )
            })}
          </section>

          {/* Claim Status & Button */}
          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 mb-3">
            {!hasClaimedToday ? (
              <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg sm:w-auto" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
                <span className="text-[11px] text-[#b8a2ff] font-semibold whitespace-nowrap">Claim available:</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse shrink-0" />
                <span className="text-[11px] text-white font-semibold whitespace-nowrap">Today's Reward: {getTotalReward(stats.currentStreak)} ZP</span>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-center gap-0.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)' }}>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4ade80]" strokeWidth={3} />
                  <span className="text-[12px] text-[#4ade80] font-bold">Reward Claimed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3 h-3 text-[#b8a2ff]" />
                  <span className="text-[11px] text-[#b8a2ff]">Next claim available: <span className="text-white font-semibold">Tomorrow</span></span>
                </div>
              </div>
            )}

            <button
              onClick={handleClaim}
              disabled={hasClaimedToday || !isConnected || !currentChain || isClaiming}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold tracking-wide text-white text-sm sm:text-base transition-all"
              style={{
                background: (hasClaimedToday || !isConnected || !currentChain || isClaiming) ? 'linear-gradient(135deg, #2a1a4a 0%, #1a0d2e 100%)' : 'linear-gradient(135deg, #8a2be2 0%, #6b1fb8 100%)',
                border: '1px solid rgba(168,118,255,0.6)',
                boxShadow: (hasClaimedToday || !isConnected || !currentChain || isClaiming) ? 'none' : '0 6px 20px rgba(138,43,226,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
                opacity: (hasClaimedToday || !isConnected || !currentChain || isClaiming) ? 0.7 : 1,
                cursor: (hasClaimedToday || !isConnected || !currentChain || isClaiming) ? 'default' : 'pointer',
              }}
            >
              {isClaiming ? (
                <span>{txMessage || "Processing..."}</span>
              ) : !isConnected ? (
                'CONNECT WALLET TO CLAIM'
              ) : !currentChain ? (
                'SWITCH TO SUPPORTED NETWORK'
              ) : hasClaimedToday ? (
                <>
                  <Check className="w-5 h-5 text-[#4ade80]" />
                  REWARD CLAIMED
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" /> CLAIM TODAY'S REWARD
                </>
              )}
            </button>
          </div>

          {/* Milestone Badges */}
          <section className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold tracking-wider text-[11px] mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-[#a876ff]" />MILESTONE BONUSES</h2>
              <button className="text-[11px] font-semibold text-[#a876ff] hover:text-white px-2.5 py-1 rounded-md bg-[#8a2be2]/20 border border-[#a876ff]/30">VIEW ALL</button>
            </div>
            <div className="rounded-2xl p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(168,118,255,0.18)' }}>
              {[
                { name: '7 Days', bonus: '100 ZP', icon: Shield, color: '#cd7f32', unlocked: stats.highestStreak >= 7 },
                { name: '30 Days', bonus: '500 ZP', icon: Award, color: '#ffd700', unlocked: stats.highestStreak >= 30 },
                { name: '100 Days', bonus: '2500 ZP', icon: Star, color: '#a876ff', unlocked: stats.highestStreak >= 100 },
                { name: '365 Days', bonus: '10000 ZP', icon: Crown, color: '#ffd700', unlocked: stats.highestStreak >= 365 },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.name} className="flex flex-col items-center text-center p-2 rounded-lg" style={{ background: b.unlocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)', border: `1px solid ${b.unlocked ? `${b.color}55` : 'rgba(255,255,255,0.05)'}`, opacity: b.unlocked ? 1 : 0.4 }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ background: b.unlocked ? `radial-gradient(circle, ${b.color}33 0%, transparent 70%)` : 'rgba(255,255,255,0.03)', border: `1px solid ${b.unlocked ? `${b.color}88` : 'rgba(255,255,255,0.06)'}` }}>
                      <Icon className="w-4 h-4" style={{ color: b.unlocked ? b.color : '#666' }} />
                    </div>
                    <span className="text-[10px] text-white font-bold leading-tight">{b.name}</span>
                    <span className="text-[9px] text-[#b8a2ff] leading-tight font-medium">{b.bonus}</span>
                  </div>
                )
              })}
            </div>
          </section>

          <footer className="mt-3 pt-2.5 border-t border-white/5">
            <div className="flex items-start gap-2 text-[10px] text-[#b8a2ff]/70 leading-relaxed">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              <p>One claim per day. Rewards reset if you miss a day. All rewards are in <span className="text-[#a876ff] font-semibold">ZP (Zyron Points)</span>.</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  )
}