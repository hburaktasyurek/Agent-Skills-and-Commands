import {recoverOnce} from "./recovery-authority.js";

export const recoverFromSchedule = (state, token) =>
  recoverOnce(state, "schedule", token);
