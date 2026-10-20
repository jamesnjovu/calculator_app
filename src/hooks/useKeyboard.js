import { useEffect, useRef } from 'react';
import { keyToAction } from '../lib/keys';

// Calls onAction for calculator keys pressed anywhere on the page.
export const useKeyboard = (onAction, enabled = true) => {
    const handlerRef = useRef(onAction);

    useEffect(() => {
        handlerRef.current = onAction;
    });

    useEffect(() => {
        if (!enabled) return undefined;
        const handleKeyDown = (event) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            const action = keyToAction(event.key);
            if (!action) return;
            // Stops Enter from also activating a focused button
            event.preventDefault();
            handlerRef.current(action);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [enabled]);
};
