import { ethers } from 'hardhat';
import { utils } from 'ethers';
import { expect } from 'chai';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { mockInti } from './mocks/mockInti';

describe('Intimate (INTI)', function () {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let charlie: SignerWithAddress;

  let inti;

  before(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();
    const { inti: _inti } = await mockInti({ owner });
    inti = _inti;
  });

  it('deploys with the correct owner', async function () {
    expect(await inti.owner()).to.equal(owner.address);
  });

  it('has an intial totalSupply() of zero', async function () {
    expect(await inti.totalSupply()).to.eql(utils.parseUnits('0', 9));
    const tSupply = await inti.totalSupply();
    expect(await inti.balanceOf(alice.address)).to.eql(utils.parseUnits('0', 9));
  });

  describe('mint and transfer', () => {
    it('mints tokens', async function () {
      // mint 1000 INTI to alice
      const amount = utils.parseUnits('1000', 9);
      await inti.mintAndTransfer(alice.address, amount);
      expect(await inti.balanceOf(alice.address)).to.equal(amount);
    });

    it('increments totalSupply() as expected', async () => {
      expect(await inti.totalSupply()).to.eql(utils.parseUnits('1000', 9));
    });

    it('alice can transfer to bob', async function () {
      // --- disable swapAndLiquify
      await inti.connect(owner).setSwapAndLiquifyEnabled(false);

      // --- starting balance
      const aliceStartBalance = utils.parseUnits('1000', 9);
      expect(await inti.balanceOf(alice.address)).to.equal(aliceStartBalance);

      // --- [txn1] send to bob
      const txn1 = utils.parseUnits('100', 9);
      await inti.connect(alice).transfer(bob.address, txn1);

      // --- [txn2] send to charlie
      const txn2 = utils.parseUnits('500', 9);
      await inti.connect(alice).transfer(charlie.address, txn2);

      // const alice_bal = await inti.balanceOf(alice.address);
      // console.log('Alice balance:', alice_bal.toString());

      // const bob_bal = await inti.balanceOf(bob.address);
      // console.log('Bob Balance:', bob_bal.toString());
    });
  });

  describe('reflections', () => {
    it('transfers work correctly when reflections are disabled', async function () {
      // MW ----- excluded fee mode -------------
      await inti.connect(owner).excludeFromFee(alice.address);
      await inti.connect(owner).excludeFromFee(bob.address);

      const txn2 = utils.parseUnits('100', 9);
      await inti.connect(alice).transfer(bob.address, txn2);

      const alice_bal = await inti.balanceOf(alice.address);
      console.log('Alice balance:', alice_bal.toString());

      const bob_bal = await inti.balanceOf(bob.address);
      console.log('Bob Balance:', bob_bal.toString());
    });

    it('no fees are collected when reflections are disabled', async function () {
      await inti.connect(owner).excludeFromFee(charlie.address);

      const txn2 = utils.parseUnits('100', 9);
      await inti.connect(alice).transfer(charlie.address, txn2);

      const alice_bal = await inti.balanceOf(alice.address);
      console.log('Alice balance:', alice_bal.toString());

      const charlie_bal = await inti.balanceOf(charlie.address);
      console.log('Charlie Balance:', charlie_bal.toString());
    });
  });
});
