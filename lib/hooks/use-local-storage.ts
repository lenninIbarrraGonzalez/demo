import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // Retrieve from localStorage on mount
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
      }
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Save state
      setStoredValue(value);
      // Save to localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}
