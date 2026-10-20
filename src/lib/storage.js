// localStorage can be unavailable (private mode, blocked site data), so every
// access is guarded and falls back to the provided default.
export const loadJSON = (key, fallback) => {
    try {
        const raw = window.localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch {
        return fallback;
    }
};

export const saveJSON = (key, value) => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Persistence is a convenience; ignore storage failures.
    }
};
