import { useCallback, useState } from "react";

export function useForm<T extends object>(initial: T) {
  const [form, setForm] = useState<T>(initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  return { form, setForm, setField };
}
