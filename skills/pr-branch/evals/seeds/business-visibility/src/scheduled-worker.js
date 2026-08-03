export const recoverFromSchedule = (state, token) => ({
  accepted: true,
  state: {...state, claimToken: token},
});
