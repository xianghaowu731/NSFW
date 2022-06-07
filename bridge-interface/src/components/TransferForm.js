import React from "react";
import { inject, observer } from "mobx-react";
import {
  Button,
  Hidden,
  CircularProgress,
  makeStyles,
} from "@material-ui/core";

import { TransferWallet } from "./TransferWallet";
import { ArrowsRightIcon } from "@/icons/ArrowsRightIcon";
import { ArrowsBottomIcon } from "@/icons/ArrowsBottomIcon";

const useStyles = makeStyles((theme) => ({
  transferForm: {
    backgroundColor: "#1B1C20",
    padding: "90px 0",
    [theme.breakpoints.down("sm")]: {
      padding: "48px 0",
    },
  },
  transferFormWallets: {
    display: "flex",
    marginBottom: "32px",
    [theme.breakpoints.down("sm")]: {
      display: "block",
      marginBottom: "48px",
    },
  },
  transferFormDivider: {
    position: "relative",
    margin: "0 64px",
    borderRight: `1px solid ${theme.palette.border.main}`,
    [theme.breakpoints.down("sm")]: {
      margin: 0,
      borderRight: "unset",
      borderBottom: `1px solid ${theme.palette.border.main}`,
    },
  },
  transferFormDividerArrows: {
    boxSizing: "border-box",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: "50%",
    height: "52px",
    width: "52px",
    background: "#fff",
    [theme.breakpoints.down("sm")]: {
      height: "35px",
      width: "35px",
    },
  },
  transferFormButton: {
    textAlign: "center",
  },
  loader: {
    marginLeft: "5px",
  },
}));

const _TransferForm = ({
  transferForm,
  transferFormErrors,
  lastChangedWalletType,
  setFormValue,
  setLastChangedWalletType,
  doTransfer,
  pending,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.transferForm}>
      <div className={classes.transferFormWallets}>
        <TransferWallet
          walletValue={transferForm.address}
          walletError={transferFormErrors.addressFrom}
          onChangeInput={(e) => {
            setFormValue("address", e.target.value, true);
            setLastChangedWalletType("source");
          }}
          onChangeSelect={(e) => setFormValue("fromNode", e.target.value)}
          disabled={Boolean(
            transferForm.address && lastChangedWalletType === "target"
          )}
          inputLabel="Source Wallet Address"
          withCaption
        />
        <div className={classes.transferFormDivider}>
          <div className={classes.transferFormDividerArrows}>
            <Hidden smDown>
              <ArrowsRightIcon />
            </Hidden>
            <Hidden mdUp>
              <ArrowsBottomIcon />
            </Hidden>
          </div>
        </div>
        <TransferWallet
          walletValue={transferForm.address}
          walletError={transferFormErrors.addressTo}
          onChangeInput={(e) => {
            setFormValue("address", e.target.value, true);
            setLastChangedWalletType("target");
          }}
          onChangeSelect={(e) => setFormValue("toNode", e.target.value)}
          disabled={Boolean(
            transferForm.address && lastChangedWalletType === "source"
          )}
          inputLabel="Target Wallet Address"
        />
      </div>
      <div className={classes.transferFormButton}>
        <Button
          color="primary"
          variant="contained"
          size="large"
          onClick={doTransfer}
          disabled={pending || !transferForm.address}
        >
          Transfer
          {pending && (
            <CircularProgress
              classes={{ root: classes.loader }}
              size={25}
              thickness={5}
            />
          )}
        </Button>
      </div>
    </div>
  );
};

const mapMobxToProps = ({ transfer }) => ({
  transferForm: transfer.transferForm,
  transferFormErrors: transfer.transferFormErrors,
  lastChangedWalletType: transfer.lastChangedWalletType,
  setFormValue: transfer.setFormValue,
  setLastChangedWalletType: transfer.setLastChangedWalletType,
  doTransfer: transfer.doTransfer,
  pending: transfer.pending,
});

export const TransferForm = inject(mapMobxToProps)(observer(_TransferForm));
