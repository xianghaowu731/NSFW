import { Injectable } from '@nestjs/common';
import { ethers, providers } from 'ethers';
import { TransferService } from './transfer.service';

import BridgeBSC from '../abi/bridge-bsc.json';
import BridgeETH from '../abi/bridge-eth.json';
import { env } from '../env';
import { Transfer } from './transfer.schema';

@Injectable()
export class BridgeService {
  private ethProvider = new providers.StaticJsonRpcProvider(env.ETH_RPC);
  private bscProvider = new providers.StaticJsonRpcProvider(env.BSC_RPC);

  // This is the BSC -> ETH  contract address
  private bridgeEth = env.BRIDGE_ETH;

  // This is the ETH -> BSC  contract address
  private bridgeBsc = env.BRIDGE_BSC;

  constructor(private transfers: TransferService) {}

  async getRelayerAddress() {
    const signer = new ethers.Wallet(env.RELAYER_PRIVATE_KEY);
    return signer.getAddress();
  }

  // Find transaction on the blockchain
  async populateSourceTxn(transfer: Transfer) {
    let source;
    switch (true) {
      case transfer.sourceNetwork === 'BSC' && transfer.destNetwork === 'ETH':
        source = await this.lockTokensTxn(transfer);
        break;
      default:
        throw new Error('Unable to populate source txn');
    }
    return this.transfers.updateSourceDetails(transfer, source);
  }

  async lockTokensTxn(transfer: Transfer) {
    const provider = this.bscProvider;
    const iface = new ethers.utils.Interface(BridgeETH);
    const txn = await provider.getTransactionReceipt(
      transfer.sourceTransactionHash,
    );
    const log = iface.parseLog(txn.logs[2]);

    console.log('[BSC] lockTokensTxn()', JSON.stringify(log, null, 2));

    return {
      sourceAddress: log.args[0],
      amount: log.args[1],
      nonce: log.args[2],
    };
  }

  async startTransfer(transfer: Transfer) {
    switch (true) {
      // BSC -> ETH
      case transfer.sourceNetwork === 'BSC' && transfer.destNetwork === 'ETH':
        console.log('Bridging from [BSC] -> [ETH]');
        const provider = this.ethProvider;
        const relayer = new ethers.Wallet(env.RELAYER_PRIVATE_KEY, provider);
        const bridge = new ethers.Contract(this.bridgeBsc, BridgeBSC);

        const destTxn = await bridge.connect(relayer).bridgeMintAndTransfer(
          transfer.sourceAddress, // Same address as the sender
          transfer.amount,
          `${transfer.nonce}`,
        );

        console.log('[ETH] bridgeMintAndTransfer()');
        console.log(destTxn);

        return this.transfers.updateDestDetails(transfer, destTxn);
      default:
        throw new Error('Unable to populate source txn');
    }
  }

  // async sendTokenToBSC(transferId) {
  //   const transfer = await this.transferService.findOne(transferId);
  //   console.log('sendTokenToBSC', transfer);
  //   try {
  //     const bridgeContract = new ethers.Contract(
  //       this.bsc_bridge_address,
  //       BridgeBSC,
  //       new ethers.Wallet(env.RELAYER_PRIVATE_KEY, this.bsc_provider),
  //     );
  //     const tx = await bridgeContract.transfer(
  //       transfer.address,
  //       transfer.amount,
  //     );
  //     const receipt = await tx.wait();
  //     transfer.transactionHashs.push(receipt.transactionHash);
  //     transfer.status = TransferStatus.finished;
  //     await this.transferService.update(transfer._id, transfer);
  //   } catch (err) {
  //     console.log(err);
  //     transfer.status = TransferStatus.failed;
  //   }
  // }

  // /**
  //  * Check INTI transactions to BSC Bridge
  //  * @returns
  //  */
  // @Interval(1000)
  // async checkBSCBlock() {
  //   const blockNumber = await this.bsc_provider.getBlockNumber();
  //   if (blockNumber <= this.lastBSCBlockNumber) return;
  //   this.lastBSCBlockNumber = blockNumber;
  //   const block = await this.bsc_provider.getBlock(blockNumber);

