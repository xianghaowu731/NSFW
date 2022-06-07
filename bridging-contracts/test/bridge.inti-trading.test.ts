import { ethers } from 'hardhat';
import { Contract, Signer, utils } from 'ethers';
import { expect } from 'chai';
import { DateTime } from 'luxon';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { mockInti } from './mocks/mockInti';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';

const ADD_LIQUIDITY_TXNS = [
  ['17166200000', '0.136'],
  ['12627767296', '0.1'],
  ['63138836482', '0.5'],
  ['126277672964', '1'],
  ['189416509446', '1.5'],
  ['378833018891', '3'],
];

describe('trading INTI', function () {
  let owner: SignerWithAddress,
    marketing: SignerWithAddress,
    relayer: SignerWithAddress,
    alice: SignerWithAddress,
    bob: SignerWithAddress,
    charlie: SignerWithAddress;

  let inti;
  let weth;
  let pair;
  let bridgeBsc;
  let router;

  before(async function () {
    [owner, marketing, relayer, alice, bob, charlie] = await ethers.getSigners();
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

    // --- setup router
    const uniswapRouterAddress = await inti.uniswapV2Router();
    router = new Contract(uniswapRouterAddress, UniswapV2Router.abi);
  });

  it('disable swapAndLiquify', async () => {
    await inti.connect(owner).setSwapAndLiquifyEnabled(false);
    expect(await inti.swapAndLiquifyEnabled()).to.equal(false);
  });

  it('exclude [relayer, bridge] from fees', async () => {
    await inti.connect(owner).excludeFromFee(relayer.address);
    await inti.connect(owner).excludeFromFee(bridgeBsc.address);
  });

  it('pairs liquidity with marketing wallet', async () => {
    for await (const [tokens, eth] of ADD_LIQUIDITY_TXNS) {
      console.log('----');
      console.log('START:', [tokens, eth]);

      // send marketing X INTI
      const intiAmount = utils.parseUnits(tokens, 9);
      await bridgeBsc.connect(relayer).bridgeMintAndTransfer(marketing.address, intiAmount, 'pair-txn-id');

      // marketing wrap ETH -> WETH
      const ethAmount = utils.parseEther(eth);
      await weth.connect(marketing).approve(marketing.address, ethAmount);
      await weth.connect(marketing).deposit({ value: ethAmount });

      // --- approve liq
      await inti.connect(marketing).approve(router.address, intiAmount);
      await weth.connect(marketing).approve(router.address, ethAmount);

      // --- add liq
      await router.connect(marketing).addLiquidityETH(
        inti.address,
        intiAmount,
        0,
        0,
        marketing.address,
        DateTime.local().plus({ days: 1 }).toMillis(), // unix date 24h into the future
        {
          value: ethAmount,
        },
      );

      console.log('MRKT LP:', await pair.balanceOf(marketing.address).then((o) => o.toString()));
      console.log('INTI LP:', await pair.balanceOf(inti.address).then((o) => o.toString()));

      console.log('---- POOL DATA');
      const token0 = await pair.token0();
      const { reserve0, reserve1 } = await pair.getReserves();
      const poolLiq = await pair.totalSupply();
      console.log(`[${token0}:${reserve0.toString()}, 1:${reserve1.toString()}]`);
      console.log(`total pool LP tokens:`, poolLiq.toString());
    }
  });

  it('alice adds 50% liquidity', async () => {
    const liquidity = {
      inti: utils.parseUnits('0', 9),
      eth: utils.parseEther('0'),
    };
    // sum all txns
    for await (const [tokens, eth] of ADD_LIQUIDITY_TXNS) {
      const intiAmount = utils.parseUnits(tokens, 9);
      const ethAmount = utils.parseEther(eth);

      liquidity.inti = liquidity.inti.add(intiAmount);
      liquidity.eth = liquidity.eth.add(ethAmount);
    }

    // then divide by 2
    liquidity.inti.div(2);
    liquidity.eth.div(2);

    // send alice 50% INTI
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, liquidity.inti, 'some-id');
    // alice wrap 50% ETH
    await weth.connect(alice).approve(alice.address, liquidity.eth);
    await weth.connect(alice).deposit({ value: liquidity.eth }); // Convert ETH to WETH

    // --- approve liq
    await inti.connect(alice).approve(router.address, liquidity.inti);
    await weth.connect(alice).approve(router.address, liquidity.eth);

    await router.connect(alice).addLiquidityETH(
      inti.address,
      liquidity.inti,
      0,
      0,
      alice.address,
      DateTime.local().plus({ days: 1 }).toMillis(), // unix date 24h into the future
      {
        value: liquidity.eth,
      },
    );

    console.log('-----');
    console.log('MRKT INTI.balanceOf():', await inti.balanceOf(marketing.address).then((o) => o.toString()));
    console.log('MRKT LP:', await pair.balanceOf(marketing.address).then((o) => o.toString()));

    console.log('ERC20 INTI.balanceOf():', await inti.balanceOf(inti.address).then((o) => o.toString()));
    console.log('ERC20 LP:', await pair.balanceOf(inti.address).then((o) => o.toString()));

    console.log('ALICE INTI.balanceOf():', await inti.balanceOf(alice.address).then((o) => o.toString()));
    console.log(`ALICE LP:`, await pair.balanceOf(alice.address).then((o) => o.toString()));

    console.log('---- POOL DATA');
    const token0 = await pair.token0();
    const { reserve0, reserve1 } = await pair.getReserves();
    const poolLiq = await pair.totalSupply();
    console.log(`[${token0}:${reserve0.toString()}, 1:${reserve1.toString()}]`);
    console.log(`total pool LP tokens:`, poolLiq.toString());
  });

  it('enable swapAndLiquify', async () => {
    await inti.connect(owner).setSwapAndLiquifyEnabled(true);
    expect(await inti.swapAndLiquifyEnabled()).to.equal(true);
  });

  it('mints with swapAndLiquify enabled', async () => {
    // mint 50k INTI to alice, bob, charlie
    const amount = utils.parseUnits('50000', 9);
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(alice.address, amount, 'a-txn-id');
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(bob.address, amount, 'b-txn-id');
    await bridgeBsc.connect(relayer).bridgeMintAndTransfer(charlie.address, amount, 'c-txn-id');
  });

  it('reports balances correctly before trading', async () => {
    console.log('O: balanceOf()', await inti.balanceOf(inti.address).then((o) => o.toString()));
    console.log('M: balanceOf()', await inti.balanceOf(marketing.address).then((o) => o.toString()));
    console.log('A: balanceOf()', await inti.balanceOf(alice.address).then((o) => o.toString()));
    console.log('B: balanceOf()', await inti.balanceOf(bob.address).then((o) => o.toString()));
    console.log('C: balanceOf()', await inti.balanceOf(charlie.address).then((o) => o.toString()));
    console.log('INTI LP:', await pair.balanceOf(owner.address).then((o) => o.toString()));
    console.log('MRKT LP:', await pair.balanceOf(marketing.address).then((o) => o.toString()));
    console.log(`AICE LP:`, await pair.balanceOf(alice.address).then((o) => o.toString()));
  });

  it('allows purchases from the pool', async () => {
    const token0 = weth.address; // WETH
    const token1 = inti.address; // INTI
    const _pair = [token0, token1];

    const amountIn = ethers.utils.parseUnits('0.5', 'ether');

    // purchase 0.5 ETH with bob || charlie
    for await (const index of [...Array(10).keys()]) {
      // assign bob or charlie
      const signer = index % 2 == 0 ? bob : charlie;

      // Calculate amounts out
      const amounts = await router.connect(signer).getAmountsOut(amountIn, _pair);

      
      console.log('Reverse 0:', await pair.getReserves());
      // Calculate slippage tolerance
      const slippage = 10;
      const amountOutMin = amounts[1].sub(amounts[1].div(slippage));

      console.log('signer balance before:', await inti.balanceOf(signer.address).then((o) => o.toString()))
      const swapTxn = await router
        .connect(signer)
        .swapExactETHForTokens(amountOutMin, _pair, signer.address, Date.now() + 1000 * 60 * 10, {
          gasPrice: ethers.utils.parseUnits('50', 'gwei'),
          value: amountIn,
        });
      await swapTxn.wait();
      // console.log('Receipt : ', await swapTxn.wait());
      console.log('Swap amount :', amountIn.toString());
      console.log('Reverse 1:', await pair.getReserves());
      console.log('signer balance after:', await inti.balanceOf(signer.address).then((o) => o.toString()))

      console.log(`
        Swap
        ----------------
          ETH  : ${amountIn.toString()}
          INTI quoted: ${amountOutMin.toString()}
      `);

      console.log('O: balanceOf()', await inti.balanceOf(inti.address).then((o) => o.toString()));
      console.log('M: balanceOf()', await inti.balanceOf(marketing.address).then((o) => o.toString()));
      console.log('A: balanceOf()', await inti.balanceOf(alice.address).then((o) => o.toString()));
      console.log('B: balanceOf()', await inti.balanceOf(bob.address).then((o) => o.toString()));
      console.log('C: balanceOf()', await inti.balanceOf(charlie.address).then((o) => o.toString()));

      console.log('INTI LP:', await pair.balanceOf(owner.address).then((o) => o.toString()));
      console.log('MRKT LP:', await pair.balanceOf(marketing.address).then((o) => o.toString()));
      console.log(`AICE LP:`, await pair.balanceOf(alice.address).then((o) => o.toString()));

      
    }
    // END
    console.log(`ETH LP0:`, await ethers.provider.getBalance(inti.address).then((o) => o.toString()));
    const test_bal = await inti.balanceOf(inti.address);
    // const tx = await router.connect(alice).swapExactTokensForETHSupportingFeeOnTransferTokens(
    //     test_bal,
    //     0, // accept any amount of ETH
    //     [inti.address, weth.address],
    //     inti.address,
    //     Date.now() + 1000 * 60 * 10
    // );
    // const rc = await tx.wait();
    const txn_amount = ethers.utils.parseUnits('1000', 9);
    await inti.connect(alice).approve(bob.address, txn_amount);
    await inti.connect(alice).transfer(bob.address, txn_amount);
    // console.log(rc); 
    console.log(`ETH LP1:`, await ethers.provider.getBalance(inti.address).then((o) => o.toString()));

    
  });

  it('reports balances correctly after trading', async () => {
    console.log('O: balanceOf()', await inti.balanceOf(inti.address).then((o) => o.toString()));
    console.log('M: balanceOf()', await inti.balanceOf(marketing.address).then((o) => o.toString()));
    console.log('A: balanceOf()', await inti.balanceOf(alice.address).then((o) => o.toString()));
    console.log('B: balanceOf()', await inti.balanceOf(bob.address).then((o) => o.toString()));
    console.log('C: balanceOf()', await inti.balanceOf(charlie.address).then((o) => o.toString()));
    console.log('INTI LP:', await pair.balanceOf(owner.address).then((o) => o.toString()));
    console.log('MRKT LP:', await pair.balanceOf(marketing.address).then((o) => o.toString()));
    console.log(`AICE LP:`, await pair.balanceOf(alice.address).then((o) => o.toString()));


    

  });
});
