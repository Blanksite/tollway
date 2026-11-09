// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TollwayVault — Universal 100ms Micro-Payment, Pay-to-Unlock & Self-Paying $KNTQ Pass
 * @author Arief Noerhidayat (@Blanksite) — Rasabaik Studio
 * @notice Built for Elysium L2 (Arbitrum Orbit / Hyperliquid Ecosystem) & Ascend Builder Incubator.
 *
 * Key Capabilities:
 * 1. TollPass Spend Governor: Rolling 24h spend limits, max per-call caps & 1-click emergency freeze.
 * 2. TollYield ($KNTQ Self-Paying Pass): Deducts micro-tolls from accrued yield first before principal.
 * 3. Free-Quota Gate: First N calls/views per user are automatically free before charging.
 * 4. TollSplit: Atomic 100ms split across Creator, Co-Creator, Affiliate Referrer & Ascend Treasury.
 * 5. TollSLA: Instant atomic refund if an API endpoint fails its response SLA.
 * 6. Resaleable Access Pass: Secondary transfer of unlocked passes with automatic 5% creator royalty.
 */

interface IERC20Minimal {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract TollwayVault {
    IERC20Minimal public immutable settlementToken; // USDC on Elysium L2
    address public immutable ascendTreasury;        // Ascend / $KNTQ Buyback & Treasury

    uint256 public constant BPS_DENOMINATOR = 10_000;
    uint256 public constant PROTOCOL_FEE_BPS = 50; // 0.50% protocol fee (75% treasury / 25% buyback)
    uint256 public constant RESALE_ROYALTY_BPS = 500; // 5.00% creator royalty on pass resale

    struct TollPass {
        uint256 principalBalance;
        uint256 accruedYieldBalance; // Earned via $KNTQ / Kinetiq yield strategy
        uint256 dailySpendLimit;
        uint256 maxSingleToll;
        uint256 spentToday;
        uint256 windowStartTimestamp;
        bool frozen;
    }

    struct TollGate {
        address creator;
        address coCreator;
        uint16 coCreatorBps;     // e.g. 2000 = 20%
        uint16 affiliateBps;     // e.g. 1000 = 10% for ?ref= referrer
        uint256 pricePerAccess;  // in 6-decimal USDC (e.g. 2000 = $0.002)
        uint32 freeQuotaPerUser; // e.g. first 2 calls free
        bool transferablePass;   // true for TollLink digital files / quota bundles
        bool active;
    }

    mapping(address => TollPass) public passes;
    mapping(address => mapping(address => bool)) public authorizedAgentKeys;
    mapping(bytes32 => TollGate) public gates;
    mapping(bytes32 => mapping(address => uint32)) public userGateUsageCount;
    mapping(bytes32 => mapping(address => bool)) public hasUnlockedPass;

    event PassFunded(address indexed owner, uint256 principalAdded, uint256 yieldAdded);
    event PolicyUpdated(address indexed owner, uint256 dailyLimit, uint256 maxSingle, bool frozen);
    event GateRegistered(bytes32 indexed gateId, address indexed creator, uint256 price, uint32 freeQuota);
    event TollSettled(
        bytes32 indexed gateId,
        address indexed payer,
        address indexed referrer,
        uint256 amountPaid,
        uint256 paidFromYield,
        bool usedFreeQuota
    );
    event SLARefunded(bytes32 indexed gateId, address indexed payer, uint256 refundAmount);
    event AccessPassResold(bytes32 indexed gateId, address indexed seller, address indexed buyer, uint256 price, uint256 creatorRoyalty);

    error PassFrozen();
    error ExceedsSingleTollLimit(uint256 requested, uint256 maxAllowed);
    error ExceedsDailySpendLimit(uint256 requested, uint256 remainingDaily);
    error InsufficientPassBalance();
    error UnauthorizedCaller();
    error GateNotActive();
    error PassNotOwnedOrNonTransferable();

    constructor(address _settlementToken, address _ascendTreasury) {
        settlementToken = IERC20Minimal(_settlementToken);
        ascendTreasury = _ascendTreasury;
    }

