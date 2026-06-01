import { useCallback, useRef, useState } from "react";

interface UndoableApi<T> {
  value: T;
  set: (next: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (next: T) => void;
}

/**
 * 提供 undo/redo 的本機歷史堆疊（白板、計分板、座位表等狀態型工具）。
 * 不接 localStorage；歷史僅存在於目前工具的生命週期內。
 */
export function useUndoableState<T>(initial: T, limit = 50): UndoableApi<T> {
  const [value, setValue] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const [, force] = useState(0);
  const rerender = useCallback(() => force((n) => n + 1), []);

  const set = useCallback(
    (next: T) => {
      past.current = [...past.current, value].slice(-limit);
      future.current = [];
      setValue(next);
      rerender();
    },
    [value, limit, rerender]
  );

  const undo = useCallback(() => {
    if (!past.current.length) return;
    const previous = past.current[past.current.length - 1];
    past.current = past.current.slice(0, -1);
    future.current = [value, ...future.current];
    setValue(previous);
    rerender();
  }, [value, rerender]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    const next = future.current[0];
    future.current = future.current.slice(1);
    past.current = [...past.current, value];
    setValue(next);
    rerender();
  }, [value, rerender]);

  const reset = useCallback(
    (next: T) => {
      past.current = [];
      future.current = [];
      setValue(next);
      rerender();
    },
    [rerender]
  );

  return { value, set, undo, redo, reset, canUndo: past.current.length > 0, canRedo: future.current.length > 0 };
}
