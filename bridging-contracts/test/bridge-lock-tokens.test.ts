import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { SAFEROCKET } from '../typechain-types';
import { mockSaferocket } from './mocks/mockSaferocket';
import { BridgeETH } from '../typechain-types/BridgeETH';

const DEFAULT_ADMIN_ROLE = ethers.utils.formatBytes32String('DEFAULT_ADMIN_ROLE');
const DEAD_ADDRESS = '0x0000000000000000000000000000000000000000000000000000000000000000';

describe('Bridge from BSC', function () {
  let owner: SignerWithAddress;
  let relayer: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;

  let saferocket: SAFEROCKET;
  let bridgeEth: BridgeETH;

  before(async function () {
    [owner, relayer, alice, bob] = await ethers.getSigners();

    console.log('Owner:', owner.address);

    saferocket = await mockSaferocket({ owner });

    // Exlude from fees to make calculations easier
    await saferocket.connect(owner).excludeFromFee(alice.address);
    await saferocket.connect(owner).excludeFromFee(bob.address);

    const BridgeETH = await ethers.getContractFactory('BridgeETH');
    bridgeEth = await BridgeETH.deploy(relayer.address, saferocket.address);
  });

  describe('AccessControl', () => {
    it('renounces DEFAULT_ADMIN_ROLE', async () => {
      expect(await bridgeEth.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(DEAD_ADDRESS);
    });

    it('sets the relayer role', async () => {
      const relayerRole = await bridgeEth.RELAYER_ROLE();
      expect(await bridgeEth.hasRole(relayerRole, relayer.address)).to.eql(true);
    });

    it('has the correct owner', async () => {
      expect(await bridgeEth.owner()).to.eql(owner.address);
    });
  });

  it('funds wallets as expected', async () => {
    // send 100k PRT to alice
    const amount = utils.parseUnits('100000', 9);
    await saferocket.transfer(alice.address, amount);

    const balance = await saferocket.balanceOf(alice.address);
    expect(balance).to.equal(amount);
  });

  it('requires approval to bridge', async () => {
    // attempt to bridge 50k
    const amount = utils.parseUnits('50000', 9);

    // --- not approved
    await expect(bridgeEth.connect(alice).lockTokens(amount, 'some-txn-id')).to.be.revertedWith(
      'Transfer amount exceeds allowance',
    );

    // > approve 50k
    await saferocket.connect(alice).approve(bridgeEth.address, amount);

    // --- not approved for 60k
    await expect(bridgeEth.connect(alice).lockTokens(utils.parseUnits('60000', 9), 'some-txn-id')).to.be.revertedWith(
      'Transfer amount exceeds allowance',
    );
  });

  it('locks tokens on the bridge', async () => {
    // alice -> lock 50k (prev approved)
    await saferocket.connect(owner).includeInFee(alice.address);
    const aliceLockAmount = utils.parseUnits('50000', 9);
    expect(await bridgeEth.connect(alice).lockTokens(aliceLockAmount, 'some-txn-id')).to.emit(bridgeEth, 'LockTokens');

    // bob -> lock 100k
    const bobLockAmount = utils.parseUnits('100000', 9);
    await saferocket.transfer(bob.address, utils.parseUnits('200000', 9));
    await saferocket.connect(bob).approve(bridgeEth.address, bobLockAmount);
    expect(await bridgeEth.connect(bob).lockTokens(bobLockAmount, 'some-txn-id')).to.emit(bridgeEth, 'LockTokens');
  });
});
