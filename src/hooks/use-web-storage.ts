import { useCallback, useEffect, useState } from 'react';

type StorageType = 'local' | 'session';

const CUSTOM_EVENT_NAME = 'web-storage-update' as const;

declare global {
  interface WindowEventMap {
    [CUSTOM_EVENT_NAME]: CustomEvent;
  }
}

function getStorageValue<ValueType>(
  key: string,
  storageType?: StorageType,
  defaultValue?: ValueType
) {
  const storage = storageType === 'session' ? window.sessionStorage : window.localStorage;

  try {
    const value = storage.getItem(key);

    if (value) {
      return JSON.parse(value);
    } else {
      return defaultValue;
    }
  } catch {
    return defaultValue;
  }
}

export function useWebStorage<ValueType>(
  key: string,
  storageType?: StorageType,
  defaultValue?: ValueType
) {
  const [storeValue, setStoreValue] = useState<ValueType>(
    getStorageValue(key, storageType, defaultValue)
  );

  const setValue = (valueOrFn: ValueType | ((previousValue: ValueType) => ValueType)) => {
    setStoreValue((previousValue) => {
      let newValue: ValueType;

      if (typeof valueOrFn === 'function') {
        newValue = (valueOrFn as (previousValue: ValueType) => ValueType)(previousValue);
      } else {
        newValue = valueOrFn;
      }

      const store = storageType === 'session' ? window.sessionStorage : window.localStorage;

      store.setItem(key, JSON.stringify(newValue));

      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent<{ key: string }>(CUSTOM_EVENT_NAME, { detail: { key } })
        );
      }, 0);

      return newValue;
    });
  };

  const onStorageChange = useCallback(
    (e: StorageEvent | CustomEvent) => {
      const eventKey = (e as StorageEvent).key || (e as CustomEvent<{ key: string }>)?.detail?.key;

      if (!eventKey || eventKey !== key) {
        return;
      }

      setStoreValue(getStorageValue(key, storageType, defaultValue));
    },
    [defaultValue, key, storageType]
  );

  const clearValue = useCallback(() => {
    const store = storageType === 'session' ? window.sessionStorage : window.localStorage;

    store.removeItem(key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    window.addEventListener('storage', onStorageChange);
    window.addEventListener(CUSTOM_EVENT_NAME, onStorageChange);

    return () => {
      window.removeEventListener('storage', onStorageChange);
      window.removeEventListener(CUSTOM_EVENT_NAME, onStorageChange);
    };
  }, [key, onStorageChange]);

  return [storeValue, setValue, clearValue] as const;
}
