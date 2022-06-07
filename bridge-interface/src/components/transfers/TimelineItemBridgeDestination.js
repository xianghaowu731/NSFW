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

const _TimelineItemBridgeDestination = ({
  transferRequest,
  resolveCurrentStep,
  isCompleted,
  transaction,
  isProcessing,
  createdAt,
  completedAt,
}) => {
  const isCurrentStep = resolveCurrentStep() === "bridge:destination";
  console.log(`isCurrentStep`, isCurrentStep);

  return (
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
      </TimelineSeparator>
      <TimelineContent sx={timelineContentStyles}>
        <TransferItemTitle
          icon={
            transferRequest.from === "BSC" ? <ETHLogoIcon /> : <BSCLogoIcon />
          }
        >
          Destination network
        </TransferItemTitle>
        <div style={{ marginTop: "12px" }}>
          {!completedAt && (
            <p style={captionStyles}>Waiting for tokens to be minted.</p>
          )}
          {completedAt && (
            <>
              <p style={captionStyles}>
                Eu molestie urna mi pharetra tortor non suspendisse molestie.
                Vivamus commodo diam ma
              </p>
              <a href="/#todo" style={linkStyles}>
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
  const record = transfer.transactionMap.get("bridge:destination");
  return {
    transferRequest: transfer.transferRequest,
    resolveCurrentStep: transfer.resolveCurrentStep,
    isCompleted: record.isCompleted,
    transaction: record.transaction,
    isProcessing: record.isProcessing,
    createdAt: record.createdAt,
    completedAt: record.completedAt,
  };
};

export const TimelineItemBridgeDestination = inject(mapMobxToProps)(
  observer(_TimelineItemBridgeDestination)
);
