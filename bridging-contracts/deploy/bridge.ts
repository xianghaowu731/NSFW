import { green, underline, yellow } from 'chalk';
import { mockInti } from '../test/mocks/mockInti';
import { mockSaferocket } from '../test/mocks/mockSaferocket';

import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

/**
 * @usage yarn hardhat deploy --network bsc-testnet
 * @usage yarn hardhat deploy --network rinkeby
 */
const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // code here
  const [deployer] = await hre.ethers.getSigners();

  // --- BSC (testnet)
  if (['bsc-testnet', 'localhost'].includes(hre.network.name)) {
    console.log(`\n ${yellow(underline('BSC'))}`);
    const saferocket = await mockSaferocket({ owner: deployer });
    const BridgeETH = await hre.ethers.getContractFactory('BridgeETH');
    const bscBridge = await BridgeETH.deploy(deployer.address, saferocket.address);
    await bscBridge.deployed();
    console.log('BSC->ETH Bridge:', bscBridge.address);
    console.log('SAFEROCKET:', saferocket.address);
  }

  // --- ETH (testnet)
  if (['rinkeby', 'localhost'].includes(hre.network.name)) {
    console.log(`\n ${green(underline('ETH'))}`);
    const inti = await mockInti({ owner: deployer });
    const BridgeBSC = await hre.ethers.getContractFactory('BridgeBSC');
    const ethBridge = await BridgeBSC.deploy(deployer.address, inti.address);
    await ethBridge.deployed();
    console.log('ETH->BSC Bridge', ethBridge.address);
    console.log('INTI:', inti.address);
  }

  // --- BSC (mainnet)
  if (['bsc'].includes(hre.network.name)) {
    console.log(`\n ${yellow(underline('BSC'))}`);
    const BridgeETH = await hre.ethers.getContractFactory('BridgeETH');
    const bscBridge = await BridgeETH.deploy(deployer.address, '0xcf9f991b14620f5ad144eec11f9bc7bf08987622');
    await bscBridge.deployed();
    console.log('BSC->ETH Bridge:', bscBridge.address);
  }

  // --- ETH (mainnet)
  if (['eth'].includes(hre.network.name)) {
    console.log(`\n ${green(underline('ETH'))}`);

    const IntiToken = await hre.ethers.getContractFactory('IntiToken');
    const inti = await IntiToken.deploy('0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
    await inti.deployed();
    await inti.enableTrading();

    const BridgeBSC = await hre.ethers.getContractFactory('BridgeBSC');
    const ethBridge = await BridgeBSC.deploy(deployer.address, inti.address);
    await ethBridge.deployed();
    console.log('ETH->BSC Bridge', ethBridge.address);
    console.log('INTI:', inti.address);
  }
};
export default func;
