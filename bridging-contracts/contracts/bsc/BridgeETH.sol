// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./SAFEROCKET.sol";

import "hardhat/console.sol";

/**
 * @notice Bridge to Ethereum from BSC
 */
contract BridgeETH is Ownable, Pausable, AccessControl {
    /// @dev Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @dev PORNROCKET token address
    address public token;

    /// -- Events
    event Transfer(address, uint256);
    event ReleaseTokens(address, uint256, string);
    event LockTokens(address, uint256, string);

    /// -- Modifers
    modifier isGreaterThanZero(uint256 value) {
        require(value > 0, "Amount is zero");
        _;
    }

    modifier onlyRelayer() {
        require(hasRole(RELAYER_ROLE, msg.sender), "sender is not Relayer");
        _;
    }

    /// @dev Initalise ETH bridge
    ///
    /// @param _relayer Address of Relayer multisig
    /// @param _token Address of token
    ///
    constructor(address _relayer, address _token) {
        require(_relayer != address(0), "Invalid relayer address");
        require(_token != address(0), "Invalid token address");

        _setupRole(ADMIN_ROLE, msg.sender);
        _setRoleAdmin(RELAYER_ROLE, ADMIN_ROLE);

        grantRole(RELAYER_ROLE, _relayer);

        token = _token;
    }

    /// @dev Lock tokens on the bridge
    ///
    /// @param _amount Amount of tokens to lock
    /// @param _transferId A unique string to track x-chain transfers
    ///
    function lockTokens(uint256 _amount, string memory _transferId) public whenNotPaused isGreaterThanZero(_amount) {
        require(_amount > 0, "Amount is zero");

        IERC20 Token = IERC20(token);
        uint256 balance = Token.balanceOf(msg.sender);
        require(balance >= _amount, "Insufficient balance");

        uint256 allowance = Token.allowance(msg.sender, address(this));
        require(allowance >= _amount, "Transfer amount exceeds allowance");

        uint256 _balanceBefore = Token.balanceOf(address(this));
        Token.safeTransferFrom(msg.sender, address(this), _amount);
        uint256 _balanceAfter = Token.balanceOf(address(this));

        emit LockTokens(msg.sender, _balanceAfter.sub(_balanceBefore), _transferId);
    }

    /// @dev Total locked tokens on the contract
    function lockedTokens() public view returns (uint256) {
        IERC20 Token = IERC20(token);
        uint256 balance = Token.balanceOf(address(this));
        return balance;
    }
}
