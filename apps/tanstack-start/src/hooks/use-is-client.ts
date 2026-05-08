import { useSyncExternalStore } from "react";

const noop = () => undefined;
const subscribeNoop = () => noop;
const getTrue = () => true;
const getFalse = () => false;

export function useIsClient() {
  return useSyncExternalStore(subscribeNoop, getTrue, getFalse);
}
