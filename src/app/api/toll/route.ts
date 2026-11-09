import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      gateId = "hypercore-orderbook-v1",
      price = 0.002,
      callNumber = 1,
      freeQuota = 2,
      simulateSlaFailure = false,
      passFrozen = false,
      dailyLimit = 2.0,
      spentToday = 0.0,
      yieldBalance = 0.142,
      principalBalance = 25.0,
      coCreatorPct = 15,
      affiliatePct = 10,
      hasAuthHeader = true,
    } = body;

    // 1. If no TollPass authorization is attached, return authentic HTTP 402 Payment Required
    if (!hasAuthHeader) {
      return NextResponse.json(
        {
          status: 402,
          error: "HTTP 402 Payment Required",
          protocol: "Tollway x402 v1 (Elysium L2 - 100ms)",
          gateId,
          priceUsdc: price,
          freeQuotaPerUser: freeQuota,
          accepts: ["USDC (Elysium)", "$KNTQ Yield", "TollTap QRIS/Passkey"],
          instruction: "Attach X-TollPass-Session header to settle in ~90ms",
        },
        {
          status: 402,
          headers: {
            "X-Tollway-Price": String(price),
            "X-Tollway-Chain": "elysium-orbit-l2",
            "X-Tollway-SLA-Timeout-Ms": "2500",
          },
        }
      );
    }

    // 2. Check Emergency Circuit Breaker
    if (passFrozen) {
      return NextResponse.json(
        {
          status: 403,
          verdict: "BLOCKED_BY_CIRCUIT_BREAKER",
          reason: "TollPass Vault is currently locked by owner emergency circuit breaker.",
          chargedUsdc: 0,
          latencyMs: 14,
        },
        { status: 403 }
      );
    }

    // 3. Check Free-Tier Quota
    if (callNumber <= freeQuota) {
      return NextResponse.json({
        status: 200,
        verdict: "FREE_QUOTA_PASS",
        reason: `Free Trial Quota (${callNumber} of ${freeQuota} free passes used). $0.00 charged.`,
        chargedUsdc: 0,
        paidFromYield: 0,
        paidFromPrincipal: 0,
        latencyMs: 68,
        txHash: `0xfree${Math.random().toString(16).slice(2, 14)}...e100`,
        payload: {
          endpoint: gateId,
          timestamp: new Date().toISOString(),
          data: "Verified payload delivered via Free-Quota Gate.",
        },
      });
    }

    // 4. Check Daily Spend Governor Limit
    if (spentToday + price > dailyLimit) {
      return NextResponse.json(
        {
          status: 403,
          verdict: "BLOCKED_BY_SPEND_GOVERNOR",
          reason: `Toll ($${price.toFixed(4)}) exceeds remaining 24h Spend Limit ($${Math.max(0, dailyLimit - spentToday).toFixed(4)} remaining of $${dailyLimit.toFixed(2)} cap).`,
          chargedUsdc: 0,
          latencyMs: 19,
        },
        { status: 403 }
      );
    }

    // 5. Check TollSLA Upstream Failure -> Atomic Refund
    if (simulateSlaFailure) {
      return NextResponse.json({
        status: 502,
        verdict: "SLA_AUTO_REFUNDED",
        reason: `Upstream endpoint returned 502 / timed out (>2500ms). TollSLA atomically reverted $${price.toFixed(4)} back to your TollPass.`,
        chargedUsdc: 0,
        refundedUsdc: price,
        latencyMs: 112,
        txHash: `0xsla_revert_${Math.random().toString(16).slice(2, 10)}`,
      });
    }

    // 6. Self-Paying $KNTQ Yield Deduction First
    const paidFromYield = Math.min(yieldBalance, price);
    const paidFromPrincipal = Math.max(0, price - paidFromYield);

    // 7. TollSplit Calculation
    const protocolFee = +(price * 0.005).toFixed(6); // 0.5% to Ascend/$KNTQ Treasury
    const affiliateCut = +((price * affiliatePct) / 100).toFixed(6);
    const coCreatorCut = +((price * coCreatorPct) / 100).toFixed(6);
    const creatorNet = +(price - protocolFee - affiliateCut - coCreatorCut).toFixed(6);

    return NextResponse.json({
      status: 200,
      verdict: "SETTLED_100MS",
      reason:
        paidFromYield >= price
          ? `100% covered by your $KNTQ Self-Paying Yield! Principal untouched.`
          : `Settled in 91ms on Elysium L2.`,
      chargedUsdc: price,
      paidFromYield,
      paidFromPrincipal,
      latencyMs: 91,
      txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      splits: {
        creatorNet,
        coCreatorCut,
        affiliateCut,
        protocolFee,
      },
      payload: {
        endpoint: gateId,
        blockTimeMs: 100,
        network: "Elysium Orbit L2 (Hyperliquid)",
        result: "200 OK — Verified Data & License Receipt Minted",
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