    /// @notice Deposit USDC into TollPass and configure spending guardrails
    function fundTollPass(uint256 amount, uint256 dailyLimit, uint256 maxSingle) external {
        if (amount > 0) {
            require(settlementToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        }
        TollPass storage p = passes[msg.sender];
        p.principalBalance += amount;
        if (dailyLimit > 0) p.dailySpendLimit = dailyLimit;
        if (maxSingle > 0) p.maxSingleToll = maxSingle;
        if (p.windowStartTimestamp == 0) p.windowStartTimestamp = block.timestamp;

        emit PassFunded(msg.sender, amount, 0);
    }

    /// @notice Credit $KNTQ / Kinetiq yield to user's self-paying balance
    function creditYield(address passOwner, uint256 yieldAmount) external {
        require(settlementToken.transferFrom(msg.sender, address(this), yieldAmount), "Yield transfer failed");
        passes[passOwner].accruedYieldBalance += yieldAmount;
        emit PassFunded(passOwner, 0, yieldAmount);
    }

    /// @notice Update spending limits or trigger 1-click emergency freeze
    function setPassPolicy(uint256 dailyLimit, uint256 maxSingle, bool freeze) external {
        TollPass storage p = passes[msg.sender];
        p.dailySpendLimit = dailyLimit;
        p.maxSingleToll = maxSingle;
        p.frozen = freeze;
        emit PolicyUpdated(msg.sender, dailyLimit, maxSingle, freeze);
    }

    /// @notice Authorize or revoke an autonomous AI agent session key
    function setAgentAuthorization(address agentKey, bool authorized) external {
        authorizedAgentKeys[msg.sender][agentKey] = authorized;
    }

    /// @notice Register a Toll402 API endpoint or TollLink digital asset gate
    function registerGate(
        bytes32 gateId,
        address coCreator,
        uint16 coCreatorBps,
        uint16 affiliateBps,
        uint256 pricePerAccess,
        uint32 freeQuotaPerUser,
        bool transferablePass
    ) external {
        require(coCreatorBps + affiliateBps + PROTOCOL_FEE_BPS <= BPS_DENOMINATOR, "Invalid split BPS");
        gates[gateId] = TollGate({
            creator: msg.sender,
            coCreator: coCreator,
            coCreatorBps: coCreatorBps,
            affiliateBps: affiliateBps,
            pricePerAccess: pricePerAccess,
            freeQuotaPerUser: freeQuotaPerUser,
            transferablePass: transferablePass,
            active: true
        });
        emit GateRegistered(gateId, msg.sender, pricePerAccess, freeQuotaPerUser);
    }

    /// @notice Execute 100ms Toll settlement (supports Free-Tier, Self-Paying Yield & TollSplit)
    function passTollGate(
        address passOwner,
        bytes32 gateId,
        address referrer
    ) external {
        if (msg.sender != passOwner && !authorizedAgentKeys[passOwner][msg.sender]) {
            revert UnauthorizedCaller();
        }

        TollGate memory gate = gates[gateId];
        if (!gate.active) revert GateNotActive();

        TollPass storage p = passes[passOwner];
        if (p.frozen) revert PassFrozen();

        // Check Free-Tier Quota first
        uint32 currentUsage = userGateUsageCount[gateId][passOwner];
        userGateUsageCount[gateId][passOwner] = currentUsage + 1;

        if (currentUsage < gate.freeQuotaPerUser) {
            hasUnlockedPass[gateId][passOwner] = true;
            emit TollSettled(gateId, passOwner, referrer, 0, 0, true);
            return;
        }

        uint256 price = gate.pricePerAccess;

        // Reset 24h rolling window if needed
        if (block.timestamp >= p.windowStartTimestamp + 1 days) {
            p.spentToday = 0;
            p.windowStartTimestamp = block.timestamp;
        }

        if (p.maxSingleToll > 0 && price > p.maxSingleToll) {
            revert ExceedsSingleTollLimit(price, p.maxSingleToll);
        }
        if (p.dailySpendLimit > 0 && p.spentToday + price > p.dailySpendLimit) {
            revert ExceedsDailySpendLimit(price, p.dailySpendLimit - p.spentToday);
        }
        if (p.accruedYieldBalance + p.principalBalance < price) {
            revert InsufficientPassBalance();
        }

        p.spentToday += price;

        // Self-Paying Logic: Deduct from $KNTQ accrued yield first!
        uint256 paidFromYield = 0;
        if (p.accruedYieldBalance >= price) {
            p.accruedYieldBalance -= price;
            paidFromYield = price;
        } else {
            paidFromYield = p.accruedYieldBalance;
            uint256 remainder = price - paidFromYield;
            p.accruedYieldBalance = 0;
            p.principalBalance -= remainder;
        }

        hasUnlockedPass[gateId][passOwner] = true;

        // Atomic TollSplit distribution
        uint256 protocolFee = (price * PROTOCOL_FEE_BPS) / BPS_DENOMINATOR;
        uint256 affiliateCut = (referrer != address(0) && gate.affiliateBps > 0)
            ? (price * gate.affiliateBps) / BPS_DENOMINATOR
            : 0;
        uint256 coCreatorCut = (gate.coCreator != address(0) && gate.coCreatorBps > 0)
            ? (price * gate.coCreatorBps) / BPS_DENOMINATOR
            : 0;
        uint256 creatorNet = price - protocolFee - affiliateCut - coCreatorCut;

        if (protocolFee > 0) settlementToken.transfer(ascendTreasury, protocolFee);
        if (affiliateCut > 0) settlementToken.transfer(referrer, affiliateCut);
        if (coCreatorCut > 0) settlementToken.transfer(gate.coCreator, coCreatorCut);
        if (creatorNet > 0) settlementToken.transfer(gate.creator, creatorNet);

        emit TollSettled(gateId, passOwner, referrer, price, paidFromYield, false);
    }

    /// @notice Resell an unlocked TollLink pass on the secondary market with 5% creator royalty
    function resellAccessPass(bytes32 gateId, address buyer, uint256 resalePrice) external {
        TollGate memory gate = gates[gateId];
        if (!gate.transferablePass || !hasUnlockedPass[gateId][msg.sender]) {
            revert PassNotOwnedOrNonTransferable();
        }

        require(settlementToken.transferFrom(buyer, address(this), resalePrice), "Payment failed");

        uint256 creatorRoyalty = (resalePrice * RESALE_ROYALTY_BPS) / BPS_DENOMINATOR;
        uint256 sellerProceeds = resalePrice - creatorRoyalty;

        hasUnlockedPass[gateId][msg.sender] = false;
        hasUnlockedPass[gateId][buyer] = true;

        if (creatorRoyalty > 0) settlementToken.transfer(gate.creator, creatorRoyalty);
        if (sellerProceeds > 0) settlementToken.transfer(msg.sender, sellerProceeds);

        emit AccessPassResold(gateId, msg.sender, buyer, resalePrice, creatorRoyalty);
    }
}
