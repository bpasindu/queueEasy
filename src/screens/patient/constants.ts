export const clinics = [
  {
    id: 1,
    doctor: 'Dr. Silva',
    specialty: 'General Physician',
    clinic: 'Nugegoda Clinic',
    inQueue: 5,
    eta: 18,
  },
  {
    id: 2,
    doctor: 'Dr. Fernando',
    specialty: 'Pediatrician',
    clinic: 'Maharagama Medical',
    inQueue: 12,
    eta: 32,
  },
  {
    id: 3,
    doctor: 'Dr. Jayasinghe',
    specialty: 'ENT',
    clinic: 'Colombo 05',
    inQueue: 3,
    eta: 12,
  },
];

export const slotTimes = [
  "", // 0 index dummy
  "9:18 AM",
  "9:24.400000000000003 AM",
  "9:30.799999999999955 AM",
  "9:37.20000000000004 AM",
  "9:43.599999999999991 AM",
  "9:50 AM",
  "9:56.40000000000009 AM",
  "10:2.799999999999954 AM",
  "10:9.199999999999818 AM",
  "10:15.599999999999909 AM",
  "10:22 AM",
  "10:28.400000000000009 AM",
  "10:34.800000000000018 AM",
  "10:41.199999999999982 AM",
];

export const getWaitMinutes = (slotNum: number) => {
  const baseOffset = (slotNum - 1) * 6.4;
  const currentOffset = 13;
  const wait = baseOffset - currentOffset;
  return Math.max(1, Math.round(wait));
};
