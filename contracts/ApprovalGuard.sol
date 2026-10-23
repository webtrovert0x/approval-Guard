// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApprovalGuard
 * @notice On-chain security registry for BOT Chain token approval monitoring, risk thresholds, and gas-metered audit scans.
 * @dev Optimized for minimal deployment bytecode and minimal gas consumption.
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

    // --- Structs ---
    struct UserRule {
        bool isMonitored;
        uint256 maxAllowedLimit;
        uint256 lastUpdated;
    }

    struct SpenderInfo {
        bool isTrusted;
        string protocolName;
        uint256 addedAt;
    }

    // --- State ---
    mapping(address => mapping(address => UserRule)) public userTokenRules;
    mapping(address => mapping(address => SpenderInfo)) public userSpenderTrust;
    mapping(address => uint256) public userLastAudit;
    uint256 public totalAuditsExecuted;

    uint256 public scanFee;
    address public immutable deployer;
    uint256 public immutable deployedBlock;

    error Unauthorized();
    error InvalidAddress();
    error InsufficientFee();

    modifier onlyDeployer() {
        if (msg.sender != deployer) revert Unauthorized();
        _;
    }

    constructor() {
        deployer = msg.sender;
        deployedBlock = block.number;
        scanFee = 0.0001 ether; // 0.0001 BOT
    }

    /**
     * @notice Execute an on-chain security audit scan for a target wallet
     * @param targetWallet The wallet to audit
     */
    function executeAuditScan(address targetWallet) external payable {
        if (msg.value < scanFee) revert InsufficientFee();
        if (targetWallet == address(0)) revert InvalidAddress();

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
     * @param token Address of token contract on BOT Chain
     * @param maxAllowedLimit Maximum tolerated allowance
     * @param isMonitored Whether this token is actively watched
     */
    function configureTokenRule(
        address token,
        uint256 maxAllowedLimit,
        bool isMonitored
    ) external {
        if (token == address(0)) revert InvalidAddress();

        userTokenRules[msg.sender][token] = UserRule({
            isMonitored: isMonitored,
            maxAllowedLimit: maxAllowedLimit,
            lastUpdated: block.timestamp
        });

        emit MonitoringRuleConfigured(
            msg.sender,
            token,
            maxAllowedLimit,
            isMonitored,
            block.timestamp
        );
    }

    /**
     * @notice Mark a spender app as trusted or untrusted
     * @param spender Address of app contract
     * @param isTrusted Whether the user trusts this contract
     * @param protocolName Descriptive label
     */
    function setSpenderTrust(
        address spender,
        bool isTrusted,
        string calldata protocolName
    ) external {
        if (spender == address(0)) revert InvalidAddress();

        userSpenderTrust[msg.sender][spender] = SpenderInfo({
            isTrusted: isTrusted,
            protocolName: protocolName,
            addedAt: block.timestamp
        });

        emit SpenderTrustUpdated(
            msg.sender,
            spender,
            isTrusted,
            protocolName,
            block.timestamp
        );
    }
}
