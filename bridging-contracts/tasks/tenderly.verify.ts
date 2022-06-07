import { task } from 'hardhat/config';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

interface Info {
  name: string;
  address: string;
}

/**
 * @usage yarn hardhat tenderly:verify --network bsc-testnet
 * @usage yarn hardhat tenderly:verify --network rinkeby
 */
task('tenderly:verify', 'Verify contracts for dev').setAction(async (_args, hre: HardhatRuntimeEnvironment) => {
  const contracts: Info[] = [];
  const chainId = await hre.getChainId();

  switch (chainId) {
    // local hardhat node
    case '31337':
    // bsc-testnet
    case '97':
      contracts.push({
        name: 'BridgeETH',
        address: '0x7062e51E8F45d8C325ec1f8B14a16544bd73a4A8',
      });
      contracts.push({
        name: 'SAFEROCKET',
        address: '0xd88C6895d90a719f7f9cCF4debc64EAc55a9DA88',
      });
      break;
    // rinkeby
    case '4':
      contracts.push({
        name: 'BridgeBSC',
        address: '0xB083e52337B4b53E88e33aDB17fCCAbF56C6c10b',
      });
      contracts.push({
        name: 'IntiToken',
        address: '0x7aa5b7740947C62375ED162649932fA257EA275d',
      });
      break;
    default:
      console.log(`NO-OP for [chain:${chainId}]`);
      break;
  }

  await hre.tenderly.verify(...contracts);
});
