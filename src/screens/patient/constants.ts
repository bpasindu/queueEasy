export const slotTimes = [
  "", // 0 index dummy
  "9:18 AM",
  "9:24 AM",
  "9:31 AM",
  "9:37 AM",
  "9:44 AM",
  "9:50 AM",
  "9:56 AM",
  "10:03 AM",
  "10:09 AM",
  "10:16 AM",
  "10:22 AM",
  "10:28 AM",
  "10:35 AM",
  "10:41 AM",
];

export const getWaitMinutes = (slotNum: number) => {
  const baseOffset = (slotNum - 1) * 6.4;
  const currentOffset = 13;
  const wait = baseOffset - currentOffset;
  return Math.max(1, Math.round(wait));
};
