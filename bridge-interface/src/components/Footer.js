import React from "react";
import { Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: "#1B1C20",
    padding: "25px 0",
  },
  footerDesc: {},
}));

export const Footer = () => {
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Typography variant="h4" className={classes.footerDesc}></Typography>
    </footer>
  );
};
