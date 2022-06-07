import { Contract } from 'ethers';
import { task } from 'hardhat/config'; // import function
import { HardhatRuntimeEnvironment } from 'hardhat/types';

type Args = {
  token: string;
  name: 'SAFEROCKET';
  recipient: string;
  amount: string;
  decimals: string;
};

/**
 * @usage yarn hardhat send:inti --network localhost
 */
task('send:inti', 'Fund accounts')
  .addParam('token', 'Token contract address', '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318')
  .addParam('name', 'Contract', 'IntiToken')
  .addParam('recipient', 'Recipient of token', '0x03Ddfb0FC105b1706784393827148564578b716b')
  .addParam('amount', 'Amount of tokens to send', '100000')
  .addParam('decimals', 'Recipient of token', '9')
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const _artifact = await hre.deployments.getArtifact(args.name);

    const [owner] = await hre.ethers.getSigners();
    const chainId = await hre.getChainId();
    const _contract = await new hre.ethers.Contract(args.token, _artifact.abi, owner);

    switch (chainId) {
      // local hardhat node
      case '31337':
        // send 100k to developers metamask
        const _amount = hre.ethers.utils.parseUnits(args.amount, args.decimals);
        await _contract.transfer(args.recipient, _amount);

        console.log(`Sent ${_amount.toString()} ${args.name} to [${args.recipient}]`);
        break;
      default:
        console.log(`NO-OP for [chain:${chainId}]`);
        break;
    }
  });
