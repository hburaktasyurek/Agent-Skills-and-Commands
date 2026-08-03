export const recoverFromSupport = (state, token) => ({
  accepted: true,
  state: {...state, claimToken: token},
});
