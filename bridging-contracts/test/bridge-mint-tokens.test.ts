import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { mockInti } from './mocks/mockInti';

const ROLE = utils.keccak256(Buffer.from('RELAYER_ROLE'));

describe('Bridge from BSC', function () {
  let owner: SignerWithAddress,
    relayer: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    cali: SignerWithAddress,
    devis: SignerWithAddress,
    elva: SignerWithAddress;

  // contracts
  let inti;
  let bridgeBsc;

  before(async function () {
    [owner, , relayer, alice, bob, cali, devis, elva] = await ethers.getSigners();

    const { inti: _inti } = await mockInti({ owner });
    inti = _inti;

    const BridgeBSC = await ethers.getContractFactory('BridgeBSC');
    bridgeBsc = await BridgeBSC.deploy(relayer.address, inti.address);
    await bridgeBsc.deployed();

    // --- set Bridge into INTI
    await inti.connect(owner).setBridge(bridgeBsc.address);

    // --- grant relayer
    await bridgeBsc.connect(owner).grantRole(ROLE, relayer.address);
    expect(await bridgeBsc.connect(owner).hasRole(ROLE, relayer.address)).to.equal(true);
  });

  describe('ETH', () => {
    it('allows the [bridge] to mint INTI to [alice,bob]', async () => {
      // mint 50k INTI to alice, bob
      const amount = utils.parseUnits('50000', 9);

      await bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, amount, 'a-txn-id');
      await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'b-txn-id');
    });

    it('mint 100k INTI to 5 accounts x 25', async () => {
      for await (const index of [...Array(25).keys()]) {
        // mint 100k INTI to 5 accounts
        const amount = utils.parseUnits('100000', 9);

        await bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, amount, 'alice-txn-id');
        await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'bob-txn-id');
        await bridgeBsc.connect(relayer).bridgeMintAndTransfer(cali.address, amount, 'cali-txn-id');
        await bridgeBsc.connect(relayer).bridgeMintAndTransfer(devis.address, amount, 'devis-txn-id');
        await bridgeBsc.connect(relayer).bridgeMintAndTransfer(elva.address, amount, 'elva-txn-id');

        console.log(`--------- Iteration ${index}`);
        console.log('A: balanceOf()', await inti.balanceOf(alice.address).then((o) => o.toString()));
        console.log('B: balanceOf()', await inti.balanceOf(bob.address).then((o) => o.toString()));
        console.log('C: balanceOf()', await inti.balanceOf(cali.address).then((o) => o.toString()));
        console.log('D: balanceOf()', await inti.balanceOf(devis.address).then((o) => o.toString()));
        console.log('E: balanceOf()', await inti.balanceOf(elva.address).then((o) => o.toString()));
      }
    });

    it('reports the correct totalSupply()', async () => {
      const supplyA = utils.parseUnits('50000', 9).mul(2);
      const supplyB = utils.parseUnits('100000', 9).mul(5).mul(25);
      expect(await inti.totalSupply()).to.equal(supplyA.add(supplyB));
    });

    it('bob is unable mint INTI', async () => {
      const mintAmt = utils.parseUnits('1000', 9);
      await expect(inti.mintAndTransfer(bob.address, mintAmt)).to.be.revertedWith("sender doesn't have bridge role");
    });

    it('owner is unable mint INTI', async () => {
      const mintAmt = utils.parseUnits('1000', 9);
      await expect(
        bridgeBsc.connect(relayer).bridgeMintAndTransfer(owner.address, mintAmt, 'some-txn-id'),
      ).to.be.revertedWith('Owner is unable mint INTI');
    });

    it('relayer is unable mint INTI', async () => {
      const mintAmt = utils.parseUnits('1000', 9);
      await expect(
        bridgeBsc.connect(relayer).bridgeMintAndTransfer(relayer.address, mintAmt, 'some-txn-id'),
      ).to.be.revertedWith('Relayers are unable mint INTI');
    });

    it('requires mints > 0', async () => {
      const mintAmt = utils.parseUnits('0', 9);
      await expect(
        bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, mintAmt, 'some-txn-id'),
      ).to.be.revertedWith('Amount is zero');
    });

    it('increases INTI totalSupply() on mintAndTransfer()', async () => {
      const beforeSupply = await inti.totalSupply();

      // --- mint 100k
      const mintTokens = utils.parseUnits('100000', 9);
      await bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, mintTokens, 'some-txn-id');

      const totalSupply = await inti.totalSupply();
      expect(totalSupply).to.equal(beforeSupply.add(mintTokens));

      console.log('INTI.totalSupply() BEFORE\n', beforeSupply.toString());
      console.log('INTI.totalSupply() AFTER\n', totalSupply.toString());
    });

    it('cannot mint more than the MAX supply', async () => {
      const mintAmt = utils.parseUnits('500000000000000', 9);
      await expect(
        bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, mintAmt, 'some-txn-id'),
      ).to.be.revertedWith('Mint amount is exceeded');
    });
  });
});
