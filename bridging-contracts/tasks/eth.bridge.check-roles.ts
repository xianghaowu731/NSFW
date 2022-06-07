import { utils } from 'ethers';
import { task } from 'hardhat/config'; // import function
import { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * @usage yarn hardhat eth:bridge:check-roles --network eth
 */
task('eth:bridge:check-roles', 'Check relayer roles').setAction(async (args, hre: HardhatRuntimeEnvironment) => {
  const _artifact = await hre.deployments.getArtifact('BridgeBSC');

  const [owner] = await hre.ethers.getSigners();
  const chainId = await hre.getChainId();

  switch (chainId) {
    // local hardhat node
    case '31337':
    // rinkeby
    case '4':
      // await _token.setBridge(args.bridge);
      break;
    case '1':
      // eth/BridgeBSC.sol
      const _token = await new hre.ethers.Contract('0x2fE16756b7f78eEeFf6219cEF130B9Da7fc381d8', _artifact.abi, owner);

      const deployerHasRole = await _token.hasRole(
        utils.keccak256(Buffer.from('RELAYER_ROLE')),
        '0x9f2806bA75d0164FD86d84eC8fC438e4868B4bf1', // deployer
      );
      const relayerHasRole = await _token.hasRole(
        utils.keccak256(Buffer.from('RELAYER_ROLE')),
        '0x7d12Df7A8693DA77FD89f70435AbA323Af8Ff421', // relayer
      );

      console.log(`deployerHasRole[RELAYER_ROLE]: ${deployerHasRole}`);
      console.log(`relayerHasRole[RELAYER_ROLE]: ${relayerHasRole}`);
      console.log('fin.');

      break;
    default:
      console.log(`NO-OP for [chain:${chainId}]`);
      break;
  }
});
