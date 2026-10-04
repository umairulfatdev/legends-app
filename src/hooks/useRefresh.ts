import { useState, useCallback } from "react";

export function useRefresh(loadFunction: () => Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFunction();
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  }, [loadFunction]);

  return { refreshing, onRefresh };
}