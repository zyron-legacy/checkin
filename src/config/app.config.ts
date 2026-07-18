export const APP_CONFIG = {
  // जिस वॉलेट में $0.05 की फीस जमा होगी
  feeCollectorAddress: "0xaEdEB9105C4Cb2A2f130465Aa6cEfd67b327f131", 
  
  // सर्विस फीस (USDC में, क्योंकि आपकी चेन का decimals: 6 है)
  // $0.05 = 5 * 10^4 = 50000 (6 decimals के हिसाब से)
  serviceFee: "50000", 
  
  // ऐप का नाम
  appName: "Daily Check-in DApp",
};