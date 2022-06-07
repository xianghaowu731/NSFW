import { inject, observer } from "mobx-react";
import React from "react";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import { networkName } from "@/helpers";
import {
  captionStyles,
  linkStyles,
  timelineContentStyles,
  TransferItemStatus,
  TransferItemTitle,
  TransferTimelineStep,
} from "./TransferTimeline";
import { ETHLogoIcon } from "@/icons/ETHLogoIcon";
import { BSCLogoIcon } from "@/icons/BSCLogoIcon";
import { viewTransactionUrl } from "@/helpers/viewTransactionUrl";

export const _TimelineItemBridgeFee = ({
  transferRequest,
  resolveCurrentStep,
  completedAt,
  isProcessing,
  receipt,
}) => {
  // STUBS
  transferRequest = {};
  transferRequest.from = "BSC";
  transferRequest.to = "ETH";
  const isCurrentStep = resolveCurrentStep() === "bridge:fee";
  console.log(`isCurrentStep`, isCurrentStep);

  return (
    <TimelineItem sx={!completedAt && !isProcessing ? {opacity:'0.5',minHeight: "130px" } : {opacity:'1',minHeight: "130px" }}>
      <TimelineOppositeContent
        sx={{
          m: "auto 0",
          marginTop: "2px",
          paddingRight: "20px",
          maxWidth: "140px",
        }}
        align="right"
        color="white"
      >
        <TransferItemStatus completedAt={completedAt} isProcessing={isProcessing}/>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TransferTimelineStep completed={completedAt} />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={timelineContentStyles}>
        <TransferItemTitle
          icon={
            transferRequest.from === "ETH" ? <ETHLogoIcon /> : <BSCLogoIcon />
          }
        >
          Bridging fee
        </TransferItemTitle>
        <div style={{ margin: "12px" }}>
          {!completedAt && (
            <p style={captionStyles}>
              This fee accounts for the cost to mint your tokens on{" "}
              {networkName(transferRequest.to)}
            </p>
          )}
          {completedAt && (
            <>
              <p style={captionStyles}>
                Eu molestie urna mi pharetra tortor non suspendisse molestie.
                Vivamus commodo diam ma
              </p>
              <a
                href={viewTransactionUrl(
                  transferRequest.from,
                  receipt.transactionHash
                )}
                style={linkStyles}
              >
                View transaction
              </a>
            </>
          )}
        </div>
      </TimelineContent>
    </TimelineItem>
  );
};

const mapMobxToProps = ({ transfer }) => {
  const record = transfer.transactionMap.get("bridge:fee");

  return {
    transferRequest: transfer.transferRequest,
    resolveCurrentStep: transfer.resolveCurrentStep,
    isCompleted: record.isCompleted,
    transaction: record.transaction,
    isProcessing: record.isProcessing,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
    receipt: record.receipt,
  };
};

export const TimelineItemBridgeFee = inject(mapMobxToProps)(
  observer(_TimelineItemBridgeFee)
);
