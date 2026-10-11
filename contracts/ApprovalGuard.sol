// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApprovalGuard
 * @notice On-chain security registry for BOT Chain token approval monitoring, risk thresholds, and gas-metered audit scans.
 * 
 * IMPORTANT: ERC-20 approvals reside strictly inside each individual token's contract.
 * ApprovalGuard does not independently spend or revoke token permissions without the user's signature;
 * instead, this contract acts as the decentralized source of truth for user security rules,
 * trusted spender registries, allowance thresholds, and gas-metered security audits.
 */
contract ApprovalGuard {
    // --- Events ---
    event ScanAuditExecuted(
        address indexed caller,
        address indexed targetWallet,
        uint256 feePaid,
        uint256 blockNumber,
        uint256 timestamp
    );

    event MonitoringRuleConfigured(
        address indexed user,
        address indexed token,
        uint256 maxAllowedLimit,
        bool isMonitored,
        uint256 timestamp
    );

    event SpenderTrustUpdated(
        address indexed user,
        address indexed spender,
        bool isTrusted,
        string protocolName,
        uint256 timestamp
    );

    event ThresholdExceeded(
        address indexed user,
        address indexed token,
        address indexed spender,
        uint256 currentAllowance,
        uint256 thresholdLimit,
        uint256 timestamp
    );

    event ApprovalAlertLogged(
        address indexed user,
        address indexed token,
        address indexed spender,
        string alertType,
        string details,
        uint256 timestamp
    );

    event GlobalGuardToggled(
        address indexed user,
        bool enabled,
        uint256 timestamp
    );

    // --- Structs ---
    struct UserRule {
        bool isMonitored;
        uint256 maxAllowedLimit; // Flag if allowance exceeds this limit (0 = strictly no allowance allowed)
        uint256 lastUpdated;
    }

    struct SpenderInfo {
        bool isTrusted;
        string protocolName;
        uint256 addedAt;
    }

    // --- State Mappings ---
    // user => (token => rule)
    mapping(address => mapping(address => UserRule)) public userTokenRules;

    // user => (spender => spenderInfo)
    mapping(address => mapping(address => SpenderInfo)) public userSpenderTrust;

    // user => list of monitored tokens
    mapping(address => address[]) private userMonitoredTokens;

    // user => list of trusted spenders
    mapping(address => address[]) private userTrustedSpenders;

    // user => global alert active
    mapping(address => bool) public userGuardActive;

    // wallet => last audit timestamp
    mapping(address => uint256) public userLastAudit;
    uint256 public totalAuditsExecuted;

    // Gas-metered scan fee in wei (e.g. 0.0001 BOT)
    uint256 public scanFee;

    // Owner / Deployer metadata for BOT Chain deployment
    address public immutable deployer;
    uint256 public immutable deployedBlock;

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Only deployer");
        _;
    }

    constructor() {
        deployer = msg.sender;
        deployedBlock = block.number;
        scanFee = 0.0001 ether; // 0.0001 BOT nominal fee + standard EVM gas
    }

    /**
     * @notice Execute an on-chain security audit scan for a target wallet (costs gas on BOT Chain)
     * @param targetWallet The wallet to audit
     */
    function executeAuditScan(address targetWallet) external payable {
        require(msg.value >= scanFee, "Insufficient audit scan fee");
        require(targetWallet != address(0), "Invalid wallet address");

        userLastAudit[targetWallet] = block.timestamp;
        totalAuditsExecuted++;

        emit ScanAuditExecuted(
            msg.sender,
            targetWallet,
            msg.value,
            block.number,
            block.timestamp
        );
    }

    /**
     * @notice Update the audit scan fee
     */
    function setScanFee(uint256 newFee) external onlyDeployer {
        scanFee = newFee;
    }

    /**
     * @notice Withdraw accumulated audit fees
     */
    function withdrawFees() external onlyDeployer {
        payable(deployer).transfer(address(this).balance);
    }

    /**
     * @notice Configure monitoring rule for a specific token
     * @param token Address of ERC-20 token contract on BOT Chain
     * @param maxAllowedLimit Maximum tolerated allowance before triggering security alert
     * @param isMonitored Whether this token is actively watched
     */
    function configureTokenRule(
        address token,
        uint256 maxAllowedLimit,
        bool isMonitored
    ) external {
        require(token != address(0), "Invalid token address");

        bool exists = userTokenRules[msg.sender][token].lastUpdated != 0;
        userTokenRules[msg.sender][token] = UserRule({
            isMonitored: isMonitored,
            maxAllowedLimit: maxAllowedLimit,
            lastUpdated: block.timestamp
        });

        if (!exists) {
            userMonitoredTokens[msg.sender].push(token);
        }

        emit MonitoringRuleConfigured(
            msg.sender,
            token,
            maxAllowedLimit,
            isMonitored,
            block.timestamp
        );
    }

    /**
     * @notice Mark a spender protocol as trusted or untrusted
     * @param spender Address of protocol/contract (e.g., BOTSwap Router)
     * @param isTrusted Whether the user trusts this contract
     * @param protocolName Descriptive label (e.g. "BOTSwap Router v2")
     */
    function setSpenderTrust(
        address spender,
        bool isTrusted,
        string calldata protocolName
    ) external {
        require(spender != address(0), "Invalid spender address");

        bool exists = userSpenderTrust[msg.sender][spender].addedAt != 0;
        userSpenderTrust[msg.sender][spender] = SpenderInfo({
            isTrusted: isTrusted,
            protocolName: protocolName,
            addedAt: block.timestamp
        });

        if (!exists) {
            userTrustedSpenders[msg.sender].push(spender);
        }

        emit SpenderTrustUpdated(
            msg.sender,
            spender,
            isTrusted,
            protocolName,
            block.timestamp
        );
    }

    /**
     * @notice Log an on-chain alert when an off-chain scan detects an allowance violation
     * @param token Address of the token
     * @param spender Address of the spender
     * @param alertType Alert classification (e.g., "UNLIMITED_ALLOWANCE", "UNVERIFIED_SPENDER")
     * @param details Additional context or transaction reference
     */
    function recordSecurityAlert(
        address token,
        address spender,
        string calldata alertType,
        string calldata details
    ) external {
        emit ApprovalAlertLogged(
            msg.sender,
            token,
            spender,
            alertType,
            details,
            block.timestamp
        );
    }

    /**
     * @notice Toggle global monitoring guard status for caller
     * @param enabled Active status
     */
    function toggleGuard(bool enabled) external {
        userGuardActive[msg.sender] = enabled;
        emit GlobalGuardToggled(msg.sender, enabled, block.timestamp);
    }

    /**
     * @notice Retrieve all tokens monitored by user
     */
    function getMonitoredTokens(address user) external view returns (address[] memory) {
        return userMonitoredTokens[user];
    }

    /**
     * @notice Retrieve all trusted spenders registered by user
     */
    function getTrustedSpenders(address user) external view returns (address[] memory) {
        return userTrustedSpenders[user];
    }

    /**
     * @notice Check whether a token allowance violates user's defined rule
     */
    function isAllowanceViolated(
        address user,
        address token,
        uint256 currentAllowance
    ) external view returns (bool violated, uint256 maxLimit) {
        UserRule memory rule = userTokenRules[user][token];
        if (!rule.isMonitored) {
            return (false, 0);
        }
        if (currentAllowance > rule.maxAllowedLimit) {
            return (true, rule.maxAllowedLimit);
        }
        return (false, rule.maxAllowedLimit);
    }
}
