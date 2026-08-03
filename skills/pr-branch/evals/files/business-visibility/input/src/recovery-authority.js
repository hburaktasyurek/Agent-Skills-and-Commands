export function recoverOnce(state, source, token) {
  if (state.claimToken) {
    return {
      accepted: false,
      state,
      audit: {source, outcome: "already_claimed"},
    };
  }

  return {
    accepted: true,
    state: {...state, claimToken: token},
    audit: {source, outcome: "accepted"},
  };
}
