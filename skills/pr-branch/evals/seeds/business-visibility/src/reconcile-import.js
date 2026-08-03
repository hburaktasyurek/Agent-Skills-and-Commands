export const recoverFromImport = (state, token) => ({
  accepted: true,
  state: {...state, claimToken: token},
});
