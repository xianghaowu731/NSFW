import { utils } from 'ethers';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as weth9 from 'canonical-weth/build/contracts/WETH9.json';

export const mockInti = async ({ owner }: { owner: SignerWithAddress }) => {
  // --- canonical-weth
  const weth = await new ethers.ContractFactory(weth9.abi, weth9.bytecode, owner).deploy();
  await weth.deployed();

  console.log('WETH:', weth.address);
  const ownerBalance = await weth.balanceOf(owner.address);
  console.log('WETH balance:', utils.formatEther(ownerBalance));

  // --- uniswap factory
  const compiledUniswapFactory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
  const uniswapFactory = await new ethers.ContractFactory(
    compiledUniswapFactory.interface,
    compiledUniswapFactory.bytecode,
    owner,
  ).deploy(await owner.getAddress());
  await uniswapFactory.deployed();
  console.log('Uniswap Factory:', uniswapFactory.address);

  // --- uniswap router
  const compiledUniswapRouter = require('@uniswap/v2-periphery/build/UniswapV2Router02');
  const uniswapRouter = await new ethers.ContractFactory(
    compiledUniswapRouter.abi,
    compiledUniswapRouter.bytecode,
    owner,
  ).deploy(uniswapFactory.address, weth.address);
  await uniswapRouter.deployed();
  console.log('Uniswap Router:', uniswapRouter.address);

  const IntiToken = await ethers.getContractFactory('IntiToken');
  const inti = await IntiToken.deploy(uniswapRouter.address);
  await inti.deployed();

  console.log('Uniswap Pair:', await inti.uniswapV2Pair());

  await inti.enableTrading();

  return { inti, weth, uniswapRouter };
};
