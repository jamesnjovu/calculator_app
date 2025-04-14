import React from 'react';

const CalculatorHistory = ({ history, darkMode, clearHistory }) => {
    const historyClass = darkMode
        ? "mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700 max-h-60 overflow-y-auto"
        : "mt-6 p-4 bg-gray-100 rounded-xl border border-gray-200 max-h-60 overflow-y-auto";

    const historyItemClass = darkMode
        ? "border-b border-gray-700 py-2 last:border-0"
        : "border-b border-gray-300 py-2 last:border-0";

    const historyTextClass = darkMode
        ? "text-gray-300"
        : "text-gray-700";

    const historyResultClass = darkMode
        ? "text-blue-400 font-semibold"
        : "text-blue-600 font-semibold";

    return (
        <div className={historyClass}>
            <div className="flex justify-between items-center mb-2">
                <h3 className={darkMode ? "text-gray-300 font-bold" : "text-gray-700 font-bold"}>
                    Calculation History
                </h3>
                <button
                    onClick={clearHistory}
                    className={darkMode ? "text-red-400 text-sm hover:text-red-300" : "text-red-500 text-sm hover:text-red-600"}
                >
                    Clear
                </button>
            </div>
            <div>
                {history.map((item, index) => (
                    <div key={index} className={historyItemClass}>
                        <div className={historyTextClass}>
                            {item.expression}
                        </div>
                        {item.result && (
                            <div className={historyResultClass}>
                                = {item.result}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalculatorHistory;
