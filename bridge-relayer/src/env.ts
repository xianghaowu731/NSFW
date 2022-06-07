export const env = {
  NSFW_ENV: process.env.NSFW_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10),
  MONGO_URI: process.env.MONGO_URI,
  API_KEY: process.env.API_KEY,
  ETH_RPC: process.env.ETH_RPC,
  BSC_RPC: process.env.BSC_RPC,
  BRIDGE_ETH: process.env.BRIDGE_ETH,
  BRIDGE_BSC: process.env.BRIDGE_BSC,
  RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY,
};