  //   if (block && block.transactions) {
  //     console.log(blockNumber, block.transactions.length);
  //     for (const txHash of block.transactions) {
  //       const txData = await this.bsc_provider.getTransaction(txHash);
  //       if (!txData || !txData.to) continue;

  //       const toAddress = txData.to.toString().toLowerCase();
  //       if (toAddress == this.bsc_bridge_address.toString().toLowerCase()) {
  //         const txReceipt = await this.bsc_provider.getTransactionReceipt(
  //           txHash,
  //         );

  //         const logs = txReceipt.logs;
  //         for (const log of logs) {
  //           const topics = log.topics;
  //           if (
  //             topics &&
  //             topics.length > 0 &&
  //             topics[0].toString().toLowerCase() ==
  //               '0xa37a1abec67a097377278e608d64ef956b67debf85d06fea4bec3e9d242ef024'
  //           ) {
  //             const result = ethers.utils.defaultAbiCoder.decode(
  //               ['address', 'uint256', 'string'],
  //               log.data,
  //             );
  //             if (result && result.length == 3) {
  //               const address = result[0];
  //               const amount = result[1].toString();
  //               const transferId = result[2];
  //               console.log(address, amount, transferId);

  //               const transfer = await this.transferService.findOne(transferId);
  //               if (
  //                 transfer &&
  //                 transfer.status == TransferStatus.waiting &&
  //                 address.toLowerCase() == transfer.address.toLowerCase() &&
  //                 amount == transfer.amount
  //               ) {
  //                 transfer.status = TransferStatus.senderToBridge;
  //                 const transactionHash = txReceipt.transactionHash;
  //                 transfer.transactionHashs.push(transactionHash);
  //                 await this.transferService.update(transferId, transfer);
  //                 this.sendTokenToETH(transferId);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // /**
  //  * Check SAFEROCKET transactions to ETH Bridge
  //  * @returns
  //  */
  // @Interval(1000)
  // async checkETHBlock() {
  //   const blockNumber = await this.eth_provider.getBlockNumber();
  //   if (blockNumber <= this.lastETHBlockNumber) return;
  //   this.lastETHBlockNumber = blockNumber;
  //   const block = await this.eth_provider.getBlock(blockNumber);

  //   if (block && block.transactions) {
  //     console.log(blockNumber, block.transactions.length);
  //     for (const txHash of block.transactions) {
  //       const txData = await this.eth_provider.getTransaction(txHash);
  //       if (!txData || !txData.to) continue;

  //       const toAddress = txData.to.toString().toLowerCase();
  //       if (toAddress == this.eth_bridge_address.toString().toLowerCase()) {
  //         const txReceipt = await this.eth_provider.getTransactionReceipt(
  //           txHash,
  //         );

  //         const logs = txReceipt.logs;
  //         for (const log of logs) {
  //           const topics = log.topics;
  //           if (
  //             topics &&
  //             topics.length > 0 &&
  //             topics[0].toString().toLowerCase() ==
  //               '0xa37a1abec67a097377278e608d64ef956b67debf85d06fea4bec3e9d242ef024'
  //           ) {
  //             const result = ethers.utils.defaultAbiCoder.decode(
  //               ['address', 'uint256', 'string'],
  //               log.data,
  //             );
  //             if (result && result.length == 3) {
  //               const address = result[0];
  //               const amount = result[1].toString();
  //               const transferId = result[2];
  //               console.log(address, amount, transferId);

  //               const transfer = await this.transferService.findOne(transferId);
  //               if (
  //                 transfer &&
  //                 transfer.status == TransferStatus.waiting &&
  //                 address.toLowerCase() == transfer.address.toLowerCase() &&
  //                 amount == transfer.amount
  //               ) {
  //                 transfer.status = TransferStatus.senderToBridge;
  //                 const transactionHash = txReceipt.transactionHash;
  //                 transfer.transactionHashs.push(transactionHash);
  //                 await this.transferService.update(transferId, transfer);
  //                 this.sendTokenToBSC(transferId);
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}
