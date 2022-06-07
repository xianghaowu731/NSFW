export const Constants = {
  ETH_CHAINID: 4,
  BSC_CHAINID: 97,
  NETWORKS: [
    {
      // Ethereum Rinkeby
      chainId: "0x4",
      networkId: 4,
      chainName: "Ethereum Rinkeby",
      rpcUrls: [
        "https://rinkeby.infura.io/v3/b6690c155e5843c7804086e0845dd380",
      ],
    },
    {
      // Binance Mainnet
      chainId: "0x38",
      networkId: 56,
      chainName: "BSC (Mainnet)",
      rpcUrls: ["https://bsc-dataseed.binance.org/"],
    },
    {
      // Binance Testnet
      chainId: "0x61",
      networkId: 97,
      chainName: "BSC (Testnet)",
      rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545/"],
    },
  ],
  TOKENS: [
    {
      // Ethereum Rinkeby
      networkId: 4,
      address: "0xBa4bdeA02eF213dE94C54A4206B9db4D690DD115",
      symbol: "INTI",
      decimals: "9",
      image: "",
    },
    {
      // Binance Mainnet
      networkId: 97,
      address: "0xAb4f999150AB02F5DFeF2f3632b409d72C58f5D0",
      symbol: "PORNOCKET",
      decimals: "9",
      image: "",
    },
    {
      // Binance Testnet
      networkId: 97,
      address: "0xC3eFd2a1145D1cf3E73Ae556440fcD2841E4a3b2",
      symbol: "SAFEROCKET",
      decimals: "9",
      image: "",
    },
  ],
  BRIDGE: {
    eth_rinkeby: {
      networkId: 4,
      address: "0xC5Cee1B37f4cB76fa1F5586BEe214e9Bf133dB43",
    },
    bsc_testnet: {
      networkId: 97,
      address: "0x533328aBDC2FE8c4aBc9FE1F5792228713051e9D",
    },
  },
};
