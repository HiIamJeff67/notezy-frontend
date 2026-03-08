export type RedirectState = {
  csrfToken: string;
  action: "register" | "login" | "binding";
  from: string;
};
