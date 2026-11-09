"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Code2,
  Share2,
  QrCode,
  Fingerprint,
  Compass,
  FileText,
  Sparkles,
  Copy,
  Check,
  Sun,
  Moon,
  RotateCcw,
  Coins,
  Layers,
  Terminal,
  Ban,
  Repeat,
} from "lucide-react";

interface ApiEndpointPreset {
  id: string;
  name: string;
  category: string;
  method: "GET" | "POST";
  path: string;
  price: number;
  freeQuota: number;
  latencyMs: number;
  slaUptime: string;
  coCreatorPct: number;
  affiliatePct: number;
  sampleOutput: string;
}

const API_PRESETS: ApiEndpointPreset[] = [
  {
    id: "hypercore-l2-book",
    name: "HyperCore L2 Orderbook & Funding Stream",
    category: "Market Data",
    method: "GET",
    path: "/v1/hypercore/depth?symbol=HYPE-PERP",
    price: 0.002,
    freeQuota: 2,
    latencyMs: 84,
    slaUptime: "99.98%",
    coCreatorPct: 15,
    affiliatePct: 10,
    sampleOutput:
      '{"symbol":"HYPE-PERP","midPrice":28.42,"fundingRate":"+0.0124%","spreadBps":1.2,"settledOn":"elysium-100ms"}',
  },
  {
    id: "qris-zktls-verify",
    name: "QRIS & Merchant Receipt zkTLS Verifier",
    category: "PayFi / Indo",
    method: "POST",
    path: "/v1/zk-verify/qris-settlement",
    price: 0.005,
    freeQuota: 2,
    latencyMs: 92,
    slaUptime: "99.95%",
    coCreatorPct: 20,
    affiliatePct: 10,
    sampleOutput:
      '{"verified":true,"merchant":"Kopi Kenangan Kemang","amountIdr":45000,"zkProof":"0x9f8a...3c12","settlement":"instant"}',
  },
  {
    id: "venice-zero-audit",
    name: "Zero-Retention Smart Contract Bytecode Audit",
    category: "AI Agent Tool",
    method: "POST",
    path: "/v1/agent/bytecode-xray",
    price: 0.008,
    freeQuota: 1,
    latencyMs: 96,
    slaUptime: "99.92%",
    coCreatorPct: 10,
    affiliatePct: 15,
    sampleOutput:
      '{"riskScore":4,"verdict":"SAFE_TO_EXECUTE","hooksDetected":false,"retention":"zero-log"}',
  },
];

interface DigitalFilePreset {
  id: string;
  title: string;
  author: string;
  fileType: string;
  fileSize: string;
  price: number;
  resalePrice: number;
  coCreatorPct: number;
  affiliatePct: number;
  previewText: string;
  unlockedContent: string;
}

const FILE_PRESETS: DigitalFilePreset[] = [
  {
    id: "rasabaik-ui-kit",
    title: "Rasabaik Editorial Design System v4.fig",
    author: "@Blanksite • Rasabaik Studio",
    fileType: "Figma + Tailwind Tokens (.zip)",
    fileSize: "48.4 MB",
    price: 0.05,
    resalePrice: 0.04,
    coCreatorPct: 20,
    affiliatePct: 10,
    previewText:
      "Watermarked Preview: Includes 140+ tactile fintech components, StudioPass 3D cards, and WCAG AA token variables...",
    unlockedContent:
      "DOWNLOAD READY: https://cdn.tollway.sh/dl/rasabaik-v4-master.zip?token=0x88f1a9 (Commercial License #TL-9042 Minted)",
  },
  {
    id: "hyperliquid-alpha-pack",
    title: "Elysium & HyperCore Market-Making Backtest Dataset",
    author: "@QuantNusa • Jakarta",
    fileType: "Parquet + Python Notebook",
    fileSize: "312 MB",
    price: 0.08,
    resalePrice: 0.06,
    coCreatorPct: 15,
    affiliatePct: 15,
    previewText:
      "Watermarked Preview: Tick-by-tick 100ms orderbook snapshots across 42 perp pairs with delta-neutral funding strategies...",
    unlockedContent:
      "DOWNLOAD READY: https://cdn.tollway.sh/dl/hypercore-ticks-2026.parquet?token=0x44c2e1 (Data License #TL-9043 Minted)",
  },
];

