const units = ["year", "month", "week", "day", "hour", "minute", "second"];

export const timeAgo = (dateTime) => {
  const diff = dateTime.diffNow().shiftTo(...units);
  const unit = units.find((unit) => diff.get(unit) !== 0) || "second";

  const relativeFormatter = new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  });
  return relativeFormatter.format(Math.trunc(diff.as(unit)), unit);
};

export const networkName = (network) => {
  switch (network.toUpperCase()) {
    case "ETH":
      return "Ethereum";
    case "BSC":
      return "Binance";
    default:
      throw new Error(`Unsupported network [${network}]`);
  }
};
