export function claimRenewal(state, token) {
  return {claimed: true, state: {...state, claimToken: token}};
}
