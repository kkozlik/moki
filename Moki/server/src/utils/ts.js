// ts.js hold some timestamps logic

function getTimestampBucket(timestamp_gte, timestamp_lte) {
  // timestamp < 15 min, bucket 15s
  if (timestamp_lte - timestamp_gte <= (15 * 60 * 1000)) {
    return "15s";
  } else if (timestamp_lte - timestamp_gte <= (60 * 60 * 1000)) {
    return "1m";
    // timestamp < 1 hour, bucket 1min
  } else if (timestamp_lte - timestamp_gte <= (6 * 60 * 60 * 1000)) {
    return "5m";
    // timestamp < 6 hour, bucket 5min
  } else if (timestamp_lte - timestamp_gte <= (12 * 60 * 60 * 1000)) {
    return "10m";
    // timestamp < 12 hour, bucket 10min
  } else if (timestamp_lte - timestamp_gte <= (24 * 60 * 60 * 1000)) {
    return "30m";
    // timestamp < 1 day, bucket 30min
  } else if (timestamp_lte - timestamp_gte <= (72 * 60 * 60 * 1000)) {
    return "1h";
    // timestamp < 3 day, bucket 1 hour
  } else if (timestamp_lte - timestamp_gte <= (168 * 60 * 60 * 1000)) {
    return "3h";
    // timestamp < 7 day, bucket 3 hours
  } else {
    return "12h";
    // timestamp > 30 day, bucket 12 hours
  }
}

module.exports = {
  getTimestampBucket: getTimestampBucket,
  timestamp_gte: (Math.round(new Date().getTime() / 1000) - (6 * 3600)) * 1000,
  timestamp_lte: Math.round(new Date().getTime())
};
