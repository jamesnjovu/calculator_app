import React, { useState } from 'react';
import * as math from 'mathjs';

const ScientificCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');
    const [memory, setMemory] = useState(null);
    const [clearNext, setClearNext] = useState(false);

    const handleNumberClick = (num) => {
        if (clearNext) {
            setDisplay(num);
            setExpression(num);
            setClearNext(false);
        } else {
            if (display === '0') {
                setDisplay(num);
                setExpression(num);
            } else {
                setDisplay(display + num);
                setExpression(expression + num);
            }
        }
    };

    const handleOperatorClick = (operator) => {
        setClearNext(false);

        // Map operators to their mathjs equivalents
        const operatorMap = {
            '×': '*',
            '÷': '/',
            '−': '-',
            '+': '+',
            '^': '^',
        };

        const mathOperator = operatorMap[operator] || operator;

        setExpression(expression + mathOperator);
        setDisplay(display + operator);
    };

    const handleClear = () => {
        setDisplay('0');
        setExpression('');
        setClearNext(false);
    };

    const handleEquals = () => {
        try {
            const result = math.evaluate(expression);
            setDisplay(result.toString());
            setExpression(result.toString());
            setClearNext(true);
        } catch (error) {
            setDisplay('Error');
            setClearNext(true);
        }
    };

    const handleDecimal = () => {
        if (clearNext) {
            setDisplay('0.');
            setExpression('0.');
            setClearNext(false);
        } else if (!display.includes('.')) {
            setDisplay(display + '.');
            setExpression(expression + '.');
        }
    };

    const handleMemoryStore = () => {
        try {
            const currentValue = math.evaluate(expression);
            setMemory(currentValue);
        } catch (error) {
            // Do nothing if expression is invalid
        }
    };

    const handleMemoryRecall = () => {
        if (memory !== null) {
            setDisplay(memory.toString());
            setExpression(memory.toString());
            setClearNext(true);
        }
    };

    const handleMemoryClear = () => {
        setMemory(null);
    };

    const handleMemoryAdd = () => {
        if (memory !== null) {
            try {
                const currentValue = math.evaluate(expression);
                setMemory(memory + currentValue);
            } catch (error) {
                // Do nothing if expression is invalid
            }
        } else {
            handleMemoryStore();
        }
    };

    const handleBackspace = () => {
        if (display.length > 1) {
            setDisplay(display.slice(0, -1));
            setExpression(expression.slice(0, -1));
        } else {
            setDisplay('0');
            setExpression('');
        }
    };

    const handleScientificFunction = (func) => {
        try {
            let result;
            const currentValue = parseFloat(display);

            switch (func) {
                case 'sin':
                    result = math.sin(currentValue);
                    break;
                case 'cos':
                    result = math.cos(currentValue);
                    break;
                case 'tan':
                    result = math.tan(currentValue);
                    break;
                case 'log':
                    result = math.log10(currentValue);
                    break;
                case 'ln':
                    result = math.log(currentValue);
                    break;
                case 'sqrt':
                    result = math.sqrt(currentValue);
                    break;
                case '1/x':
                    result = 1 / currentValue;
                    break;
                case 'x^2':
                    result = math.pow(currentValue, 2);
                    break;
                case 'pi':
                    result = math.pi;
                    break;
                case 'e':
                    result = math.e;
                    break;
                default:
                    return;
            }

            result = parseFloat(result.toFixed(8));
            setDisplay(result.toString());
            setExpression(result.toString());
            setClearNext(true);
        } catch (error) {
            setDisplay('Error');
            setClearNext(true);
        }
    };

    return (
        <div className="flex justify-center items-center pt-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="mb-4 p-3 bg-gray-200 rounded text-right h-20 flex flex-col justify-end">
                    <div className="text-gray-600 text-sm h-6 overflow-x-auto whitespace-nowrap">
                        {expression}
                    </div>
                    <div className="text-3xl font-bold overflow-x-auto whitespace-nowrap">
                        {display}
                    </div>
                </div>

                <div className="grid grid-cols-5 gap-2">
                    {/* Memory and Clear row */}
                    <button onClick={handleMemoryStore} className="btn col-span-1 bg-gray-700 text-white p-3 rounded hover:bg-gray-600">
                        MS
                    </button>
                    <button onClick={handleMemoryRecall} className="btn col-span-1 bg-gray-700 text-white p-3 rounded hover:bg-gray-600">
                        MR
                    </button>
                    <button onClick={handleMemoryClear} className="btn col-span-1 bg-gray-700 text-white p-3 rounded hover:bg-gray-600">
                        MC
                    </button>
                    <button onClick={handleMemoryAdd} className="btn col-span-1 bg-gray-700 text-white p-3 rounded hover:bg-gray-600">
                        M+
                    </button>
                    <button onClick={handleClear} className="btn col-span-1 bg-red-600 text-white p-3 rounded hover:bg-red-700">
                        C
                    </button>

                    {/* Scientific functions row 1 */}
                    <button onClick={() => handleScientificFunction('sin')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        sin
                    </button>
                    <button onClick={() => handleScientificFunction('cos')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        cos
                    </button>
                    <button onClick={() => handleScientificFunction('tan')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        tan
                    </button>
                    <button onClick={() => handleScientificFunction('log')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        log
                    </button>
                    <button onClick={() => handleScientificFunction('ln')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        ln
                    </button>

                    {/* Scientific functions row 2 */}
                    <button onClick={() => handleScientificFunction('sqrt')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        √
                    </button>
                    <button onClick={() => handleScientificFunction('1/x')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        1/x
                    </button>
                    <button onClick={() => handleScientificFunction('x^2')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        x²
                    </button>
                    <button onClick={() => handleScientificFunction('pi')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        π
                    </button>
                    <button onClick={() => handleScientificFunction('e')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        e
                    </button>

                    {/* Main calculator pad */}
                    <button onClick={() => handleNumberClick('7')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        7
                    </button>
                    <button onClick={() => handleNumberClick('8')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        8
                    </button>
                    <button onClick={() => handleNumberClick('9')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        9
                    </button>
                    <button onClick={handleBackspace} className="btn col-span-1 bg-gray-700 text-white p-3 rounded hover:bg-gray-600">
                        ⌫
                    </button>
                    <button onClick={() => handleOperatorClick('÷')} className="btn col-span-1 bg-orange-500 text-white p-3 rounded hover:bg-orange-400">
                        ÷
                    </button>

                    <button onClick={() => handleNumberClick('4')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        4
                    </button>
                    <button onClick={() => handleNumberClick('5')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        5
                    </button>
                    <button onClick={() => handleNumberClick('6')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        6
                    </button>
                    <button onClick={() => handleOperatorClick('(')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        (
                    </button>
                    <button onClick={() => handleOperatorClick('×')} className="btn col-span-1 bg-orange-500 text-white p-3 rounded hover:bg-orange-400">
                        ×
                    </button>

                    <button onClick={() => handleNumberClick('1')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        1
                    </button>
                    <button onClick={() => handleNumberClick('2')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        2
                    </button>
                    <button onClick={() => handleNumberClick('3')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        3
                    </button>
                    <button onClick={() => handleOperatorClick(')')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        )
                    </button>
                    <button onClick={() => handleOperatorClick('−')} className="btn col-span-1 bg-orange-500 text-white p-3 rounded hover:bg-orange-400">
                        −
                    </button>

                    <button onClick={() => handleNumberClick('0')} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        0
                    </button>
                    <button onClick={handleDecimal} className="btn col-span-1 bg-gray-500 text-white p-3 rounded hover:bg-gray-400">
                        .
                    </button>
                    <button onClick={() => handleOperatorClick('^')} className="btn col-span-1 bg-gray-600 text-white p-3 rounded hover:bg-gray-500">
                        x^y
                    </button>
                    <button onClick={() => handleOperatorClick('+')} className="btn col-span-1 bg-orange-500 text-white p-3 rounded hover:bg-orange-400">
                        +
                    </button>
                    <button onClick={handleEquals} className="btn col-span-1 bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
                        =
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScientificCalculator;
