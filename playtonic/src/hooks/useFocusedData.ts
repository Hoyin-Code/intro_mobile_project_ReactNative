import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

export function useFocusedData<T>(loader: () => Promise<T | null>): {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const result = await loader();
    setData(result);
  }, [loader]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }, [loadData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  return { data, loading, refreshing, onRefresh };
}
