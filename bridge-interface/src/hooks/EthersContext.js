/* eslint-disable */
import React, { useState, useEffect, useMemo } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { BigNumber } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { Constants } from "@/constants/Constants";
import useInterval from "./useInterval";

import PORNROCKET from "../abi/saferocket.json";
import IntimateToken from "../abi/intimate-token.json";
import BridgeBSC from "../abi/bridge-bsc.json";
import BridgeETH from "../abi/bridge-eth.json";

const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: "", // required
    },
  },
};

const web3Modal = new Web3Modal({
  cacheProvider: true, // optional
  providerOptions,
  disableInjectedProvider: false,
});

export const EthersContext = React.createContext(null);

const REFRESH_WALLET_EVERY_MS = 3000;

export const EthersProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [network, setNetwork] = useState(null);
  const [address, setAddress] = useState(null);
  const [ethBalance, setETHBalance] = useState("0");
  const [bscBalance, setBSCBalance] = useState("0");
  const [refreshInterval, setRefreshInterval] = useState(null);

  const [bscBridgeBalance, setBSCBridgeBalance] = useState("0");
  const [ethBridgeBalance, setETHBridgeBalance] = useState("0");

  const ethProvider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_ETH_RPC
  );
  const bscProvider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_BSC_RPC
  );

  useInterval(
    async () => {
      if (signer) {
        const _address = await signer.getAddress();
        setAddress(_address);

        const _bscBalance = await getTokenBalanceBSC(_address);
        setBSCBalance(_bscBalance);

        const _ethBalance = await getTokenBalanceETH(_address);
        setETHBalance(_ethBalance);
      }
    },
    // Only refresh wallet balances when connected to the network
    network ? refreshInterval : null
  );

  useEffect(()=>{
    cachedConnect()
  },[])

  // useEffect(() => {
  //   console.log(refreshInterval);
  //   if (refreshInterval && refreshInterval > 0) {
  //     const interval = setInterval(async () => {

  //     }, refreshInterval);

  //     return () => clearInterval(interval);
  //   }
  // }, [refreshInterval]);

  useEffect(() => {
    (async function () {
      if (provider) {
        const _network = await provider.getNetwork();
        setNetwork(_network);

        const _signer = await provider.getSigner();
        setSigner(_signer);
      }
    })();
  }, [provider]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", async () => {
        cachedConnect();
      });
    }
  }, [window.ethereum]);


  useEffect(() => {
    (async function () {
      if (signer) {
        const _address = await signer.getAddress();
        setAddress(_address);

        const _bscBalance = await getTokenBalanceBSC(_address);
        setBSCBalance(_bscBalance);

        const _ethBalance = await getTokenBalanceETH(_address);
        setETHBalance(_ethBalance);

        setRefreshInterval(REFRESH_WALLET_EVERY_MS);
      }
    })();
  }, [signer]);

  const cachedConnect = async () => {
    try {
      if (web3Modal.cachedProvider) {
        const instance = await web3Modal.connect();
        const _provider = new ethers.providers.Web3Provider(instance);

        setProvider(_provider);
      } else {
        setProvider(null);
        setSigner(null);
        setAddress(null);
        setNetwork(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connect = async () => {
    try {
      if (web3Modal) {
        const instance = await web3Modal.connect();
        const _provider = new ethers.providers.Web3Provider(instance);
        setProvider(_provider);
      } else {
        console.erro("web3Modal is null");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const disconnect = async () => {
    try {
      if (web3Modal) {
        await web3Modal.clearCachedProvider();

        setProvider(null);
        setSigner(null);
        setAddress(null);
        setNetwork(null);
        setBSCBalance("0");
        setETHBalance("0");
      } else {
        console.log("web3Modal is null");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getTokenBalanceETH = async (address) => {
    const tokenAddress = process.env.REACT_APP_INTI;
    try {
      const tokenContract = new ethers.Contract(
        tokenAddress,
        IntimateToken,
        ethProvider
      );
      const balance = await tokenContract.balanceOf(address);
      return balance.toString();
    } catch (err) {
      // console.error("Unable to fetch INTI balance");
      // console.error(`Address: ${address}`);
      // console.error(`Contract: ${tokenAddress}`);
      // console.trace(err);
      return "0";
    }
  };

  const getTokenBalanceBSC = async (address) => {
    // console.log("PORNROCKET tokenAddress", tokenAddress);
    const tokenAddress = process.env.REACT_APP_PORNROCKET;
    const tokenContract = new ethers.Contract(
      tokenAddress,
      PORNROCKET,
      bscProvider
    );
    const balance = await tokenContract.balanceOf(address);
    return balance.toString();
  };

  // Returns contract instances for the bridge and token based on the transfer
  const fetchContracts = (transferRequest) => {
    const bridge = new ethers.Contract(
      transferRequest.from === "BSC"
        ? process.env.REACT_APP_BSC_ETH_BRIDGE
        : process.env.REACT_APP_ETH_BSC_BRIDGE,
      transferRequest.from === "BSC" ? BridgeETH : BridgeBSC,
      signer
    );
    const token = new ethers.Contract(
      transferRequest.from === "BSC"
        ? process.env.REACT_APP_PORNROCKET
        : process.env.REACT_APP_INTI,
      transferRequest.from === "BSC" ? PORNROCKET : IntimateToken,
      signer
    );

    return {
      bridge,
      token,
    };
  };

  // TODO: Pay correct fee...
  const payBridgingFee = async (amount) => {
    let tx = {
      to: process.env.REACT_APP_RELAYER,
      value: ethers.BigNumber.from("1")._hex,
    };
    console.log("tx:", tx);
    return signer.sendTransaction(tx);
  };

  const retrieveAllowance = async (transferRequest) => {
    try {
      const { bridge, token } = fetchContracts(transferRequest);
      const signerAddress = await signer.getAddress();
      const allowance = await token.allowance(signerAddress, bridge.address);
      return allowance;
    } catch (err) {
      console.error("Unable to retereive allowance", err);
    }
  };

  // const resolveAllowance = async (transferRequest) => {
  //   const allowance = await retrieveAllowance(transferRequest);
  //   console.log("handleApproveTokenForTransfer allowance >", allowance);

  //   let allowanceAmount;
  //   if (allowance && allowance._isBigNumber) {
  //     try {
  //       allowanceAmount = BigNumber.from(allowance._hex).toNumber();
  //     } catch (error) {
  //       console.log(error);
  //       return false;
  //     }
  //   }
  //   console.log("allowance amount: ", allowanceAmount);

  //   if (allowanceAmount && allowanceAmount >= transferRequest.amount) {
  //     return allowanceAmount;
  //   } else {
  //     console.log("insufficient allowance, approve correct value");
  //     return null;
  //   }
  // };

  const getTransactionByNetwork = async (network, transactionHash) => {
    switch (network) {
      case "ETH":
        return ethProvider.getTransaction(transactionHash);
      case "BSC":
        return bscProvider.getTransaction(transactionHash);
      default:
        throw new Error(`Unable to getTransactionByNetwork() for [${network}]`);
    }
  };

  const approveTokensForTransfer = async (transferRequest) => {
    const { bridge, token } = fetchContracts(transferRequest);

    const approval = await token.approve(
      bridge.address,
      BigNumber.from(transferRequest.amount)
    );
    console.log("approveTokensForTransfer approve", approval);
    return approval;
  };

  const bridgeTokens = async (transferRequest) => {
    const { bridge } = fetchContracts(transferRequest);

    let transaction;
    if (transferRequest.from === "BSC") {
      console.log(`lockTokens() - `, await signer.getAddress());
      transaction = await bridge
        .connect(signer)
        .lockTokens(transferRequest.amount, transferRequest.transferId);
    }
    if (transferRequest.from === "ETH") {
      console.log("TODO - burn tokens");
    }

    return transaction;
  };

  const addTokenToMetamask = async (networkId) => {
    const token = Constants.TOKENS.find((t) => t.networkId == networkId);
    const _provider = await detectEthereumProvider();
    if (_provider && token) {
      _provider.sendAsync(
        {
          method: "metamask_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: token.address,
              symbol: token.symbol,
              decimals: token.decimals,
              image: token.image,
            },
          },
          id: Math.round(Math.random() * 100000),
        },
        (err, added) => {
          console.log("provider returned", err, added);
        }
      );
    } else {
      console.error("Please install Metamask");
    }
  };

  const swithMetamaskChain = async (chainId) => {
    const _network = Constants.NETWORKS.find((n) => n.networkId == chainId);
    const _provider = await detectEthereumProvider();
    if (_provider && _network) {
      _provider.sendAsync(
        {
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: _network.chainId,
            },
          ],
        },
        (err, added) => {
          console.log("provider returned", err, added);
          if (err && err.code === 4902) {
            _provider.sendAsync(
              {
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: _network.chainId,
                    chainName: _network.chainName,
                    rpcUrls: _network.rpcUrls,
                  },
                ],
              },
              (aerr, aadded) => {}
            );
          }
        }
      );
    } else {
      console.error("Please install Metamask");
    }
  };

  const values = useMemo(
    () => ({
      provider,
      signer,
      network,
      address,
      ethBalance,
      bscBalance,
      ethBridgeBalance,
      bscBridgeBalance,

      connect,
      disconnect,

      getTokenBalanceETH,
      getTokenBalanceBSC,

      payBridgingFee,
      retrieveAllowance,
      bridgeTokens,
      approveTokensForTransfer,
      getTransactionByNetwork,

      addTokenToMetamask,
      swithMetamaskChain,
    }),
    [
      provider,
      signer,
      address,
      network,
      bscBalance,
      ethBalance,
      ethBridgeBalance,
      bscBridgeBalance,
    ]
  );

  return (
    <EthersContext.Provider value={values}>{children}</EthersContext.Provider>
  );
};

export default function useEthers() {
  const context = React.useContext(EthersContext);

  if (context === undefined) {
    throw new Error(
      "useEthers hook must be used with a EthersProvider component"
    );
  }

  return context;
}
