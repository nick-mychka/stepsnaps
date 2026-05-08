import { useState } from "react";

const STORAGE_KEY = "applications-heatmap";

const readStored = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
};

const writeStored = (value: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, String(value));
};

export function useHeatmap() {
  const [heatmap, setHeatmapState] = useState(readStored);

  const setHeatmap = (value: boolean) => {
    setHeatmapState(value);
    writeStored(value);
  };

  return { heatmap, setHeatmap };
}
