import { ethers } from 'hardhat';
import { deployContract } from 'ethereum-waffle';

import UniswapV2Factory from '@uniswap/v2-core/build/UniswapV2Factory.json';
import UniswapV2Router from '@uniswap/v2-periphery/build/UniswapV2Router02.json';

import { SAFEROCKET } from '../../typechain-types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export const mockSaferocket = async ({ owner }: { owner: SignerWithAddress }): Promise<SAFEROCKET> => {
  // --- ERC20Mock / WBNB
  const MockERC20Token = await ethers.getContractFactory('MockERC20Token', owner);
  const bnb = await MockERC20Token.deploy('Wrapped BNB (mocked)', 'WBNB', '10000000000');
  await bnb.deployed();
  console.log('BNB:', bnb.address);

  const uniswapFactory = await deployContract(owner, UniswapV2Factory, [owner.address]);
  await uniswapFactory.deployed();
  console.log('Uniswap Factory:', uniswapFactory.address);

  const uniswapRouter = await deployContract(owner, UniswapV2Router, [uniswapFactory.address, bnb.address]);
  await uniswapRouter.deployed();
  console.log('Uniswap Router:', uniswapRouter.address);

  const SAFEROCKET = await ethers.getContractFactory('SAFEROCKET');

  const saferocket = await SAFEROCKET.deploy(uniswapRouter.address);
  await saferocket.deployed();

  // --- normalise
  await saferocket.enableTrading();

  return saferocket;
};
