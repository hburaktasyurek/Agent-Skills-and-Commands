export const retryForCustomer = (state, token) => ({
  accepted: true,
  state: {...state, claimToken: token},
});
