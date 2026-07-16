'use client'

import { useState, useEffect } from 'react'
import {
  X,
  CalendarCheck,
  Wallet,
  Flame,
  Trophy,
  CalendarDays,
  Coins,
  Gift,
  Check,
  Info,
  Sparkles,
  Medal,
  Award,
  Star,
  Crown,
  Shield,
} from 'lucide-react'

/* ---------- Data (same as image) ---------- */

const STATS = [
  { icon: Flame, label: 'CURRENT STREAK', value: '14', sub: 'Days', note: 'Keep it up!', color: '#ff7a3d' },
  { icon: Trophy, label: 'HIGHEST STREAK', value: '14', sub: 'Days', note: 'Your record', color: '#ffd700' },
  { icon: CalendarDays, label: 'TOTAL CHECK-INS', value: '41', sub: '', note: 'All time', color: '#7c5cff' },
  { icon: Coins, label: 'TOTAL ZP EARNED', value: '2,850', sub: '', note: 'All time', color: '#ffd700' },
]

const REWARDS = [
  { header: "TODAY'S REWARD", amount: '8', unit: 'ZP', desc: 'Day 14 of your streak', icon: Coins, accent: '#a876ff' },
  { header: 'NEXT REWARD', amount: '9', unit: 'ZP', desc: 'Tomorrow (Day 15)', icon: Coins, accent: '#ffd700' },
  { header: 'NEXT BONUS', amount: '30', unit: 'ZP', desc: 'Day 14 Bonus · Keep going!', icon: Gift, accent: '#ff7a3d' },
]

const BADGES = [
  { name: '7 Day Survivor', icon: Shield, color: '#cd7f32', unlocked: true },
  { name: '14 Day Dedicated', icon: Medal, color: '#c0c0c0', unlocked: true },
  { name: '30 Day Loyal', icon: Award, color: '#ffd700', unlocked: false },
  { name: '60 Day Warrior', icon: Crown, color: '#b8a2ff', unlocked: false },
  { name: '100 Day Legend', icon: Star, color: '#a876ff', unlocked: false },
  { name: '365 Day OG', icon: Crown, color: '#ffd700', unlocked: false },
]

/* ---------- Countdown hook ---------- */

