import React from "react";
import { Typography, Link, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  detailsItem: {
    overflow: "hidden",
    marginBottom: "33px",
    border: `1px solid ${theme.palette.border.main}`,
    borderRadius: "4px",
    "&:last-child": {
      marginBottom: "0",
    },
    [theme.breakpoints.down("sm")]: {
      marginBottom: "25px",
    },
  },
  detailsItemHeader: {
    padding: "24px 32px",
    background: theme.palette.background.main,
    [theme.breakpoints.down("sm")]: {
      padding: "15px",
    },
  },
  detailsItemHeaderTitle: {
    color: "#fff",
    [theme.breakpoints.down("sm")]: {
      fontSize: "20px",
    },
  },
  detailsItemFooter: {
    padding: "24px 32px 32px",
    [theme.breakpoints.down("sm")]: {
      padding: "15px",
    },
  },
  detailsItemFooterHash: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "16px",
    [theme.breakpoints.down("sm")]: {
      display: "block",
      marginBottom: "0",
    },
  },
  detailsItemFooterStatus: {
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "row-reverse",
    },
  },
  linkHash: {
    display: "block",
    wordBreak: "break-all",
    marginRight: "15px",
    [theme.breakpoints.down("sm")]: {
      marginBottom: "15px",
      marginRight: "0",
      fontSize: "16px",
      lineHeight: "21px",
    },
  },
  transactionSum: {
    whiteSpace: "nowrap",
    fontSize: "24px",
    lineHeight: "21px",
    [theme.breakpoints.down("sm")]: {
      marginBottom: "4px",
      fontSize: "16px",
    },
  },
}));

export const DetailsItem = ({ title, data, linkTo }) => {
  const classes = useStyles();

  return (
    <div className={classes.detailsItem}>
      <div className={classes.detailsItemHeader}>
        <Typography
          classes={{ root: classes.detailsItemHeaderTitle }}
          variant="h2"
        >
          {title}
        </Typography>
      </div>
      <div className={classes.detailsItemFooter}>
        <div className={classes.detailsItemFooterHash}>
          <Link
            href={
              linkTo === "ETH"
                ? `https://etherscan.io/tx/${data.txHash}`
                : `https://explorer.binance.org/smart/tx/${data.txHash}/token_transfers`
            }
            classes={{ root: classes.linkHash }}
            variant="h2"
            target="_blank"
            rel="noreferrer noopener"
          >
            {data.txHash}
          </Link>
          <Typography classes={{ root: classes.transactionSum }} variant="h2">
            {data.amount} PROM
          </Typography>
        </div>
        <div className={classes.detailsItemFooterStatus}>
          <Typography variant="body2" color="textSecondary">
            {data.createdAt}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {data.status}
          </Typography>
        </div>
      </div>
    </div>
  );
};
