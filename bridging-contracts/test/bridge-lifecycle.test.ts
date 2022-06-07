import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { mockInti } from './mocks/mockInti';
import { mockSaferocket } from './mocks/mockSaferocket';

const TRANSFER_UUID = 'some-transfer-id';
const LOCKED_TOKENS = '90000000000450';

describe('Bridge from BSC', function () {
  let owner: SignerWithAddress, relayer: SignerWithAddress, alice: SignerWithAddress, bob: SignerWithAddress;

  let saferocket;
  let bridgeEth;
  let inti;
  let bridgeBsc;

  before(async function () {
    [owner, , relayer, alice, bob] = await ethers.getSigners();

    // --- BSC side
    saferocket = await mockSaferocket({ owner });

    const BridgeETH = await ethers.getContractFactory('BridgeETH');
    bridgeEth = await BridgeETH.deploy(relayer.address, saferocket.address);

    // --- ETH side
    const { inti: _inti } = await mockInti({ owner });
    inti = _inti;

    const BridgeBSC = await ethers.getContractFactory('BridgeBSC');
    bridgeBsc = await BridgeBSC.deploy(relayer.address, inti.address);
    await bridgeBsc.deployed();
  });

  it('BSC — lockTokens()', async () => {
    // BSC - send 100k PRT to alice
    const amount = utils.parseUnits('100000', 9);
    await saferocket.transfer(alice.address, amount);

    // --- approve bridge
    await saferocket.connect(alice).approve(bridgeEth.address, amount);

    // --- LockTokens(address,uint256,string)
    await expect(bridgeEth.connect(alice).lockTokens(amount, TRANSFER_UUID))
      .to.emit(bridgeEth, 'LockTokens')
      .withArgs(alice.address, LOCKED_TOKENS, TRANSFER_UUID);
  });

  it('BSC — lockedTokens() is correct', async () => {
    const lockedTokens = await bridgeEth.lockedTokens();
    expect(lockedTokens).to.equal(LOCKED_TOKENS);
  });

  it('ETH — bridgeMintAndTransfer()', async () => {
    await inti.setBridge(bridgeBsc.address);
    await expect(bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, LOCKED_TOKENS, TRANSFER_UUID))
      // --- BridgeMintAndTransfer(address,uint256,string)
      .to.emit(bridgeBsc, 'BridgeMintAndTransfer')
      .withArgs(alice.address, LOCKED_TOKENS, TRANSFER_UUID);
  });

  it('ETH — totalSupply()', async () => {
    const totalSupply = await inti.totalSupply();
    await expect(totalSupply).to.equal(LOCKED_TOKENS);
  });
});