function useCountdown(initial: { h: number; m: number; s: number }) {
  const [t, setT] = useState(initial)
  useEffect(() => {
    const id = setInterval(() => {
      setT((prev) => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 23; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ---------- Page ---------- */

export default function Home() {
  const [open, setOpen] = useState(true)
  const [claimed, setClaimed] = useState(false)
  const t = useCountdown({ h: 23, m: 59, s: 12 })

  if (!open) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0614] text-white">
        <button
          onClick={() => setOpen(true)}
          className="px-6 py-3 rounded-xl bg-[#8a2be2] hover:bg-[#a876ff] transition-colors font-semibold border border-[#a876ff] shadow-[0_4px_12px_rgba(138,43,226,0.4)]"
        >
          Open Daily Check-in
        </button>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen w-full flex items-start sm:items-center justify-center px-3 py-4 sm:py-8"
      style={{
        background:
          'radial-gradient(circle at 30% 10%, #1a0d2e 0%, #0a0614 55%, #050208 100%)',
      }}
    >
      {/* Popup card — 780px max width, centered, responsive */}
      <div
        className="relative w-full max-w-[780px] my-auto"
        style={{
          background: 'linear-gradient(180deg, #1a0d2e 0%, #120920 60%, #0a0614 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(168, 118, 255, 0.35)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(168,118,255,0.08), inset 0 0 40px rgba(138,43,226,0.06)',
        }}
      >
        {/* Glow accent */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]"
          style={{ opacity: 0.5 }}
        >
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#8a2be2] blur-[80px] opacity-30" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-[#a876ff] blur-[80px] opacity-20" />
        </div>

        {/* Close button */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable content — on mobile, page scrolls; on desktop, card scrolls internally */}
        <div className="relative sm:max-h-[92vh] sm:overflow-y-auto custom-scroll p-5 sm:p-7">
          {/* Header */}
          <header className="flex flex-col items-center text-center pt-3 pb-5">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3"
              style={{
                background: 'linear-gradient(135deg, #8a2be2 0%, #6b1fb8 100%)',
                boxShadow: '0 8px 24px rgba(138,43,226,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
                border: '1px solid rgba(168,118,255,0.5)',
              }}
            >
              <CalendarCheck className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1
              className="text-white font-bold tracking-wide text-2xl sm:text-[28px] leading-tight"
              style={{ textShadow: '0 2px 12px rgba(138,43,226,0.4)' }}
            >
              DAILY CHECK-IN
            </h1>
            <p className="text-[#b8a2ff] text-sm sm:text-[15px] mt-1 font-medium">
              Check-in daily and earn ZP!
            </p>
          </header>

          {/* Wallet section */}
          <section
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(138,43,226,0.10) 0%, rgba(168,118,255,0.05) 100%)',
              border: '1px solid rgba(168,118,255,0.25)',
            }}
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                  <Wallet className="w-5 h-5 text-[#a876ff]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-full border border-[#4ade80]/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                      WALLET CONNECTED
                    </span>
                  </div>
                  <div className="text-white font-mono text-sm mt-1 truncate">
                    0xA4F3<span className="text-white/40">…</span>9C7B
                  </div>
                  <div className="text-[11px] text-[#b8a2ff] mt-0.5 flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gradient-to-br from-[#627eea] to-[#a876ff]" />
                    Ethereum
                  </div>
                </div>
              </div>
              <button
                className="text-xs font-semibold px-4 py-2 rounded-lg bg-[#8a2be2]/30 hover:bg-[#8a2be2]/50 text-white border border-[#a876ff]/50 transition-colors whitespace-nowrap"
              >
                CHANGE WALLET
              </button>
            </div>
          </section>

          {/* Stats grid (4 cols on desktop, 2 cols on mobile) */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {STATS.map((s) => {
              const Icon = s.icon
              return (
                <div
                  key={s.label}
                  className="rounded-xl p-3.5 flex flex-col"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(168,118,255,0.18)',
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                    <span className="text-[10px] tracking-wider text-[#b8a2ff] font-semibold">
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-white text-2xl font-bold leading-none">
                      {s.value}
                    </span>
                    {s.sub && <span className="text-[#b8a2ff] text-xs">{s.sub}</span>}
                  </div>
                  <span className="text-[11px] text-[#b8a2ff]/80 mt-1">{s.note}</span>
                </div>
              )
            })}
          </section>

          {/* Rewards (3 cols) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {REWARDS.map((r) => {
              const Icon = r.icon
              return (
                <div
                  key={r.header}
                  className="rounded-xl p-4 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(138,43,226,0.08) 100%)',
                    border: '1px solid rgba(168,118,255,0.25)',
                  }}
                >
                  <div className="text-[10px] tracking-wider text-[#b8a2ff] font-semibold mb-2">
                    {r.header}
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon className="w-6 h-6" style={{ color: r.accent }} />
                    <span className="text-white text-2xl font-bold leading-none">
                      {r.amount}
                    </span>
                    <span className="text-[#b8a2ff] text-sm font-semibold">{r.unit}</span>
                  </div>
                  <div className="text-[11px] text-[#b8a2ff]/80 mt-1.5">{r.desc}</div>
                </div>
              )
            })}
          </section>

          {/* Claim button */}
          <button
            onClick={() => setClaimed(true)}
            disabled={claimed}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold tracking-wide text-white text-sm sm:text-base transition-all"
            style={{
              background: claimed
                ? 'linear-gradient(135deg, #2a1a4a 0%, #1a0d2e 100%)'
                : 'linear-gradient(135deg, #8a2be2 0%, #6b1fb8 100%)',
              border: '1px solid rgba(168,118,255,0.6)',
              boxShadow: claimed
                ? 'none'
                : '0 6px 20px rgba(138,43,226,0.45), inset 0 1px 0 rgba(255,255,255,0.2)',
              opacity: claimed ? 0.7 : 1,
              cursor: claimed ? 'default' : 'pointer',
            }}
          >
            {claimed ? (
              <>
                <Check className="w-5 h-5 text-[#4ade80]" />
                REWARD CLAIMED
              </>
            ) : (
              <>
                <CalendarCheck className="w-5 h-5" />
                CLAIM TODAY'S REWARD
              </>
            )}
          </button>

          {/* Countdown timer */}
          <div className="flex items-center justify-center gap-1.5 mt-3 text-center">
            <span className="text-[#b8a2ff] text-xs mr-1">Next check-in in:</span>
            <TimeBox v={pad(t.h)} l="HRS" />
            <span className="text-[#a876ff] font-bold">:</span>
            <TimeBox v={pad(t.m)} l="MIN" />
            <span className="text-[#a876ff] font-bold">:</span>
            <TimeBox v={pad(t.s)} l="SEC" />
          </div>

          {/* Badges — full width */}
          <section className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <SectionHeader title="ACHIEVEMENT BADGES" compact />
              <button className="text-[11px] font-semibold text-[#a876ff] hover:text-white px-2.5 py-1 rounded-md bg-[#8a2be2]/20 border border-[#a876ff]/30">
                VIEW ALL
              </button>
            </div>
            <div
              className="rounded-2xl p-3 grid grid-cols-3 sm:grid-cols-6 gap-2"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(168,118,255,0.18)',
              }}
            >
              {BADGES.map((b) => {
                const Icon = b.icon
                return (
                  <div
                    key={b.name}
                    className="flex flex-col items-center text-center p-2 rounded-lg"
                    style={{
                      background: b.unlocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                      border: `1px solid ${b.unlocked ? `${b.color}55` : 'rgba(255,255,255,0.05)'}`,
                      opacity: b.unlocked ? 1 : 0.4,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center mb-1.5"
                      style={{
                        background: b.unlocked
                          ? `radial-gradient(circle, ${b.color}33 0%, transparent 70%)`
                          : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${b.unlocked ? `${b.color}88` : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: b.unlocked ? b.color : '#666' }}
                      />
                    </div>
                    <span className="text-[10px] text-white/80 leading-tight font-medium">
                      {b.name}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-5 pt-4 border-t border-white/5">
            <div className="flex items-start gap-2 text-[11px] text-[#b8a2ff]/70 leading-relaxed">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <p>
                One claim per day. Rewards reset if you miss a day. All rewards are in{' '}
                <span className="text-[#a876ff] font-semibold">ZP (Zyron Points)</span>.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* Inline styles for custom scrollbar */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(168, 118, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 118, 255, 0.5);
        }
      `}</style>
    </div>
  )
}

/* ---------- Small components ---------- */

function TimeBox({ v, l }: { v: string; l: string }) {
  return (
    <div className="inline-flex flex-col items-center">
      <span
        className="text-white font-mono font-bold text-base sm:text-lg leading-none px-1.5 py-1 rounded-md"
        style={{
          background: 'rgba(138,43,226,0.15)',
          border: '1px solid rgba(168,118,255,0.3)',
          minWidth: '34px',
          textAlign: 'center',
        }}
      >
        {v}
      </span>
      <span className="text-[9px] text-[#b8a2ff] tracking-wider mt-0.5">{l}</span>
    </div>
  )
}

function SectionHeader({
  title,
  compact = false,
}: {
  title: string
  compact?: boolean
}) {
  return (
    <h2
      className={`text-white font-bold tracking-wider ${compact ? 'text-[11px]' : 'text-xs sm:text-[13px]'} mb-2 flex items-center gap-1.5`}
    >
      <Sparkles className="w-3 h-3 text-[#a876ff]" />
      {title}
    </h2>
  )
}


