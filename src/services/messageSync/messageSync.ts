import axiosInstance from "../API/axiosInstans";

export const setupMessageSync = () => {
  const sync = async () => {
    try {
      const lastMessageId = localStorage.getItem("lastMessageId");

      const res = await axiosInstance.get(
        `/messages?after=${lastMessageId}`
      );

      // update UI/store here
      console.log("📩 Synced messages:", res.data);
    } catch (err) {
      console.log("Sync error", err);
    }
  };

  window.addEventListener("socket:connected", sync);
  window.addEventListener("sync:messages", sync);
};