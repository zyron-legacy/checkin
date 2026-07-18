export async function disconnectWallet() {
  try {
    // Clear app storage
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_address");
    localStorage.removeItem("selected_chain");

    sessionStorage.removeItem("wallet_connected");
    sessionStorage.removeItem("wallet_address");
    sessionStorage.removeItem("selected_chain");

    return {
      success: true,
      connected: false,
      address: null,
      chainId: null,
    };
  } catch (error) {
    console.error("Disconnect failed:", error);

    return {
      success: false,
      connected: true,
    };
  }
}