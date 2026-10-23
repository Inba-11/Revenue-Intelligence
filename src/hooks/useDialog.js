import { useCallback, useState } from 'react';

export default function useDialog(initial = false) {
  const [open, setOpen] = useState(initial);
  return { open, show: useCallback(() => setOpen(true), []), hide: useCallback(() => setOpen(false), []) };
}
