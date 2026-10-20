import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../lib/storage';

// useState backed by localStorage. Saved values failing `isValid` are ignored.
export const usePersistentState = (key, defaultValue, isValid = () => true) => {
    const [value, setValue] = useState(() => {
        const saved = loadJSON(key, defaultValue);
        return isValid(saved) ? saved : defaultValue;
    });

    useEffect(() => {
        saveJSON(key, value);
    }, [key, value]);

    return [value, setValue];
};
