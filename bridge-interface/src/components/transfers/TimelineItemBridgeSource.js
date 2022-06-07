import { inject, observer } from "mobx-react";
import React from "react";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
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

const _TimelineItemBridgeSource = ({
  transferRequest,
  resolveCurrentStep,
  isCompleted,
  transaction,
  isProcessing,
  createdAt,
  completedAt,
  receipt,
  allowance,
  isApproved,
  isApprovalProcessing,
}) => {
  const isCurrentStep = resolveCurrentStep() === "bridge:source";
  console.log(`isCurrentStep`, isCurrentStep);

  return (
    <>
    <TimelineItem sx={!completedAt && !isProcessing ? {opacity:'0.5',minHeight: "130px" } : {opacity:'1',minHeight: "130px" }}>
      <TimelineOppositeContent
        sx={{ m: "2px 0", paddingRight: "20px", maxWidth: "140px" }}
        align="right"
        color="white"
      >
        <TransferItemStatus completedAt={isApproved} isProcessing={isApprovalProcessing} approved={isApproved}/>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector sx={{ maxHeight: "0" }} />
        <TransferTimelineStep />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={timelineContentStyles}>
        <TransferItemTitle
          icon={
            transferRequest.from === "ETH" ? <ETHLogoIcon /> : <BSCLogoIcon />
          }
        >
          Approve Tokens
        </TransferItemTitle>
        <div style={{ marginTop: "12px" }}>
          {!completedAt && (
            <p style={captionStyles}>
              {transferRequest.from === "BSC" && <>Approving token amount</>}
              {transferRequest.from === "ETH" && <>Burning tokens</>}
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

    <TimelineItem sx={!completedAt && !isProcessing ? {opacity:'0.5',minHeight: "130px" } : {opacity:'1',minHeight: "130px" }}>
      <TimelineOppositeContent
        sx={{ m: "2px 0", paddingRight: "20px", maxWidth: "140px" }}
        align="right"
        color="white"
      >
        <TransferItemStatus completedAt={completedAt} isProcessing={isProcessing} />
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineConnector sx={{ maxHeight: "0" }} />
        <TransferTimelineStep />
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent sx={timelineContentStyles}>
        <TransferItemTitle
          icon={
            transferRequest.from === "ETH" ? <ETHLogoIcon /> : <BSCLogoIcon />
          }
        >
          Source network
        </TransferItemTitle>
        <div style={{ marginTop: "12px" }}>
          {!completedAt && (
            <p style={captionStyles}>
              {transferRequest.from === "BSC" && <>Locking tokens on bridge</>}
              {transferRequest.from === "ETH" && <>Burning tokens</>}
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
    </>
  );
};

const mapMobxToProps = ({ transfer }) => {
  const record = transfer.transactionMap.get("bridge:source");
  const approved = transfer.transactionMap.get("bridge:source:approval")
  return {
    transferRequest: transfer.transferRequest,
    resolveCurrentStep: transfer.resolveCurrentStep,
    isCompleted: record.isCompleted,
    transaction: record.transaction,
    isProcessing: record.isProcessing,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
    allowance: record.allowance,
    receipt: record.receipt,
    isApproved:approved.completedAt,
    isApprovalProcessing: approved.isProcessing,
  }
};

export const TimelineItemBridgeSource = inject(mapMobxToProps)(
  observer(_TimelineItemBridgeSource)
);
