import { utils } from 'ethers';
import { task } from 'hardhat/config'; // import function
import { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * @usage yarn hardhat eth:inti:check-balance --network eth
 */
task('eth:inti:check-balance', 'Check relayer roles').setAction(async (args, hre: HardhatRuntimeEnvironment) => {
  const _artifact = await hre.deployments.getArtifact('IntiToken');

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
      const _token = await new hre.ethers.Contract('0xC7Db3C3dc0FB5DAd72bA5bc7EE48d40941C40cad', _artifact.abi, owner);

      const totalSupply = await _token.totalSupply();

      console.log('UniswapPair:', await _token.uniswapV2Pair());
      console.log('tradingEnabled', await _token.tradingEnabled());
      console.log('swapAndLiquifyEnabled', await _token.swapAndLiquifyEnabled());
      console.log('numTokensSellToAddToLiquidity', await _token.numTokensSellToAddToLiquidity());
      console.log('totalSupply', totalSupply);
      // console.log(await _token.balanceOf('0x6837047F46Da1d5d9A79846b25810b92adF456F6')); // AA
      // console.log(await _token.balanceOf('0x14709895252ab4dd2d9be185628b4d91ea5064cf	')); // MH
      break;
    default:
      console.log(`NO-OP for [chain:${chainId}]`);
      break;
  }
});
