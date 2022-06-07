import { ethers } from 'hardhat';
import { Contract, utils } from 'ethers';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BridgeBSC, IntiToken } from '../typechain-types';
import { mockInti } from './mocks/mockInti';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';

describe('Bridge from BSC', function () {
  let owner: SignerWithAddress,
    admin: SignerWithAddress,
    relayer: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    charlie: SignerWithAddress;

  let inti: IntiToken;
  let weth;
  let pair;
  let bridgeBsc: BridgeBSC;

  before(async function () {
    [owner, admin, relayer, alice, bob, charlie] = await ethers.getSigners();
    // --- ETH
    const { inti: _inti, weth: _weth } = await mockInti({ owner });
    inti = _inti;
    weth = _weth;

    // -- check LP tokens
    const pairAdress = await inti.uniswapV2Pair();
    const compiledUniswapPair = require('@uniswap/v2-periphery/build/IUniswapV2Pair.json');

    pair = new Contract(pairAdress, compiledUniswapPair.abi).connect(owner);

    // --- deploy bridge
    const BridgeBSC = await ethers.getContractFactory('BridgeBSC');
    bridgeBsc = await BridgeBSC.deploy(relayer.address, inti.address);
    await bridgeBsc.deployed();

    await inti.setBridge(bridgeBsc.address);
  });

  it('initialise INTI()', async () => {
    // send alice 100_000 INTI
    const amount = utils.parseUnits('100000', 9);
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, amount, 'some-id');
    expect(await inti.balanceOf(alice.address)).to.equal(amount);
  });

  it('initialise WETH()', async () => {
    // send alice 10 WETH
    const amount = utils.parseEther('10');

    await weth.connect(alice).approve(alice.address, amount);
    await weth.connect(alice).deposit({ value: amount }); // Convert ETH to WETH

    const wethBalance = await weth.balanceOf(alice.address);
    expect(wethBalance).to.equal(amount);
  });

  it('enable swapAndLiquify', async () => {
    await inti.connect(owner).setSwapAndLiquifyEnabled(false);
    expect(await inti.swapAndLiquifyEnabled()).to.equal(false);
  });

  it('exclude relayer from fees', async () => {
    await inti.connect(owner).excludeFromFee(relayer.address);
  });

  it('add liquidity', async () => {
    // --- initial
    const intiLiquidity = utils.parseUnits('100000', 9);
    const wethLiquidity = utils.parseEther('10');

    const uniswapRouterAddress = await inti.uniswapV2Router();
    const router = new Contract(uniswapRouterAddress, UniswapV2Router.abi);

    // --- approve liq
    await inti.connect(alice).approve(router.address, intiLiquidity);
    await weth.connect(alice).approve(router.address, wethLiquidity);

    console.log('Alice LP - BEFORE - addLiquidityETH()', await pair.balanceOf(alice.address).then((o) => o.toString()));

    await router.connect(alice).addLiquidityETH(
      inti.address,
      intiLiquidity,
      0,
      0,
      alice.address,
      DateTime.local().plus({ days: 1 }).toMillis(), // unix date 24h into the future
      {
        value: wethLiquidity,
      },
    );

    console.log('Alice LP - AFTER - addLiquidityETH()', await pair.balanceOf(alice.address).then((o) => o.toString()));
  });

  it('enable swapAndLiquify', async () => {
    await inti.connect(owner).setSwapAndLiquifyEnabled(true);
    expect(await inti.swapAndLiquifyEnabled()).to.equal(true);
  });

  it('adds liq as expected', async () => {
    // bob bridges 100k INTI x 5
    const amount = utils.parseUnits('100000', 9);
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'bob-txn-1');
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'bob-txn-2');
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'bob-txn-3');
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'bob-txn-4');
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'bob-txn-5');

    console.log('----- BEFORE');
    console.log('Alice balance:', await inti.balanceOf(alice.address).then((o) => o.toString()));
    console.log('Bob balance:', await inti.balanceOf(bob.address).then((o) => o.toString()));
    console.log('Charlie balance:', await inti.balanceOf(charlie.address).then((o) => o.toString()));
    console.log('Owner LP', await pair.balanceOf(owner.address).then((o) => o.toString()));

    // transfer charlie 250k INTI
    // !!! this should trigger adding liquidity to pool
    // !!! should grant LP tokens to the contract owner
    const transferAmount = utils.parseUnits('250000', 9);
    await inti.connect(bob).approve(charlie.address, transferAmount);
    await inti.connect(bob).transfer(charlie.address, transferAmount);

    console.log('----- AFTER');
    console.log('Alice balance:', await inti.balanceOf(alice.address).then((o) => o.toString()));
    console.log('Bob balance:', await inti.balanceOf(bob.address).then((o) => o.toString()));
    console.log('Charlie balance:', await inti.balanceOf(charlie.address).then((o) => o.toString()));
    console.log('Owner LP', await pair.balanceOf(owner.address).then((o) => o.toString()));
  });

  it('charlie adds 4x liquidity', async () => {
    // send charlie 400_000 INTI
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(charlie.address, utils.parseUnits('400000', 9), 'some-id');

    // charlie wrap 40 ETH
    const amount = utils.parseEther('40');
    await weth.connect(charlie).approve(charlie.address, amount);
    await weth.connect(charlie).deposit({ value: amount }); // Convert ETH to WETH

    // --- initial
    const intiLiquidity = utils.parseUnits('400000', 9);
    const wethLiquidity = utils.parseEther('40');

    const uniswapRouterAddress = await inti.uniswapV2Router();
    const router = new Contract(uniswapRouterAddress, UniswapV2Router.abi);

    // --- approve liq
    await inti.connect(charlie).approve(router.address, intiLiquidity);
    await weth.connect(charlie).approve(router.address, wethLiquidity);

    await router.connect(charlie).addLiquidityETH(
      inti.address,
      intiLiquidity,
      0,
      0,
      charlie.address,
      DateTime.local().plus({ days: 1 }).toMillis(), // unix date 24h into the future
      {
        value: wethLiquidity,
      },
    );

    console.log('-----');
    console.log(`Alice LP \n`, await pair.balanceOf(alice.address).then((o) => o.toString()));
    console.log(`Charlie LP \n`, await pair.balanceOf(charlie.address).then((o) => o.toString()));
    console.log(`Total supply \n`, await inti.totalSupply().then((o) => o.toString()));
  });
});
