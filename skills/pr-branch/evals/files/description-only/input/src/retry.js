export function scheduleRetry(state) {
  if (state.retryScheduled) return state;
  return {...state, retryScheduled: true};
}
