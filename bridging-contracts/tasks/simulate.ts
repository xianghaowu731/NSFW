import { task } from 'hardhat/config'; // import function
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { randomProceduralRange } from './utils/random';
import seedrandom from 'seedrandom';
import { expect } from 'chai';

const _prng = seedrandom('nsfw-tests');

/**
 * @usage
 * 1. yarn hardhat reset --network localhost
 * 2. yarn hardhat run --network localhost scripts/deploy.hardhat.ts
 * 3. yarn hardhat simulate --network localhost
 */
task('simulate', 'Simulate Intimate (INTI)')
  //  TODO: Add simulation paramaters here...
  // .addParam('minters', 'Number of users to mint to', '1000')
  // .addParam('amount', 'Amount of tokens to send', '100000')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    const _artifact = await hre.deployments.getArtifact('IntiToken');
    const [owner, ...accounts] = await hre.ethers.getSigners();
    const chainId = await hre.getChainId();
    const _contract = await new hre.ethers.Contract('0x8A791620dd6260079BF849Dc5567aDC3F2FdC318', _artifact.abi, owner);
    if (chainId !== '31337') {
      console.log('Unsupported chainId');
      return;
    }

    // getSigners can returns max 19 accounts
    const mintAmounts = randomProceduralRange({ size: 5, minVal: 5000, maxVal: 10000 });

    // indices

    const _from = [0, 1, 2, 3, 4];
    const _to = [5, 6, 7, 8, 9];

    let totalHolders = 0;

    // ---  mint 50k INTI to 5 accounts
    await Promise.all(
      mintAmounts.map(async (mintAmount, index) => {
        // from, to
        const from = accounts[_from[index]];
        const to = accounts[_to[index]];

        // await _contract.connect(owner).excludeFromFee(from.address);

        const _amount = hre.ethers.utils.parseUnits('50000', 9);
        await _contract.mintAndTransfer(from.address, _amount);

        // TODO: Check total supply

        // increment
        totalHolders++;

        const _beforeBalance = await _contract.balanceOf(from.address);
        console.log(`--- Mint`);
        console.log(`[${_from[index]}:balance]: ${_beforeBalance.toString()}`);

        // --- send 25k
        const _tamount = hre.ethers.utils.parseUnits('25000', 9);
        await _contract.connect(from).transfer(to.address, _tamount);

        const afterBalance = await _contract.balanceOf(from.address);
        const recipientBalance = await _contract.balanceOf(to.address);

        console.log(`--- Transfer`);
        console.log(`[${_from[index]}:balance] ${afterBalance.toString()}`);
        console.log(`[${_to[index]}:balance] ${recipientBalance.toString()}`);
        // // --- ensure rTotal is dynamically calculated correctly
        // expect(await _contract.burnToken(_tamount)).to.emit(_contract, 'BurnToken');
        // const _afterBalance = await _contract.balanceOf(accounts[index].address);
        // expect(_afterBalance).to.equal(_beforeBalance.sub(_tamount));
        // console.log('Account Index : ', index, '  Balance : ', _afterBalance.toString());
        // // --- ensure check reflections distributed as reflected
        // await _contract.connect(owner).includeInFee(accounts[index].address);
        // if (index > 1) {
        //   await _contract.connect(accounts[index]).transfer(accounts[index - 1].address, _tamount);
        // }
        // const _balance = await _contract.balanceOf(accounts[index].address);
        // console.log('Account Index : ', index, '  Balance : ', _balance.toString());
      }),
    );

    // TODO: Burn it all
    // TODO: Check total suppply
  });
