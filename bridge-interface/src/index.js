import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "mobx-react";
import { MuiThemeProvider } from "@material-ui/core";

import * as serviceWorker from "@/serviceWorker";
import { store } from "@/stores";
import { App } from "@/App";
import { main } from "@/styles/material";
import "@/styles/index.scss";
import "bootstrap/dist/css/bootstrap.min.css";

import Web3 from "web3";
import { Web3ReactProvider } from "@web3-react/core";
import { EthersProvider } from "./hooks/EthersContext";

function getLibrary(provider, connector) {
  return new Web3(provider);
}

ReactDOM.render(
  <Provider {...store}>
    <Web3ReactProvider getLibrary={getLibrary}>
      <EthersProvider>
        <MuiThemeProvider theme={main}>
          <App />
        </MuiThemeProvider>
      </EthersProvider>
    </Web3ReactProvider>
  </Provider>,
  document.getElementById("root")
);

serviceWorker.unregister();
