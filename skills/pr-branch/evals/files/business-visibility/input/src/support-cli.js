import {recoverOnce} from "./recovery-authority.js";

export const recoverFromSupport = (state, token) =>
  recoverOnce(state, "support", token);
