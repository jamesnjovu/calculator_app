import React from 'react';

const CalculatorDisplay = ({ display, expression, darkMode }) => {
    const displayClass = darkMode
        ? "mb-6 p-4 bg-gray-800 rounded-xl text-right h-24 flex flex-col justify-end border border-gray-700"
        : "mb-6 p-4 bg-gray-100 rounded-xl text-right h-24 flex flex-col justify-end border border-gray-200";

    const expressionClass = darkMode
        ? "text-gray-400 text-sm h-6 overflow-x-auto whitespace-nowrap"
        : "text-gray-500 text-sm h-6 overflow-x-auto whitespace-nowrap";

    const resultClass = darkMode
        ? "text-3xl font-bold text-white overflow-x-auto whitespace-nowrap"
        : "text-3xl font-bold text-gray-800 overflow-x-auto whitespace-nowrap";

    return (
        <div className={displayClass}>
            <div className={expressionClass}>
                {expression}
            </div>
            <div className={resultClass}>
                {display}
            </div>
        </div>
    );
};

export default CalculatorDisplay;
