import {recoverOnce} from "./recovery-authority.js";

export const recoverFromImport = (state, token) =>
  recoverOnce(state, "reconciliation", token);
