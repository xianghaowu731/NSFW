import { task } from 'hardhat/config'; // import function
import { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * @usage yarn hardhat inti:set-bridge --network rinkeby
 * @usage yarn hardhat inti:set-bridge --network eth
 */
task('inti:set-bridge', 'Set the Bridge')
  .addParam('name', 'Contract', 'IntiToken')
  .addParam('token', 'Intimate token address', '0xC7Db3C3dc0FB5DAd72bA5bc7EE48d40941C40cad')
  .addParam('bridge', 'Bridge address', '0x2fE16756b7f78eEeFf6219cEF130B9Da7fc381d8')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const _artifact = await hre.deployments.getArtifact(args.name);

    const [owner] = await hre.ethers.getSigners();
    const chainId = await hre.getChainId();
    const _token = await new hre.ethers.Contract(args.token, _artifact.abi, owner);

    switch (chainId) {
      // local hardhat node
      case '31337':
      // rinkeby
      case '4':
        // await _token.setBridge(args.bridge);
        break;
      case '1':
        await _token.setBridge(args.bridge);
        break;
      default:
        console.log(`NO-OP for [chain:${chainId}]`);
        break;
    }
  });
