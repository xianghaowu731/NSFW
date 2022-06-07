// SPDX-License-Identifier: MIT

pragma solidity ^0.8.1;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./IntiToken.sol";

contract BridgeBSC is Ownable, Pausable, AccessControl {
    //
    /// @dev AccessControl roles
    //
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public token;

    // @dev Intimate token contract
    IntiToken inti;

    // --- Events
    event BridgeMintAndTransfer(address, uint256, string);
    event BridgeBurn(uint256, string);

    // --- Modifers
    modifier isGreaterThanZero(uint256 value) {
        require(value > 0, "Amount is zero");
        _;
    }

    modifier onlyRelayer() {
        require(hasRole(RELAYER_ROLE, msg.sender), "sender is not Relayer");
        _;
    }

    /// @dev Initalise BSC bridge
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

        inti = IntiToken(payable(_token));
    }

    /// @dev Mint tokens based on a lock from the bridge
    //
    /// @param _recipient Address to receive
    /// @param _amount {n} tokens to mint
    /// @param _transferId A unique string to track x-chain transfers
    ///
    function bridgeMintAndTransfer(
        address _recipient,
        uint256 _amount,
        string memory _transferId
    ) public onlyRelayer whenNotPaused isGreaterThanZero(_amount) {
        require(_recipient != inti.owner(), "Owner is unable mint INTI");
        require(hasRole(ADMIN_ROLE, _recipient) == false, "Admin is unable mint INTI");
        require(hasRole(RELAYER_ROLE, _recipient) == false, "Relayers are unable mint INTI");

        // floor the mint amount INTI totalSupply() is not fractionalised
        uint256 _decimal = 10**9;
        uint256 _flooredMintAmount = (_amount * _decimal) / _decimal;

        inti.mintAndTransfer(_recipient, _flooredMintAmount);

        emit BridgeMintAndTransfer(_recipient, _flooredMintAmount, _transferId);
    }
}
