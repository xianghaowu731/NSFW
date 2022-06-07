import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import { MoreHoriz } from "@mui/icons-material";
import { TimelineItemBridgeFee } from "./TimelineItemBridgeFee";
import { TimelineItemBridgeSource } from "./TimelineItemBridgeSource";
import { TimelineItemBridgeDestination } from "./TimelineItemBridgeDestination";
import { timeAgo } from "@/helpers";
import { DateTime } from "luxon";
import { TimelineDot } from "@mui/lab";
import { CheckIcon } from "@/icons/CheckIcon";

// this is stupid but cant get the variants for mui/typography to work well enough
export const heading1Styles = {
  fontSize: "38px",
  lineHeight: "48px",
  fontWeight: 600,
  "@media (max-width: 960px)": {
    fontSize: "28px",
  },
};
export const body1Styles = {
  margin: 0,
  color: "#898EA2",
  fontSize: "16px",
  lineHeight: "28px",
  fontWeight: 400,
};
export const body2Styles = {
  margin: 0,
  fontSize: "14px",
  lineHeight: "20px",
  fontWeight: 400,
  fontFamily: "Inter",
};
export const captionStyles = {
  margin: 0,
  fontSize: "13px",
  lineHeight: "16px",
  color: "#898EA2",
  fontWeight: 400,
  fontFamily: "Inter",
};

export const linkStyles = {
  fontSize: "13px",
  lineHeight: "16px",
  color: "#8253E7",
};

export const timelineContentStyles = {
  paddingLeft: "20px",
  maxWidth: "380px",
};

export const TransferItemStatus = ({ completedAt,isProcessing }) => {
  const [duration, setDuration] = React.useState();

  React.useEffect(() => {
    if (completedAt) {
      const interval = setInterval(() => {
        setDuration(timeAgo(DateTime.fromJSDate(completedAt)));
      }, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [completedAt]);

  return (
    <>
      {completedAt ? (
        <p style={{ ...captionStyles, color: "white" }}>Completed</p>
      ) : isProcessing ?   
        <p style={{ ...captionStyles, color: "white" }}>Processing....</p> : 
      (
        <p style={{ ...captionStyles, color: "white" }}>Not Started</p>
      )}
      <p style={{ ...captionStyles, marginTop: "4px" }}>{duration}</p>
    </>
  );
};

export const TransferItemTitle = ({ icon, children }) => (
  <div style={{ display: "flex" }}>
    {icon}
    <p style={{ ...body2Styles, marginLeft: "8px", color: "white" }}>
      {children}
    </p>
  </div>
);

export const TransferTimelineStep = ({ completed }) => (
  <TimelineDot
    sx={{
      backgroundColor: "transparent",
      padding: "0",
      margin: "4px 0 5px 0",
      display: "flex",
      alignContent: "center",
    }}
  >
    {completed && <CheckIcon style={{ width: "28px", height: "28px" }} />}
    {!completed && <MoreHoriz />}
  </TimelineDot>
);

export const TransferTimeline = () => {
  return (
    <Timeline position="right">
      <TimelineItemBridgeFee />
      <TimelineItemBridgeSource />
      <TimelineItemBridgeDestination />
    </Timeline>
  );
};
