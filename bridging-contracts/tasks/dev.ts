import { green } from 'chalk';
import { task } from 'hardhat/config'; // import function
import { HardhatRuntimeEnvironment } from 'hardhat/types';

/**
 * @usage yarn hardhat reset --network localhost
 */
task('reset', 'Reset local blockchain').setAction(async (_args, hre: HardhatRuntimeEnvironment) => {
  // Reset the chain
  await hre.network.provider.send('hardhat_reset');
  console.log(green('---> Reset local blockchain'));
});
