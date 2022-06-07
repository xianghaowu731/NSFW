// TODO: Enable eslint
/* eslint-disable */
import React from "react";
import { inject, observer } from "mobx-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  makeStyles,
} from "@material-ui/core";

import { CloseIcon } from "@/icons/CloseIcon";
import {
  body2Styles,
  captionStyles,
  TransferTimeline,
} from "./TransferTimeline";
import { TransferDialogActions } from "./TransferDialogActions";

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    margin: "15px",
    maxWidth: "712px",
    width: "100%",
    backgroundColor: "#282A30",
  },
  transferDialog: {
    position: "relative",
  },
  transferDialogCloseBtn: {
    position: "absolute",
    top: "25px",
    right: "32px",
    width: "40px",
    height: "40px",
    margin: "8px",
    lineHeight: 0,
  },
  transferDialogTitle: {
    padding: 0,
    flexDirection: "column",
  },
  transferDialogContent: {
    padding: "32px",
  },
  textDescription: {
    marginBottom: "32px",
  },
  copyWrapper: {
    display: "flex",
    marginBottom: "32px",
  },
  disabledField: {
    padding: "6px 16px",
    border: `1px solid ${theme.palette.border.light}`,
    borderRadius: "5px 0 0 5px",
    overflow: "hidden",
  },
  copyBtn: {
    borderRadius: "0 5px 5px 0",
  },
  qrcodeWrapper: {
    maxWidth: "220px",
    margin: "0 auto 32px",
    "& > img": {
      width: "100%",
    },
  },
  dialogActionsButton: {
    display: "block",
    textAlign: "center",
    padding: 0,
  },
  dialogTitleContainer: {
    position: "relative",
    padding: "32px",
    borderBottom: "1px solid #2C2E35",
  },
}));

const _TransferDialog = ({
  transferRequest,
  transferDialogOpen,
  setTransferDialogOpen,
  isCompleted,
}) => {
  const classes = useStyles();

  const handleCloseDialog = () => {
    setTransferDialogOpen(false);
  };

  if (!transferRequest) return


  return (
    <Dialog
      open={transferDialogOpen}
      onClose={handleCloseDialog}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <div className={classes.transferDialog}>
        <div className={classes.dialogTitleContainer}>
          <IconButton
            onClick={handleCloseDialog}
            className={classes.transferDialogCloseBtn}
          >
            <CloseIcon />
          </IconButton>
          <DialogTitle
            className={classes.transferDialogTitle}
            disableTypography
          >
            <h2>Transfer Request ID:</h2>
            <h2>{transferRequest.transferId}</h2>
           
            <br/>
            {!isCompleted ? 
            <p style={{ ...body2Styles, color: "white" }}>
              Currently Bridging...
            </p>
            :   
            <p style={{ ...body2Styles, color: "white" }}>
           Completed! Transfer Request ID: {transferRequest.transferId}
          </p>
          }
            <p style={{ ...captionStyles, marginTop: "6px" }}>
              PORNROCKET to INTI Progress
            </p>
          </DialogTitle>
        </div>
        <DialogContent className={classes.transferDialogContent}>
          <TransferTimeline />
          <TransferDialogActions />
        </DialogContent>
      </div>
    </Dialog>
  );
};

const mapMobxToProps = ({ transfer }) => {

  return {
    transferRequest: transfer.transferRequest,
    transferStep: transfer.currentStep,
    transferTransactionMap: transfer.transactionMap,
    transferDialogOpen: transfer.transferDialogOpen,
    setTransferDialogOpen: transfer.setTransferDialogOpen,
    isCompleted: transfer.transactionMap.get('bridge:destination').completedAt
  };
};

export const TransferDialog = inject(mapMobxToProps)(observer(_TransferDialog));
