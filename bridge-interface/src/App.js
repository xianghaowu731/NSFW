import React from "react";

import { Header, TransferDialog } from "@/components";
import { Bridge } from "./components/Bridge";
import { Container } from "react-bootstrap";

export const App = () => (
  <div style={{ backgroundColor: "#1B1C20", height: "100vh" }}>
    <Header />
    <Container
      fluid
      style={{
        height: "calc(100vh - 100px)",
        overflow: "scroll",
        scrollbarWidth: 0,
      }}
    >
      <Bridge />
    </Container>
    <TransferDialog />
  </div>
);
