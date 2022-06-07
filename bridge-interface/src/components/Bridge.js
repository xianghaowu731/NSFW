/* eslint-disable */
import { v4 as uuidv4 } from "uuid";
import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { Button, makeStyles } from "@material-ui/core";
import { ChainSelector } from "./ChainSelector";
import { Col, Container, Row } from "react-bootstrap";
import { DividerIcon } from "@/icons/DividerIcon";
import useEthers from "@/hooks/EthersContext";
import { parseUnits } from "@ethersproject/units";

const useStyles = makeStyles((theme) => ({
  bridgeButton: {
    backgroundColor: "#7230FF",
    color: "white",
    height: "50px",
    width: "200px",
  },
  bridgeTitle: {
    color: "white",
  },
  bridgeTextDescription: {
    color: "#898EA2",
  },
  divider: {
    backgroundColor: "#282A30",
    height: "100%",
    width: "1px",
    position: "absolute",
    left: "50%",
    [theme.breakpoints.down("sm")]: {
      height: "1px",
      width: "100%",
      left: "0",
    },
  },
}));

const _Bridge = ({ initializeTransfer, setTransferDialogOpen }) => {
  const {
    address,
    ethBalance,
    bscBalance,
    ethBridgeBalance,
    bscBridgeBalance,
  } = useEthers();

  const classes = useStyles();
  const [fromNetwork, setFromNetwork] = useState("BSC");
  const [toNetwork, setToNetwork] = useState("ETH");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const onChangeNetwork = (side, network) => {
    if (side == 0) {
      // from side
      if (network == "ETH") {
        setFromNetwork("BSC");
        setToNetwork("ETH");
      } else {
        setFromNetwork("ETH");
        setToNetwork("BSC");
      }
    } else {
      // to side
      if (network == "ETH") {
        setFromNetwork("ETH");
        setToNetwork("BSC");
      } else {
        setFromNetwork("BSC");
        setToNetwork("ETH");
      }
    }
    setFromAmount(0);
    setToAmount(0);
  };

  const onChangeAmount = (side, amount) => {
    if (side === 0) {
      setFromAmount(amount);
      setToAmount(amount);
    } else {
      setFromAmount(amount);
      setToAmount(amount);
    }
  };

  const handleBridgeTokens = () => {
    if (fromAmount === "") {
      alert("Please enter an amount");
      return;
    }
    const decimal = 9;
    const _amount = parseUnits(fromAmount, decimal);

    if (_amount.eq(0)) {
      alert("Amount is zero");
      return;
    }

    // if (_amount.gt(_balance)) {
    //   console.log("Insufficient balance");
    //   return;
    // }

    // if (_amount.gt(_bridgeBalance)) {
    //   alert("Insufficient bridge balance");
    //   return;
    // }

    setFromAmount("");
    setToAmount("");

    // --- start the transfer
    const payload = {
      transferId: uuidv4(),
      address: address,
      from: fromNetwork,
      to: toNetwork,
      amount: _amount.toString(),
    };
    console.log("initializeTransfer()", payload);
    initializeTransfer(payload);
    setTransferDialogOpen(true);
  };

  return (
    <Container
      fluid
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <Row
        style={{
          alignItems: "center",
          flexDirection: "column",
          textAlign: "center",
          paddingTop: "70px",
        }}
      >
        <h1 className={classes.bridgeTitle}>
          inti &#60;&#62; PornRocket Bridge
        </h1>
        <p className={classes.bridgeTextDescription}>
          Move your intimate / PornRocket tokens between the Binance Smart Chain
          and Ethereum networks.
        </p>
        <ul
          className={classes.bridgeTextDescription}
          style={{ listStyleType: "none" }}
        >
          <li>
            Step 1: Enter the amount of tokens you would like to move and select
            the direction (BSC &#62; ETH or ETH &#62; BSC)
          </li>
          <li>Step 2: Pay the network fee on the destination network</li>
          <li>Step 3: Send the tokens from the source network</li>
        </ul>
      </Row>
      <Row
        style={{ width: "100%", justifyContent: "center", marginTop: "50px" }}
      >
        <Col md={4}>
          <ChainSelector
            position="Source"
            chainType={fromNetwork}
            onChangeNetwork={(side, network) => {
              onChangeNetwork(side, network);
            }}
            onChangeAmount={(side, amount) => {
              onChangeAmount(side, amount);
            }}
            amount={fromAmount}
            balance={fromNetwork === "ETH" ? ethBalance : bscBalance}
          />
        </Col>
        <Col md={1} style={{ position: "relative" }}>
          <div className={classes.divider}></div>
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              marginTop: "-18px",
              marginLeft: "-18px",
            }}
          >
            <DividerIcon></DividerIcon>
          </div>
        </Col>
        <Col md={4}>
          <ChainSelector
            position="Destination"
            chainType={toNetwork}
            onChangeNetwork={(side, network) => {
              onChangeNetwork(side, network);
            }}
            onChangeAmount={(side, amount) => {
              onChangeAmount(side, amount);
            }}
            amount={toAmount}
            balance={toNetwork === "ETH" ? ethBalance : bscBalance}
          />
        </Col>
      </Row>
      <Button
        className={classes.bridgeButton}
        variant="contained"
        style={{
          marginTop: "50px",
          color: !address ? "gray" : "white",
          textTransform: "uppercase",
        }}
        disabled={!address}
        onClick={handleBridgeTokens}
      >
        Bridge tokens
      </Button>
    </Container>
  );
};

const mapMobxToProps = ({ transfer }) => ({
  initializeTransfer: transfer.initializeTransfer,
  transferDialogOpen: transfer.transferDialogOpen,
  setTransferDialogOpen: transfer.setTransferDialogOpen,
});

export const Bridge = inject(mapMobxToProps)(observer(_Bridge));
