# @nsfw/bridge-contracts

## TODO

* [ ] Workout how to use <https://github.com/wighawag/hardhat-deploy> correctly

This stack relys upon:

* [Hardhat](https://hardhat.org) to orchestrate all the tasks.
* [Ethers](https://docs.ethers.io/ethers.js/html/index.html) is used for all Ethereum interactions and testing.

## Getting started

```bash
# Use the correct node version
nvm use

# Install deps
yarn

# Compiles ABI's and Typechain definitions
yarn compile

# Ensure it works
yarn test
```

## Tests

```shell
yarn clean && yarn test
```

## Linting

```shell
yarn solhint 'contracts/**/*.sol'
```

## Export ABIs

```shell
yarn export:abi
```

## Inspect the calls

```bash
# tty0 -- Runs a local chain with {n} accounts
yarn hardhat node

# tty1 -- Run tests agains local network
yarn test --network localhost
```

### Deploy to Ethereum

Create/modify network config in `hardhat.config.ts` and add API key and private key, then run:

 `npx hardhat run --network rinkeby scripts/deploy.ts`

### Verify on Etherscan

Using the [hardhat-etherscan plugin](https://hardhat.org/plugins/nomiclabs-hardhat-etherscan.html), add Etherscan API key to `hardhat.config.ts` , then run:

 `npx hardhat verify --network rinkeby <DEPLOYED ADDRESS>`

### Deployments

Testnet

```shell
BSC (Testnet)

BNB: 0xFFA4D69d6D2AA7dFeA4AA043a0c9189E3c08c477
Uniswap Factory: 0x9bA8F938dc971Bef80EdC65B9Bf527D3A1Db27B0
Uniswap Router: 0xE47b48da732CBdbAFb8c3256Cb2dA20A20498385
BSC->ETH Bridge: 0x7062e51E8F45d8C325ec1f8B14a16544bd73a4A8
SAFEROCKET: 0xd88C6895d90a719f7f9cCF4debc64EAc55a9DA88

ETH (Rinkeby)

WETH: 0xb0553829855bCc99F9FE55A89B1De750591D4d38
Uniswap Factory: 0xeF74e4de470263e7d6Cf6e8c529492E8D7b02Ea8
Uniswap Router: 0x9DdDc8C0c305e9324326b91ca949C69283E427C7
ETH->BSC Bridge 0xB083e52337B4b53E88e33aDB17fCCAbF56C6c10b
INTI: 0x7aa5b7740947C62375ED162649932fA257EA275d
```
