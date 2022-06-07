import React from "react";
import { inject, observer } from "mobx-react";
import { Typography, makeStyles } from "@material-ui/core";

import { DetailsItem } from "./DetailsItem";

const useStyles = makeStyles((theme) => ({
  transactionDetailsList: {
    margin: "48px 0",
    [theme.breakpoints.down("xs")]: {
      margin: "25px 0",
    },
  },
}));

const _TransactionDetails = ({
  transactions,
  tempTransferForm,
  intervalTransactions,
}) => {
  const classes = useStyles();

  return (
    <>
      <Typography variant="h1" align="center">
        {intervalTransactions && "Waiting for the Transaction Details"}
        {transactions && !intervalTransactions && "Transaction Details"}
      </Typography>
      <div className={classes.transactionDetailsList}>
        {transactions && transactions.txOut.status !== "PENDING" && (
          <DetailsItem
            title="Source Blockchain"
            data={transactions.txOut}
            linkTo={tempTransferForm.toNode}
          />
        )}
        {transactions && transactions.txIn.status !== "PENDING" && (
          <DetailsItem
            title="Target Blockchain"
            data={transactions.txIn}
            linkTo={tempTransferForm.fromNode}
          />
        )}
      </div>
    </>
  );
};

const mapMobxToProps = ({ transfer }) => ({
  transactions: transfer.transactions,
  tempTransferForm: transfer.tempTransferForm,
  intervalTransactions: transfer.intervalTransactions,
});

export const TransactionDetails = inject(mapMobxToProps)(
  observer(_TransactionDetails)
);
