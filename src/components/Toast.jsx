const Toast = ({ message }) => (
    <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-50 flex justify-center transition-opacity duration-200 ${
            message ? 'opacity-100' : 'opacity-0'
        }`}
    >
        {message && (
            <span className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-slate-900">
                {message}
            </span>
        )}
    </div>
);

export default Toast;
