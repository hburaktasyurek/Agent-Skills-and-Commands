import {recoverOnce} from "./recovery-authority.js";

export const retryForCustomer = (state, token) =>
  recoverOnce(state, "customer", token);
