// TODO: Enable eslint
/* eslint-disable */
import React from "react";
import { TextField, makeStyles, Button } from "@material-ui/core";

import { BSCLogoIcon } from "@/icons/BSCLogoIcon";
import { ETHLogoIcon } from "@/icons/ETHLogoIcon";
import { RocketIcon } from "@/icons/RocketIcon";
import { IntiIcon } from "@/icons/IntiIcon";
import { formatUnits } from "@ethersproject/units";
import { Constants } from "@/constants/Constants";
import useEthers from "@/hooks/EthersContext";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "20px",
    marginBottom: "20px",
  },
  chainContainer: {
    width: "100%",
    backgroundColor: "#282A30",
    height: "56px",
    borderRadius: "7px",
    display: "flex",
    padding: "0 20px",
    alignItems: "center",
    marginTop: "10px",
  },
  chainLabel: {
    color: "white",
    marginLeft: "10px",
  },
  changeButton: {
    color: "#898EA2",
    borderColor: "#898EA2",
    borderRadius: "7px",
    height: "25px",
    width: "50px",
    fontSize: "10px",
  },
  amountTextField: {
    width: "120px",
    margin: "0 10px",
    textAlign: "center",
    '&::-webkit-outer-spin-button,::-webkit-inner-spin-button':{
      appearance: 'none'
    },
  },
  amountInput: {
    color: "white",
  },
}));

export const ChainSelector = ({
  position,
  chainType,
  onChangeNetwork,
  onChangeAmount,
  amount,
  balance,
}) => {
  const { network, addTokenToMetamask, swithMetamaskChain } = useEthers();
  const classes = useStyles();

  const side = position === "Source" ? 0 : 1;

  const handleChange = (side, network) => {
    onChangeNetwork(side, network);
  };

  const handleAmount = (side, value) => {
    onChangeAmount(side, value.toString());
  };

  const handleAddToken = async (chainType) => {
    if (!network) return;
    const chainId =
      chainType == "ETH" ? Constants.ETH_CHAINID : Constants.BSC_CHAINID;
    if (chainId != network.chainId) {
      await swithMetamaskChain(chainId);
      return;
    }
    await addTokenToMetamask(
      chainType == "ETH" ? Constants.ETH_CHAINID : Constants.BSC_CHAINID
    );
  };

  return (
    <div className={classes.mainContainer}>
      <span
        style={{
          alignSelf: "self-start",
          color: "#898EA2",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        {position}
      </span>
      <div className={classes.chainContainer}>
        {chainType === "ETH" ? (
          <>
            <ETHLogoIcon />
            <span className={classes.chainLabel}>Ethereum</span>
            <div style={{ flex: 1 }}></div>
            <Button
              className={classes.changeButton}
              variant="outlined"
              onClick={() => {
                handleChange(side, chainType);
              }}
            >
              Change
            </Button>
          </>
        ) : (
          <>
            <BSCLogoIcon />
            <span className={classes.chainLabel}>Binance Smart Chain</span>
            <div style={{ flex: 1 }}></div>
            <Button
              className={classes.changeButton}
              variant="outlined"
              onClick={() => {
                handleChange(side, chainType);
              }}
            >
              Change
            </Button>
          </>
        )}
      </div>
      <div className={classes.chainContainer}>
        {chainType === "ETH" ? (
          <>
            <IntiIcon />
         
            <span className={classes.chainLabel}>INTI</span>
            <div style={{ flex: 1 }}></div>
            <TextField
              className={classes.amountTextField}
              variant="standard"
              type="number"
              placeholder="0.00"
              InputProps={{
                className: classes.amountInput,
                disableUnderline: true,
              }}
              value={amount}
              onChange={(e) => {
                handleAmount(side, e.target.value);
              }}
            />
            <Button
              className={classes.changeButton}
              variant="outlined"
              onClick={() => {
                handleAddToken(chainType);
              }}
            >
              Add
            </Button>
          </>
        ) : (
          <>
            <RocketIcon />
           
            <span className={classes.chainLabel}>PORNROCKET</span>
            <div style={{ flex: 1 }}></div>
            <TextField
              className={classes.amountTextField}
              variant="standard"
              type="number"
              placeholder="0.00"
              InputProps={{
                className: classes.amountInput,
                disableUnderline: true,
              }}
              value={amount}
              onChange={(e) => {
                handleAmount(side, e.target.value);
              }}
            />
            <Button
              className={classes.changeButton}
              variant="outlined"
              onClick={() => {
                handleAddToken(chainType);
              }}
            >
              Add
            </Button>
          </>
        )}
      </div>
      <div
        style={{
          alignSelf: "self-start",
          marginTop: "10px",
          marginBottom: "10px",
        }}
      >
        <span style={{ color: "#898EA2" }}>Balance:</span>
        <span style={{ color: "white", marginLeft: "10px" }}>
          {formatUnits(balance, 9)}
        </span>
      </div>
    </div>
  );
};
