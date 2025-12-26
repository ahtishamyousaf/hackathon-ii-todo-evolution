import { useState, useEffect } from "react";
import type { FilterPreset } from "@/components/FilterPanel";

const STORAGE_KEY = "task-filter-presets";

export function useFilterPresets() {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPresets(parsed);
      }
    } catch (err) {
      console.error("Failed to load filter presets:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Save presets to localStorage whenever they change
  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
      } catch (err) {
        console.error("Failed to save filter presets:", err);
      }
    }
  }, [presets, loaded]);

  const savePreset = (preset: FilterPreset) => {
    setPresets((prev) => [...prev, preset]);
  };

  const deletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
  };

  const updatePreset = (presetId: string, updates: Partial<FilterPreset>) => {
    setPresets((prev) =>
      prev.map((p) => (p.id === presetId ? { ...p, ...updates } : p))
    );
  };

  return {
    presets,
    savePreset,
    deletePreset,
    updatePreset,
  };
}
