export function claimRenewal(state, token) {
  if (state.claimToken) return {claimed: false, state};
  return {claimed: true, state: {...state, claimToken: token}};
}
