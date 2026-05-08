import { useSyncExternalStore } from "react";

const STORAGE_KEY = "applications-heatmap";

const subscribe = (callback: () => void) => {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getSnapshot = () => window.localStorage.getItem(STORAGE_KEY) === "true";

const getServerSnapshot = () => false;

export function useHeatmap() {
  const heatmap = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setHeatmap = (value: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
  };

  return { heatmap, setHeatmap };
}
