import { useSyncExternalStore } from 'react';
import { type MRT_SliceStore } from '../utils/mrtStore';

export const useMRT_SliceValue = <T, R>(
  store: MRT_SliceStore<T>,
  selector: (value: T) => R,
): R => {
  const getSnapshot = () => selector(store.get());
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};
