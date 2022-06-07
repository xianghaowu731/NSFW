/* eslint-disable */
import React, { useState } from "react";
import { Link, makeStyles, Button } from "@material-ui/core";

import { PrometeusIcon } from "@/icons/PrometeusIcon";
import useEthers from "@/hooks/EthersContext";
import { ButtonBase, Menu, MenuItem } from "@mui/material";
import { ETHLogoIcon } from "@/icons/ETHLogoIcon";
import { BSCLogoIcon } from "@/icons/BSCLogoIcon";
import { Constants } from "@/constants/Constants";

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: "#1B1C20",
    backgroundPosition: "top",
    height: "100px",
    display: "flex",
    alignItems: "center",
  },
  headerInner: {
    width: "100%",
    padding: "0 50px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    textAlign: "center",
    [theme.breakpoints.down("sm")]: {
      padding: "0 20px",
    },
  },
  headerTitle: {
    color: "#fff",
  },
  connectButton: {
    color: "#7230FF",
    borderColor: "#7230FF",
    borderRadius: 7,
    marginLeft: "10px",
  },
}));

export const Header = () => {
  const classes = useStyles();
  const {
    connect,
    disconnect,
    provider,
    signer,
    network,
    address,
    swithMetamaskChain,
  } = useEthers();
  const [anchorEl, setAnchorEl] = useState(null);
  const openNetwork = Boolean(anchorEl);

  // console.log(address, network, provider);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeNetwork = async (networkId) => {
    await swithMetamaskChain(networkId);
  };

  const getAddress = () => {
    if (!address) return "";
    return "0x" + address.substring(2, 6) + "..." + address.substring(38);
  };

  return (
    <header className={classes.header}>
      <div className={classes.headerInner}>
        <Link
          // href="#"
          target="_blank"
          rel="noreferrer noopener"
        >
          <PrometeusIcon />
        </Link>
        <div style={{ flex: 1 }}></div>

        {signer && network ? (
          <>
            <ButtonBase
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
              }}
              sx={{
                backgroundColor: "#184498",
                height: "40px",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              {network.chainId == Constants.ETH_CHAINID ? (
                <>
                  <ETHLogoIcon />{" "}
                  <span style={{ marginLeft: "10px", color: "white" }}>
                    Rinkeby
                  </span>
                </>
              ) : (
                <>
                  <BSCLogoIcon />{" "}
                  <span style={{ marginLeft: "10px", color: "white" }}>
                    BSC Testnet
                  </span>
                </>
              )}
            </ButtonBase>
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={openNetwork}
              onClose={handleClose}
              onClick={handleClose}
              sx={{
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiPaper-root": {
                  backgroundColor: "#282a30",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <MenuItem
                onClick={() => {
                  handleChangeNetwork(4);
                }}
              >
                <ETHLogoIcon />{" "}
                <span style={{ marginLeft: "10px", color: "white" }}>
                  Ethereum(Rinkeby)
                </span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleChangeNetwork(97);
                }}
              >
                <BSCLogoIcon />{" "}
                <span style={{ marginLeft: "10px", color: "white" }}>
                  BSC(Testnet)
                </span>
              </MenuItem>
            </Menu>
            <Button
              className={classes.connectButton}
              variant="outlined"
              onClick={disconnect}
            >
              {getAddress()}
            </Button>
          </>
        ) : (
          <>
            <Button
              className={classes.connectButton}
              variant="outlined"
              onClick={connect}
            >
              Connect Wallet
            </Button>
          </>
        )}
      </div>
    </header>
  );
};
