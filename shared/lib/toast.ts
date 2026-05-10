import originalToast, { Renderable, ToastOptions } from "react-hot-toast";

const toast = {
  ...originalToast,

  error: (message: Renderable, options?: ToastOptions) => {
    if (typeof message === "string" && message.trim() === "") {
      return "";
    }

    return originalToast.error(message, options);
  },

  success: (message: Renderable, options?: ToastOptions) => {
    if (typeof message === "string" && message.trim() === "") {
      return "";
    }
    return originalToast.success(message, options);
  },
};

export default toast;
