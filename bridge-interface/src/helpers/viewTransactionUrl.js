export const viewTransactionUrl = (network, transactionHash) => {
  return (
    (network === "ETH"
      ? process.env.REACT_APP_ETH_SCAN_URL
      : process.env.REACT_APP_BSC_SCAN_URL) +
    "tx/" +
    transactionHash
  );
};
