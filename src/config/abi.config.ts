export const checkInAbi = [
  {
    inputs: [],
    name: "claimDaily",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserData",
    outputs: [
      { name: "currentStreak", type: "uint64" },
      { name: "highestStreak", type: "uint64" },
      { name: "totalCheckIns", type: "uint64" },
      { name: "totalZP", type: "uint128" },
      { name: "lastCheckInTime", type: "uint64" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;