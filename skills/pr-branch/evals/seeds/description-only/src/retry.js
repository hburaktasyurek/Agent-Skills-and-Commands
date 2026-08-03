export function scheduleRetry(state) {
  return {...state, retryScheduled: true};
}
