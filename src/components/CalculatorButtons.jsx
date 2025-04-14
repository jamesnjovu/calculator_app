import React from 'react';

const CalculatorButtons = ({
    darkMode,
    handleNumberClick,
    handleOperatorClick,
    handleEquals,
    handleClear,
    handleDecimal,
    handleBackspace,
    handleScientificFunction,
    handleMemoryStore,
    handleMemoryRecall,
    handleMemoryClear,
    handleMemoryAdd,
}) => {
    // Button classes based on theme
    const memoryBtnClass = darkMode
        ? "btn col-span-1 bg-gray-800 text-gray-200 p-3 rounded-lg hover:bg-gray-700 transition-colors shadow-md"
        : "btn col-span-1 bg-gray-200 text-gray-800 p-3 rounded-lg hover:bg-gray-300 transition-colors shadow-md";

    const scientificBtnClass = darkMode
        ? "btn col-span-1 bg-indigo-900 text-gray-200 p-3 rounded-lg hover:bg-indigo-800 transition-colors shadow-md"
        : "btn col-span-1 bg-indigo-100 text-indigo-800 p-3 rounded-lg hover:bg-indigo-200 transition-colors shadow-md";

    const numberBtnClass = darkMode
        ? "btn col-span-1 bg-gray-700 text-white p-3 rounded-lg hover:bg-gray-600 transition-colors shadow-md"
        : "btn col-span-1 bg-gray-100 text-gray-800 p-3 rounded-lg hover:bg-gray-200 transition-colors shadow-md";

    const operatorBtnClass = darkMode
        ? "btn col-span-1 bg-purple-700 text-white p-3 rounded-lg hover:bg-purple-600 transition-colors shadow-md"
        : "btn col-span-1 bg-purple-100 text-purple-800 p-3 rounded-lg hover:bg-purple-200 transition-colors shadow-md";

    const equalsBtnClass = darkMode
        ? "btn col-span-1 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500 transition-colors shadow-md"
        : "btn col-span-1 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md";

    const clearBtnClass = darkMode
        ? "btn col-span-1 bg-red-700 text-white p-3 rounded-lg hover:bg-red-600 transition-colors shadow-md"
        : "btn col-span-1 bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition-colors shadow-md";

    return (
        <div className="grid grid-cols-5 gap-3">
            {/* Memory row */}
            <button onClick={handleMemoryStore} className={memoryBtnClass}>
                MS
            </button>
            <button onClick={handleMemoryRecall} className={memoryBtnClass}>
                MR
            </button>
            <button onClick={handleMemoryClear} className={memoryBtnClass}>
                MC
            </button>
            <button onClick={handleMemoryAdd} className={memoryBtnClass}>
                M+
            </button>
            <button onClick={handleClear} className={clearBtnClass}>
                C
            </button>

            {/* Scientific functions row 1 */}
            <button onClick={() => handleScientificFunction('sin')} className={scientificBtnClass}>
                sin
            </button>
            <button onClick={() => handleScientificFunction('cos')} className={scientificBtnClass}>
                cos
            </button>
            <button onClick={() => handleScientificFunction('tan')} className={scientificBtnClass}>
                tan
            </button>
            <button onClick={() => handleScientificFunction('log')} className={scientificBtnClass}>
                log
            </button>
            <button onClick={() => handleScientificFunction('ln')} className={scientificBtnClass}>
                ln
            </button>

            {/* Scientific functions row 2 */}
            <button onClick={() => handleScientificFunction('sqrt')} className={scientificBtnClass}>
                √
            </button>
            <button onClick={() => handleScientificFunction('1/x')} className={scientificBtnClass}>
                1/x
            </button>
            <button onClick={() => handleScientificFunction('x^2')} className={scientificBtnClass}>
                x²
            </button>
            <button onClick={() => handleScientificFunction('pi')} className={scientificBtnClass}>
                π
            </button>
            <button onClick={() => handleScientificFunction('e')} className={scientificBtnClass}>
                e
            </button>

            {/* Main calculator pad */}
            <button onClick={() => handleNumberClick('7')} className={numberBtnClass}>
                7
            </button>
            <button onClick={() => handleNumberClick('8')} className={numberBtnClass}>
                8
            </button>
            <button onClick={() => handleNumberClick('9')} className={numberBtnClass}>
                9
            </button>
            <button onClick={handleBackspace} className={memoryBtnClass}>
                ⌫
            </button>
            <button onClick={() => handleOperatorClick('÷')} className={operatorBtnClass}>
                ÷
            </button>

            <button onClick={() => handleNumberClick('4')} className={numberBtnClass}>
                4
            </button>
            <button onClick={() => handleNumberClick('5')} className={numberBtnClass}>
                5
            </button>
            <button onClick={() => handleNumberClick('6')} className={numberBtnClass}>
                6
            </button>
            <button onClick={() => handleOperatorClick('(')} className={scientificBtnClass}>
                (
            </button>
            <button onClick={() => handleOperatorClick('×')} className={operatorBtnClass}>
                ×
            </button>

            <button onClick={() => handleNumberClick('1')} className={numberBtnClass}>
                1
            </button>
            <button onClick={() => handleNumberClick('2')} className={numberBtnClass}>
                2
            </button>
            <button onClick={() => handleNumberClick('3')} className={numberBtnClass}>
                3
            </button>
            <button onClick={() => handleOperatorClick(')')} className={scientificBtnClass}>
                )
            </button>
            <button onClick={() => handleOperatorClick('−')} className={operatorBtnClass}>
                −
            </button>

            <button onClick={() => handleNumberClick('0')} className={numberBtnClass}>
                0
            </button>
            <button onClick={handleDecimal} className={numberBtnClass}>
                .
            </button>
            <button onClick={() => handleOperatorClick('^')} className={scientificBtnClass}>
                x^y
            </button>
            <button onClick={() => handleOperatorClick('+')} className={operatorBtnClass}>
                +
            </button>
            <button onClick={handleEquals} className={equalsBtnClass}>
                =
            </button>
        </div>
    );
};

export default CalculatorButtons;
