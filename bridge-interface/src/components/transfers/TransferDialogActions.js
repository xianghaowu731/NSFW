import { inject, observer } from "mobx-react";
import React from "react";
import { DialogActions } from "@material-ui/core";
import useEthers from "@/hooks/EthersContext";
import { LoadingButton } from "@mui/lab";

export const _TransferDialogActions = ({
  transferRequest,
  transactionMap,
  resolveCurrentStep,
  setTransactionForKey,
  submitTransfer,
  completeTransfer,
  transferId,
}) => {
  const {
    network,
    payBridgingFee,
    swithMetamaskChain,
    bridgeTokens,
    approveTokensForTransfer,
    getTransactionByNetwork,
  } = useEthers();

  const stepBridgingFee = transactionMap.get("bridge:fee");
  const stepSourceTransferApproval = transactionMap.get(
    "bridge:source:approval"
  );
  const stepSourceTransfer = transactionMap.get("bridge:source");
  const stepSourceDest = transactionMap.get("bridge:destination");

  // --- Pay the bridging fee
  const handleBridgingFee = async () => {
    const transaction = await payBridgingFee("0.001");
    await setTransactionForKey("bridge:fee", transaction);
  };

  // --- Handle approval to to spend tokens
  const handleApproveTokenForTransfer = async () => {
    const approval = await approveTokensForTransfer(transferRequest);
    await setTransactionForKey("bridge:source:approval", approval);
  };

  // --- Start the bridging transaction
  const handleStartTransfer = async () => {
    const transaction = await bridgeTokens(transferRequest);
    await setTransactionForKey("bridge:source", transaction);
  };

  const handleCompleteTransfer = async () => {
    // --- Submit to Relayer
    const { destTransactionHash } = await submitTransfer(
      transferRequest,
      stepSourceTransfer.receipt.transactionHash.toString()
    );

    // --- fetch dest txn
    const transaction = await getTransactionByNetwork(
      transferRequest.to.toString(),
      destTransactionHash
    );
    await setTransactionForKey("bridge:destination", transaction);
  };

  // Resolve primary action
  let action;
  const currentStep = resolveCurrentStep();
  console.log("currentStep >>>", currentStep);
  console.log(`transferId`, transferId);

  //
  if (
    currentStep === "bridge:destination" &&
    stepSourceDest.isProcessing === false &&
    !stepSourceDest.completedAt
  ) {
    //
    handleCompleteTransfer();
  }

  switch (true) {
    // Always ensure we are on the correct network
    // Make sure we are on BSC testnet
    case transferRequest.from === "BSC" && ![97].includes(network.chainId):
      action = {
        handler: () => swithMetamaskChain(97),
        text: "Switch to BSC",
      };
      break;
    // Always ensure we are on the correct network
    // Make sure we are on Rinkeby
    case transferRequest.from === "ETH" && ![4].includes(network.chainId):
      action = {
        handler: () => swithMetamaskChain(4),
        text: "Switch to Rinkeby",
      };
      break;
    case currentStep === "bridge:fee":
      action = {
        handler: handleBridgingFee,
        text: "Pay bridging fee",
      };
      break;
    case currentStep === "bridge:source:approval":
      action = {
        handler: handleApproveTokenForTransfer,
        text: "Approve tokens for transaction",
      };
      break;
    case currentStep === "bridge:source":
      action = {
        handler: handleStartTransfer,
        text:
          transferRequest.from === "BSC"
            ? "Bridge tokens to ETH"
            : "Bridge tokens to BSC",
      };
      break;
    case currentStep === "bridge:destination":
      action = {
        handler: () => {},
        text:
          transferRequest.to === "BSC"
            ? "Releasing tokens from bridge"
            : "Minting your tokens",
      };
      break;
    case currentStep ===  "completed":
      action = {
        handler: () => {},
        text: "Completed???",
      };
      break;
    default:
      action = {
        handler: () => alert("Unable to resolve action..."),
        text: `Unable to resolve action [${currentStep}]`,
      };
      break;
  }

  return (
    <>
      <DialogActions style={{ alignItems: "center", justifyContent: "center" }}>
        <LoadingButton
          loading={
            stepBridgingFee.isProcessing ||
            stepSourceTransferApproval.isProcessing ||
            stepSourceTransfer.isProcessing
          }
          variant="contained"
          onClick={action.handler}
          sx={{
            marginTop: "24px",
            backgroundColor: "#7230FF",
            color: "white",
            "&:hover": {
              backgroundColor: "#8952ff",
            },
            "&.MuiLoadingButton-loading": {
              backgroundColor: "#7230FF",
            },
            // quickfix target the spinner
            "& > div": {
              color: "white",
            },
          }}
        >
          {action.text}
        </LoadingButton>
      </DialogActions>
    </>
  );
};

const mapMobxToProps = ({ transfer }) => {
  return {
    resolveCurrentStep: transfer.resolveCurrentStep,
    transferRequest: transfer.transferRequest,
    transactionMap: transfer.transactionMap,
    setTransactionForKey: transfer.setTransactionForKey,
    submitTransfer: transfer.submitTransfer,
    completeTransfer: transfer.completeTransfer,
    transferId: transfer.transferId,
  };
};

export const TransferDialogActions = inject(mapMobxToProps)(
  observer(_TransferDialogActions)
);
