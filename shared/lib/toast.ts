import type { ReactNode } from "react";
import { type ExternalToast, toast as sonner } from "sonner";

const toast = {
  ...sonner,

  error: (message: ReactNode, options?: ExternalToast) => {
    if (typeof message === "string" && message.trim() === "") {
      return "";
    }

    return sonner.error(message, options);
  },

  success: (message: ReactNode, options?: ExternalToast) => {
    if (typeof message === "string" && message.trim() === "") {
      return "";
    }

    return sonner.success(message, options);
  },
};

export default toast;
