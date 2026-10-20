import { useEffect, useRef } from 'react';
import { keyToAction } from '../lib/keys';

// Calls onAction for calculator keys pressed anywhere on the page.
// mapKey turns a key name into an action (or null); pass a stable function.
export const useKeyboard = (onAction, enabled = true, mapKey = keyToAction) => {
    const handlerRef = useRef(onAction);

    useEffect(() => {
        handlerRef.current = onAction;
    });

    useEffect(() => {
        if (!enabled) return undefined;
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            const action = mapKey(event.key);
            if (!action) return;
            // Stops Enter from also activating a focused button
            event.preventDefault();
            handlerRef.current(action);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled, mapKey]);
};