export default function TollwayPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<"toll402" | "tolllink" | "radar" | "create">("toll402");

  // TollPass State
  const [principalBalance, setPrincipalBalance] = useState<number>(25.0);
  const [yieldBalance, setYieldBalance] = useState<number>(0.142);
  const [dailyLimit, setDailyLimit] = useState<number>(0.5);
  const [spentToday, setSpentToday] = useState<number>(0.0);
  const [passFrozen, setPassFrozen] = useState<boolean>(false);

  // Toll402 State
  const [selectedApi, setSelectedApi] = useState<ApiEndpointPreset>(API_PRESETS[0]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [simulateSlaError, setSimulateSlaError] = useState<boolean>(false);
  const [isCalling, setIsCalling] = useState<boolean>(false);

  // TollLink State
  const [selectedFile, setSelectedFile] = useState<DigitalFilePreset>(FILE_PRESETS[0]);
  const [unlockedFiles, setUnlockedFiles] = useState<Record<string, boolean>>({});
  const [resoldFiles, setResoldFiles] = useState<Record<string, boolean>>({});

  // Modal & Drawer State
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [showContractModal, setShowContractModal] = useState<boolean>(false);
  const [topUpMethod, setTopUpMethod] = useState<"qris" | "passkey" | "bridge">("qris");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Custom Gate Builder State
  const [customGateName, setCustomGateName] = useState("My AI / Design Asset Gate");
  const [customGatePrice, setCustomGatePrice] = useState("0.01");
  const [customFreeQuota, setCustomFreeQuota] = useState("2");
  const [customAffiliatePct, setCustomAffiliatePct] = useState("10");

  // Last Settlement Receipt State
  const [lastReceipt, setLastReceipt] = useState<{
    status: "SETTLED" | "FREE_QUOTA" | "SLA_REFUNDED" | "BLOCKED" | "RESOLD";
    title: string;
    reason: string;
    chargedUsdc: number;
    paidFromYield: number;
    paidFromPrincipal: number;
    latencyMs: number;
    txHash: string;
    splits: {
      creatorNet: number;
      coCreatorCut: number;
      affiliateCut: number;
      protocolFee: number;
    };
    outputText: string;
  }>({
    status: "SETTLED",
    title: "Ready — Select a lane and click Pass Toll Gate",
    reason: "Your $KNTQ Self-Paying Yield (+$0.1420) will automatically cover micro-tolls first.",
    chargedUsdc: 0.002,
    paidFromYield: 0.002,
    paidFromPrincipal: 0,
    latencyMs: 84,
    txHash: "0x7f4c9a12...e100",
    splits: {
      creatorNet: 0.00149,
      coCreatorCut: 0.0003,
      affiliateCut: 0.0002,
      protocolFee: 0.00001,
    },
    outputText: API_PRESETS[0].sampleOutput,
  });

  // Execute API Toll402 Call
  const handlePassApiGate = async () => {
    setIsCalling(true);
    const nextCallNum = (usageCounts[selectedApi.id] || 0) + 1;

    try {
      const res = await fetch("/api/toll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gateId: selectedApi.id,
          price: selectedApi.price,
          callNumber: nextCallNum,
          freeQuota: selectedApi.freeQuota,
          simulateSlaFailure: simulateSlaError,
          passFrozen,
          dailyLimit,
          spentToday,
          yieldBalance,
          principalBalance,
          coCreatorPct: selectedApi.coCreatorPct,
          affiliatePct: selectedApi.affiliatePct,
          hasAuthHeader: true,
        }),
      });

      const data = await res.json();

      if (data.verdict === "BLOCKED_BY_CIRCUIT_BREAKER" || data.verdict === "BLOCKED_BY_SPEND_GOVERNOR") {
        setLastReceipt({
          status: "BLOCKED",
          title: `Gate Blocked (${data.verdict.replace(/_/g, " ")})`,
          reason: data.reason,
          chargedUsdc: 0,
          paidFromYield: 0,
          paidFromPrincipal: 0,
          latencyMs: data.latencyMs || 15,
          txHash: "0x00000000_reverted",
          splits: { creatorNet: 0, coCreatorCut: 0, affiliateCut: 0, protocolFee: 0 },
          outputText: `{"error":"403_TOLL_BLOCKED","reason":"${data.reason}"}`,
        });
      } else if (data.verdict === "FREE_QUOTA_PASS") {
        setUsageCounts((prev) => ({ ...prev, [selectedApi.id]: nextCallNum }));
        setLastReceipt({
          status: "FREE_QUOTA",
          title: `Free-Tier Pass (${nextCallNum}/${selectedApi.freeQuota} Free)`,
          reason: data.reason,
          chargedUsdc: 0,
          paidFromYield: 0,
          paidFromPrincipal: 0,
          latencyMs: data.latencyMs,
          txHash: data.txHash,
          splits: { creatorNet: 0, coCreatorCut: 0, affiliateCut: 0, protocolFee: 0 },
          outputText: selectedApi.sampleOutput,
        });
      } else if (data.verdict === "SLA_AUTO_REFUNDED") {
        setLastReceipt({
          status: "SLA_REFUNDED",
          title: "TollSLA Auto-Refund Triggered",
          reason: data.reason,
          chargedUsdc: 0,
          paidFromYield: 0,
          paidFromPrincipal: 0,
          latencyMs: data.latencyMs,
          txHash: data.txHash,
          splits: { creatorNet: 0, coCreatorCut: 0, affiliateCut: 0, protocolFee: 0 },
          outputText:
            '{"status":502,"slaGuard":"ATOMIC_REVERT","message":"Upstream API failed SLA. 100% of your toll was refunded automatically."}',
        });
      } else {
        setUsageCounts((prev) => ({ ...prev, [selectedApi.id]: nextCallNum }));
        setYieldBalance((prev) => Math.max(0, +(prev - data.paidFromYield).toFixed(6)));
        setPrincipalBalance((prev) => Math.max(0, +(prev - data.paidFromPrincipal).toFixed(6)));
        setSpentToday((prev) => +(prev + data.chargedUsdc).toFixed(6));

        setLastReceipt({
          status: "SETTLED",
          title: `100ms Toll Settled ($${data.chargedUsdc.toFixed(4)})`,
          reason: data.reason,
          chargedUsdc: data.chargedUsdc,
          paidFromYield: data.paidFromYield,
          paidFromPrincipal: data.paidFromPrincipal,
          latencyMs: data.latencyMs,
          txHash: data.txHash,
          splits: data.splits,
          outputText: selectedApi.sampleOutput,
        });
      }
    } finally {
      setIsCalling(false);
    }
  };

  // Unlock TollLink File
  const handleUnlockFile = () => {
    if (passFrozen) {
      setLastReceipt({
        status: "BLOCKED",
        title: "Unlock Blocked — TollPass Frozen",
        reason: "Unlock your TollPass circuit breaker on the right panel to proceed.",
        chargedUsdc: 0,
        paidFromYield: 0,
        paidFromPrincipal: 0,
        latencyMs: 12,
        txHash: "0x0000_frozen",
        splits: { creatorNet: 0, coCreatorCut: 0, affiliateCut: 0, protocolFee: 0 },
        outputText: "Access locked.",
      });
      return;
    }

    if (spentToday + selectedFile.price > dailyLimit) {
      setLastReceipt({
        status: "BLOCKED",
        title: "Blocked by 24h Spend Governor",
        reason: `File unlock ($${selectedFile.price.toFixed(2)}) exceeds remaining daily cap ($${Math.max(0, dailyLimit - spentToday).toFixed(4)}). Increase your slider on the right.`,
        chargedUsdc: 0,
        paidFromYield: 0,
        paidFromPrincipal: 0,
        latencyMs: 16,
        txHash: "0x0000_cap_exceeded",
        splits: { creatorNet: 0, coCreatorCut: 0, affiliateCut: 0, protocolFee: 0 },
        outputText: "Access locked.",
      });
      return;
    }

    const price = selectedFile.price;
    const paidFromYield = Math.min(yieldBalance, price);
    const paidFromPrincipal = Math.max(0, price - paidFromYield);

    setYieldBalance((prev) => Math.max(0, +(prev - paidFromYield).toFixed(6)));
    setPrincipalBalance((prev) => Math.max(0, +(prev - paidFromPrincipal).toFixed(6)));
    setSpentToday((prev) => +(prev + price).toFixed(6));
    setUnlockedFiles((prev) => ({ ...prev, [selectedFile.id]: true }));
    setResoldFiles((prev) => ({ ...prev, [selectedFile.id]: false }));

    const protocolFee = +(price * 0.005).toFixed(6);
    const affiliateCut = +((price * selectedFile.affiliatePct) / 100).toFixed(6);
    const coCreatorCut = +((price * selectedFile.coCreatorPct) / 100).toFixed(6);
    const creatorNet = +(price - protocolFee - affiliateCut - coCreatorCut).toFixed(6);

    setLastReceipt({
      status: "SETTLED",
      title: `TollLink Unlocked: ${selectedFile.title}`,
      reason:
        paidFromYield >= price
          ? `Unlocked in 88ms — 100% paid by your $KNTQ Self-Paying Yield!`
          : `Unlocked in 88ms on Elysium L2.`,
      chargedUsdc: price,
      paidFromYield,
      paidFromPrincipal,
      latencyMs: 88,
      txHash: `0xlink_${Math.random().toString(16).slice(2, 10)}`,
      splits: { creatorNet, coCreatorCut, affiliateCut, protocolFee },
      outputText: selectedFile.unlockedContent,
    });
  };

  // Resell Unlocked Pass on Secondary Market
  const handleResellPass = () => {
    const resalePrice = selectedFile.resalePrice;
    const creatorRoyalty = +(resalePrice * 0.05).toFixed(4);
    const sellerProceeds = +(resalePrice - creatorRoyalty).toFixed(4);

    setPrincipalBalance((prev) => +(prev + sellerProceeds).toFixed(4));
    setUnlockedFiles((prev) => ({ ...prev, [selectedFile.id]: false }));
    setResoldFiles((prev) => ({ ...prev, [selectedFile.id]: true }));

    setLastReceipt({
      status: "RESOLD",
      title: `Access Pass Resold (+$${sellerProceeds.toFixed(4)} USDC)`,
      reason: `Sold on Tollway Secondary Market for $${resalePrice.toFixed(2)}. You received $${sellerProceeds.toFixed(4)} and creator earned $${creatorRoyalty.toFixed(4)} (5% royalty).`,
      chargedUsdc: resalePrice,
      paidFromYield: 0,
      paidFromPrincipal: 0,
      latencyMs: 94,
      txHash: `0xresell_${Math.random().toString(16).slice(2, 10)}`,
      splits: {
        creatorNet: creatorRoyalty,
        coCreatorCut: 0,
        affiliateCut: sellerProceeds,
        protocolFee: 0,
      },
      outputText: `Pass ownership transferred to buyer 0x91B...44C. +$${sellerProceeds.toFixed(4)} credited to your TollPass.`,
    });
  };

  const sdkSnippet = `import { withTollway } from "@tollway/sdk";

export const GET = withTollway(async (req) => {
  return Response.json({ data: "Verified 100ms payload" });
}, {
  priceUsdc: ${customGatePrice || "0.002"},
  freeQuota: ${customFreeQuota || "2"},
  affiliateBps: ${(Number(customAffiliatePct) || 10) * 100}, // ${customAffiliatePct}% instant referral cut
  slaTimeoutMs: 2500 // Auto-refund if upstream fails
});`;

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#0C0E0D] text-[#141413] dark:text-[#EDEDEB] subtle-grid transition-colors duration-200">
        {/* TOP NAVIGATION BAR */}
        <header className="border-b border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6]/90 dark:bg-[#0C0E0D]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-mono font-semibold text-sm shadow-sm">
                T
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-base">Tollway</span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-[#0F766E] dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Elysium L2 • 100ms
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowContractModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5E4DF] dark:border-[#232725] bg-white dark:bg-[#131615] hover:border-neutral-400 dark:hover:border-neutral-600 flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Code2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-emerald-400" />
                <span>TollwayVault.sol</span>
              </button>

              <button
                onClick={() => setShowTopUpModal(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#141413] dark:bg-white text-white dark:text-[#141413] hover:opacity-90 flex items-center gap-1.5 cursor-pointer transition-opacity"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>TollTap Top-Up</span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle theme"
                className="p-2 rounded-lg border border-[#E5E4DF] dark:border-[#232725] bg-white dark:bg-[#131615] hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* COMPACT EDITORIAL HERO */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E4DF] dark:border-[#232725]">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-medium text-[#0F766E] dark:text-emerald-400 mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>Universal 100ms Micro-Commerce &amp; HTTP 402 Rail on Elysium</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight leading-[1.15]">
                Pay per action in 100ms.{" "}
                <span className="text-[#0F766E] dark:text-emerald-400">
                  Funded by your own yield.
                </span>
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#575653] dark:text-neutral-400 max-w-2xl leading-relaxed">
                Monetize any API, MCP server, or digital file without Stripe or $20/mo subscriptions.
                Users and AI agents pass through in 100ms using{" "}
                <strong className="text-[#141413] dark:text-white font-medium">TollPass</strong>—where
                idle deposits earn <span className="font-mono text-xs">$KNTQ</span> yield that covers daily micro-tolls automatically.
              </p>
            </div>

            {/* 3-Step Visual Pill */}
            <div className="flex items-center gap-2 text-xs bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725] rounded-xl p-2.5 shrink-0">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 font-medium">
                <Fingerprint className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>1. Tap Passkey/QRIS</span>
              </div>
              <span className="text-neutral-400">→</span>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 font-medium">
                <Coins className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>2. Earn $KNTQ Yield</span>
              </div>
              <span className="text-neutral-400">→</span>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 text-[#0F766E] dark:text-emerald-400 font-medium">
                <Unlock className="w-3.5 h-3.5" />
                <span>3. Auto-Pass 100ms</span>
              </div>
            </div>
          </div>

          {/* MAIN 2-COLUMN WORKSPACE (COMPACT, NO ENDLESS SCROLL) */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN (7 COLS): INTERACTIVE 4-TAB GATE SIMULATOR */}
            <div className="lg:col-span-7 bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725] rounded-2xl shadow-sm overflow-hidden">
              {/* Segmented Mode Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6] dark:bg-[#0C0E0D] p-1.5 gap-1">
                <button
                  onClick={() => setActiveTab("toll402")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === "toll402"
                      ? "bg-white dark:bg-[#131615] text-[#141413] dark:text-white shadow-sm border border-[#E5E4DF] dark:border-[#232725]"
                      : "text-[#575653] dark:text-neutral-400 hover:text-[#141413] dark:hover:text-white"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>1. Toll402 (API/AI)</span>
                </button>

                <button
                  onClick={() => setActiveTab("tolllink")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === "tolllink"
                      ? "bg-white dark:bg-[#131615] text-[#141413] dark:text-white shadow-sm border border-[#E5E4DF] dark:border-[#232725]"
                      : "text-[#575653] dark:text-neutral-400 hover:text-[#141413] dark:hover:text-white"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>2. TollLink (Files)</span>
                </button>

                <button
                  onClick={() => setActiveTab("radar")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === "radar"
                      ? "bg-white dark:bg-[#131615] text-[#141413] dark:text-white shadow-sm border border-[#E5E4DF] dark:border-[#232725]"
                      : "text-[#575653] dark:text-neutral-400 hover:text-[#141413] dark:hover:text-white"
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>3. TollRadar</span>
                </button>

                <button
                  onClick={() => setActiveTab("create")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    activeTab === "create"
                      ? "bg-white dark:bg-[#131615] text-[#141413] dark:text-white shadow-sm border border-[#E5E4DF] dark:border-[#232725]"
                      : "text-[#575653] dark:text-neutral-400 hover:text-[#141413] dark:hover:text-white"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>4. Create Gate</span>
                </button>
              </div>

              {/* TAB 1: TOLL402 API & AI AGENT GATE */}
              {activeTab === "toll402" && (
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold tracking-tight">
                        HTTP 402 (x402) API &amp; AI Agent Toll Gate
                      </h2>
                      <p className="text-xs text-[#575653] dark:text-neutral-400">
                        First {selectedApi.freeQuota} calls are free. Subsequent calls auto-settle from your $KNTQ yield in ~90ms.
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-emerald-500/10 text-[#0F766E] dark:text-emerald-400">
                      ${selectedApi.price.toFixed(3)} / call
                    </span>
                  </div>

                  {/* Endpoint Selector */}
                  <div className="grid grid-cols-1 gap-2">
                    {API_PRESETS.map((ep) => {
                      const used = usageCounts[ep.id] || 0;
                      const isSelected = selectedApi.id === ep.id;
                      return (
                        <button
                          key={ep.id}
                          onClick={() => setSelectedApi(ep)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "border-[#0F766E] bg-emerald-500/5 dark:bg-emerald-500/10"
                              : "border-[#E5E4DF] dark:border-[#232725] hover:border-neutral-400"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800">
                                {ep.method}
                              </span>
                              <span className="text-sm font-medium truncate">{ep.name}</span>
                            </div>
                            <div className="text-xs font-mono text-[#575653] dark:text-neutral-400 mt-1 truncate">
                              {ep.path}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-mono font-semibold">
                              ${ep.price.toFixed(3)}
                            </div>
                            <div className="text-[11px] text-[#0F766E] dark:text-emerald-400">
                              {used < ep.freeQuota
                                ? `${ep.freeQuota - used} free left`
                                : `Metered (${used} calls)`}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* TollSLA Simulation Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#0C0E0D] border border-[#E5E4DF] dark:border-[#232725]">
                    <div className="flex items-center gap-2.5">
                      <RotateCcw className="w-4 h-4 text-[#0F766E]" />
                      <div>
                        <div className="text-xs font-medium">
                          Test TollSLA Failure Protection (502 / Timeout)
                        </div>
                        <div className="text-[11px] text-[#575653] dark:text-neutral-400">
                          If enabled, simulates a broken API to demonstrate instant atomic refund.
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={simulateSlaError}
                      onChange={(e) => setSimulateSlaError(e.target.checked)}
                      className="w-4 h-4 accent-[#0F766E] cursor-pointer"
                    />
                  </div>

                  {/* Primary Action Button */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePassApiGate}
                      disabled={isCalling}
                      className="flex-1 h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                    >
                      <Zap className="w-4 h-4" />
                      <span>
                        {isCalling
                          ? "Settling on Elysium (100ms)..."
                          : (usageCounts[selectedApi.id] || 0) < selectedApi.freeQuota && !simulateSlaError
                          ? `Pass Toll Gate (Free Trial ${(usageCounts[selectedApi.id] || 0) + 1}/${selectedApi.freeQuota})`
                          : `Pass Toll Gate ($${selectedApi.price.toFixed(3)} via $KNTQ Yield)`}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: TOLLLINK NO-CODE FILE PAY-TO-UNLOCK & RESALE */}
              {activeTab === "tolllink" && (
                <div className="p-5 space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold tracking-tight">
                        TollLink — Pay-to-Unlock &amp; Resaleable License Pass
                      </h2>
                      <p className="text-xs text-[#575653] dark:text-neutral-400">
                        WeTransfer + Instant Escrow. Unlock files in 1 click, then resell unused passes with a 5% creator royalty.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {FILE_PRESETS.map((file) => {
                      const isSelected = selectedFile.id === file.id;
                      const isUnlocked = !!unlockedFiles[file.id];
                      return (
                        <button
                          key={file.id}
                          onClick={() => setSelectedFile(file)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#0F766E] bg-emerald-500/5 dark:bg-emerald-500/10"
                              : "border-[#E5E4DF] dark:border-[#232725]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-mono text-[#0F766E] dark:text-emerald-400 font-medium">
                              {file.fileType}
                            </span>
                            <span className="text-xs font-mono font-semibold">
                              ${file.price.toFixed(2)}
                            </span>
                          </div>
                          <div className="text-sm font-medium line-clamp-1">{file.title}</div>
                          <div className="text-xs text-[#575653] dark:text-neutral-400 mt-1 flex items-center justify-between">
                            <span>{file.author}</span>
                            <span>{isUnlocked ? "Unlocked" : file.fileSize}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* File Preview & Unlock Box */}
                  <div className="p-4 rounded-xl border border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6] dark:bg-[#0C0E0D] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {unlockedFiles[selectedFile.id] ? (
                          <Unlock className="w-4 h-4 text-[#0F766E]" />
                        ) : (
                          <Lock className="w-4 h-4 text-amber-600" />
                        )}
                        <span className="text-xs font-semibold uppercase tracking-wider font-mono">
                          {unlockedFiles[selectedFile.id]
                            ? "Verified Unlocked Asset + On-Chain License"
                            : "Protected Preview (Locked)"}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-[#575653] dark:text-neutral-400">
                        Split: {100 - selectedFile.coCreatorPct - selectedFile.affiliatePct}% Creator /{" "}
                        {selectedFile.coCreatorPct}% Team / {selectedFile.affiliatePct}% Ref
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-lg font-mono text-xs leading-relaxed border ${
                        unlockedFiles[selectedFile.id]
                          ? "bg-emerald-500/10 border-emerald-500/30 text-[#0F766E] dark:text-emerald-300"
                          : "bg-white dark:bg-[#131615] border-[#E5E4DF] dark:border-[#232725] text-[#575653] dark:text-neutral-400"
                      }`}
                    >
                      {unlockedFiles[selectedFile.id]
                        ? selectedFile.unlockedContent
                        : selectedFile.previewText}
                    </div>

                    {!unlockedFiles[selectedFile.id] ? (
                      <button
                        onClick={handleUnlockFile}
                        className="w-full h-11 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>
                          Unlock Instant Access (${selectedFile.price.toFixed(2)} — Paid by $KNTQ Yield)
                        </span>
                      </button>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        <button
                          onClick={handleResellPass}
                          className="flex-1 h-10 rounded-xl border border-[#0F766E] text-[#0F766E] dark:text-emerald-400 hover:bg-emerald-500/10 font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Repeat className="w-3.5 h-3.5" />
                          <span>
                            Resell Access Pass on Secondary Market (+${selectedFile.resalePrice.toFixed(2)} / 5% Creator Royalty)
                          </span>
                        </button>
                      </div>
                    )}
                    {resoldFiles[selectedFile.id] && (
                      <div className="text-xs text-[#0F766E] dark:text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          Pass resold! You recouped ${(selectedFile.resalePrice * 0.95).toFixed(4)} USDC and the creator earned 5% royalty.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: TOLLRADAR SMART AGGREGATOR */}
              {activeTab === "radar" && (
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">
                      TollRadar — Smart API &amp; Digital Asset Aggregator
                    </h2>
                    <p className="text-xs text-[#575653] dark:text-neutral-400">
                      Like Jupiter/1inch for APIs and AI tools. Automatically routes humans and AI agents to the lowest-cost, highest-SLA gate.
                    </p>
                  </div>

                  <div className="divide-y divide-[#E5E4DF] dark:divide-[#232725] border border-[#E5E4DF] dark:border-[#232725] rounded-xl overflow-hidden">
                    {API_PRESETS.map((ep, idx) => (
                      <div
                        key={ep.id}
                        className="p-3.5 bg-white dark:bg-[#131615] flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            {idx === 0 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-[#0F766E] dark:text-emerald-400">
                                BEST ROUTE
                              </span>
                            )}
                            <span className="text-sm font-medium">{ep.name}</span>
                          </div>
                          <div className="text-xs text-[#575653] dark:text-neutral-400 mt-0.5 font-mono">
                            Latency: {ep.latencyMs}ms • SLA: {ep.slaUptime} • Free Trial: {ep.freeQuota}x
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedApi(ep);
                            setActiveTab("toll402");
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E5E4DF] dark:border-[#232725] hover:border-[#0F766E] flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <span>Route (${ep.price.toFixed(3)})</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: CREATE GATE & 3-LINE SDK */}
              {activeTab === "create" && (
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="text-base font-semibold tracking-tight">
                      Launch a Toll Gate in 10 Seconds (No Stripe Required)
                    </h2>
                    <p className="text-xs text-[#575653] dark:text-neutral-400">
                      Configure your price, free trial quota, and instant affiliate split.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1">Price (USDC)</label>
                      <input
                        type="text"
                        value={customGatePrice}
                        onChange={(e) => setCustomGatePrice(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono border border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6] dark:bg-[#0C0E0D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Free Trial Quota</label>
                      <input
                        type="text"
                        value={customFreeQuota}
                        onChange={(e) => setCustomFreeQuota(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono border border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6] dark:bg-[#0C0E0D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Affiliate Split (%)</label>
                      <input
                        type="text"
                        value={customAffiliatePct}
                        onChange={(e) => setCustomAffiliatePct(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-xs font-mono border border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6] dark:bg-[#0C0E0D]"
                      />
                    </div>
                  </div>

                  <div className="relative rounded-xl bg-[#141413] text-[#EDEDEB] p-4 font-mono text-xs overflow-x-auto">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sdkSnippet);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 1800);
                      }}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? "Copied" : "Copy SDK"}</span>
                    </button>
                    <pre className="leading-relaxed">{sdkSnippet}</pre>
                  </div>
                </div>
              )}

              {/* LIVE EXECUTION RECEIPT & TOLLSPLIT BAR (BOTTOM OF LEFT CARD) */}
              <div className="border-t border-[#E5E4DF] dark:border-[#232725] bg-[#FAF9F6] dark:bg-[#0C0E0D] p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {lastReceipt.status === "BLOCKED" ? (
                      <Ban className="w-4 h-4 text-[#B91C1C]" />
                    ) : lastReceipt.status === "SLA_REFUNDED" ? (
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-[#0F766E] dark:text-emerald-400" />
                    )}
                    <span className="text-sm font-semibold">{lastReceipt.title}</span>
                  </div>
                  <span className="text-xs font-mono text-[#575653] dark:text-neutral-400">
                    {lastReceipt.latencyMs}ms • {lastReceipt.txHash}
                  </span>
                </div>

                <p className="text-xs text-[#575653] dark:text-neutral-400">{lastReceipt.reason}</p>

                {/* Atomic 4-Way TollSplit Bar */}
                {lastReceipt.chargedUsdc > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 rounded-lg bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725]">
                      <div className="text-[10px] text-[#575653] dark:text-neutral-400">Creator Net</div>
                      <div className="text-xs font-mono font-semibold text-[#0F766E] dark:text-emerald-400">
                        +${lastReceipt.splits.creatorNet.toFixed(5)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725]">
                      <div className="text-[10px] text-[#575653] dark:text-neutral-400">Co-Creator Split</div>
                      <div className="text-xs font-mono font-semibold">
                        +${lastReceipt.splits.coCreatorCut.toFixed(5)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725]">
                      <div className="text-[10px] text-[#575653] dark:text-neutral-400">Affiliate (?ref)</div>
                      <div className="text-xs font-mono font-semibold">
                        +${lastReceipt.splits.affiliateCut.toFixed(5)}
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725]">
                      <div className="text-[10px] text-[#575653] dark:text-neutral-400">Ascend/$KNTQ (0.5%)</div>
                      <div className="text-xs font-mono font-semibold">
                        +${lastReceipt.splits.protocolFee.toFixed(5)}
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725] font-mono text-[11px] text-[#141413] dark:text-neutral-300 break-all">
                  {lastReceipt.outputText}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN (5 COLS): TACTILE TOLLPASS CARD & SPEND GOVERNOR */}
            <div className="lg:col-span-5 space-y-5">
              {/* TACTILE TOLLPASS E-TOLL CARD */}
              <div className="rounded-2xl bg-[#141413] dark:bg-[#161B19] text-white p-5 shadow-md border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                      TollPass Non-Custodial Vault
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      passFrozen
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {passFrozen ? "GATE FROZEN" : "SELF-PAYING ACTIVE"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] text-neutral-400">Principal Deposit</div>
                    <div className="text-xl font-mono font-semibold mt-0.5">
                      ${principalBalance.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">USDC on Elysium</div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <div className="text-[11px] text-emerald-300 flex items-center justify-between">
                      <span>$KNTQ Yield Buffer</span>
                      <span>14.2% APY</span>
                    </div>
                    <div className="text-xl font-mono font-semibold text-emerald-400 mt-0.5">
                      +${yieldBalance.toFixed(4)}
                    </div>
                    <div className="text-[11px] text-emerald-300/80 mt-0.5">
                      Pays micro-tolls first
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-300 pt-1">
                  <span>Pass ID: 0x71C...89A (FaceID Passkey)</span>
                  <button
                    onClick={() => setYieldBalance((y) => +(y + 0.025).toFixed(4))}
                    className="text-emerald-400 hover:underline font-mono text-[11px] cursor-pointer"
                  >
                    + Simulate $KNTQ Epoch Yield
                  </button>
                </div>
              </div>

              {/* SPEND GOVERNOR & CIRCUIT BREAKER */}
              <div className="bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">On-Chain Spend Governor</h3>
                    <p className="text-xs text-[#575653] dark:text-neutral-400">
                      Protects humans &amp; delegated AI agents from runaway API loops.
                    </p>
                  </div>
                  <span className="text-xs font-mono font-medium">
                    ${spentToday.toFixed(4)} / ${dailyLimit.toFixed(2)}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#575653] dark:text-neutral-400">
                      Max 24h Spend Cap (USDC)
                    </span>
                    <span className="font-mono font-medium">${dailyLimit.toFixed(2)} / day</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="2.00"
                    step="0.01"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(parseFloat(e.target.value))}
                    className="w-full accent-[#0F766E] cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    onClick={() => setPassFrozen(!passFrozen)}
                    className={`flex-1 h-10 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      passFrozen
                        ? "bg-[#0F766E] text-white"
                        : "border border-[#B91C1C]/40 text-[#B91C1C] dark:text-red-400 hover:bg-red-500/10"
                    }`}
                  >
                    {passFrozen ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Unlock TollPass Gate</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Drop Boom Barrier (Emergency Freeze)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* TOLLTAP ONBOARDING MODAL (QRIS / PASSKEY / BRIDGE) */}
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">TollTap — Instant Pass Funding</h3>
                <button
                  onClick={() => setShowTopUpModal(false)}
                  className="text-xs text-[#575653] hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#FAF9F6] dark:bg-[#0C0E0D] border border-[#E5E4DF] dark:border-[#232725]">
                <button
                  onClick={() => setTopUpMethod("qris")}
                  className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    topUpMethod === "qris"
                      ? "bg-white dark:bg-[#131615] shadow-sm"
                      : "text-[#575653]"
                  }`}
                >
                  QRIS (Indo Rp)
                </button>
                <button
                  onClick={() => setTopUpMethod("passkey")}
                  className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    topUpMethod === "passkey"
                      ? "bg-white dark:bg-[#131615] shadow-sm"
                      : "text-[#575653]"
                  }`}
                >
                  FaceID Passkey
                </button>
                <button
                  onClick={() => setTopUpMethod("bridge")}
                  className={`py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    topUpMethod === "bridge"
                      ? "bg-white dark:bg-[#131615] shadow-sm"
                      : "text-[#575653]"
                  }`}
                >
                  Any-Chain USDC
                </button>
              </div>

              {topUpMethod === "qris" && (
                <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#0C0E0D] border border-[#E5E4DF] dark:border-[#232725] space-y-2 text-xs">
                  <div className="font-semibold">Instant QRIS-to-TollPass (zkTLS Solver)</div>
                  <p className="text-[#575653] dark:text-neutral-400">
                    Scan with BCA, GoPay, OVO, or Dana. Rp 160,000 converts to $10.00 USDC on Elysium L2 in 2 seconds with zero seed phrases.
                  </p>
                </div>
              )}

              {topUpMethod === "passkey" && (
                <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#0C0E0D] border border-[#E5E4DF] dark:border-[#232725] space-y-2 text-xs">
                  <div className="font-semibold">Hardware Enclave Passkey (ERC-4337)</div>
                  <p className="text-[#575653] dark:text-neutral-400">
                    Sign micro-tolls with FaceID / TouchID. No browser extension required.
                  </p>
                </div>
              )}

              {topUpMethod === "bridge" && (
                <div className="p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#0C0E0D] border border-[#E5E4DF] dark:border-[#232725] space-y-2 text-xs">
                  <div className="font-semibold">1-Click Hyperliquid / Arbitrum / Solana Deposit</div>
                  <p className="text-[#575653] dark:text-neutral-400">
                    Auto-bridges USDC into your Elysium TollwayVault and activates $KNTQ staking yield immediately.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  setPrincipalBalance((p) => +(p + 10).toFixed(2));
                  setYieldBalance((y) => +(y + 0.05).toFixed(4));
                  setShowTopUpModal(false);
                }}
                className="w-full h-10 rounded-xl bg-[#0F766E] text-white text-xs font-medium cursor-pointer"
              >
                Simulate +$10.00 Top-Up (+ $0.05 $KNTQ Bonus Yield)
              </button>
            </div>
          </div>
        )}

        {/* SMART CONTRACT MODAL */}
        {showContractModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#131615] border border-[#E5E4DF] dark:border-[#232725] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  contracts/TollwayVault.sol (Elysium Orbit L2)
                </h3>
                <button
                  onClick={() => setShowContractModal(false)}
                  className="text-xs text-[#575653] hover:text-black dark:hover:text-white cursor-pointer"
                >
                  Close ✕
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-[#141413] text-neutral-200 font-mono text-[11px] overflow-x-auto max-h-96 leading-relaxed">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TollwayVault {
    // 1. Self-Paying $KNTQ Yield: Deducts micro-tolls from accrued yield first!
    // 2. Free-Tier Quota: First N calls per user are $0.00 automatically.
    // 3. Atomic TollSplit: Creator + Co-Creator + Affiliate (?ref) + Ascend Treasury (0.5%).
    // 4. Resaleable Pass: Secondary market transfer with 5% creator royalty.
    function passTollGate(address passOwner, bytes32 gateId, address referrer) external { ... }
    function resellAccessPass(bytes32 gateId, address buyer, uint256 resalePrice) external { ... }
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
