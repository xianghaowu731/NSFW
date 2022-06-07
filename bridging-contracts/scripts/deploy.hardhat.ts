import { green, underline, yellow } from 'chalk';
import { ethers } from 'hardhat';
import { mockInti } from '../test/mocks/mockInti';
import { mockSaferocket } from '../test/mocks/mockSaferocket';

/**
 * @usage yarn hardhat node
 * @usage yarn hardhat run --network localhost scripts/deploy.hardhat.ts
 */
async function main() {
  const [deployer] = await ethers.getSigners();

  // --- BSC
  console.log(`\n ${yellow(underline('BSC'))}`);
  const saferocket = await mockSaferocket({ owner: deployer });

  const BridgeETH = await ethers.getContractFactory('BridgeETH');
  const bscBridge = await BridgeETH.deploy(deployer.address, saferocket.address);
  await bscBridge.deployed();
  console.log('BSC->ETH Bridge:', bscBridge.address);
  console.log('SAFEROCKET:', saferocket.address);

  // --- ETH
  console.log(`\n ${green(underline('ETH'))}`);
  const inti = await mockInti({ owner: deployer });

  const BridgeBSC = await ethers.getContractFactory('BridgeBSC');
  const ethBridge = await BridgeBSC.deploy(deployer.address, inti.address);
  await ethBridge.deployed();
  console.log('ETH->BSC Bridge', ethBridge.address);
  console.log('INTI:', inti.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
