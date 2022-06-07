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
 * @usage yarn hardhat send:pornrocket --network localhost
 * @usage yarn hardhat send:pornrocket --network bsc-testnet
 */
task('send:pornrocket', 'Fund accounts')
  .addParam('token', 'Token contract address', '0xd88C6895d90a719f7f9cCF4debc64EAc55a9DA88')
  .addParam('name', 'Contract', 'SAFEROCKET')
  .addParam('recipient', 'Recipient of token', '0xB4306dCAF43edA06A3fF362a9f571BAD3Eb69f5a')
  .addParam('amount', 'Amount of tokens to send', '10000000')
  .addParam('decimals', 'Recipient of token', '9')
  .setAction(async (args: Args, hre: HardhatRuntimeEnvironment) => {
    const _artifact = await hre.deployments.getArtifact(args.name);

    const [owner] = await hre.ethers.getSigners();
    const chainId = await hre.getChainId();
    const _contract = await new hre.ethers.Contract(args.token, _artifact.abi, owner);

    switch (chainId) {
      // local hardhat node
      case '31337':
      // bsc-testnet
      case '97':
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
