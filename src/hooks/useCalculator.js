import { useState } from 'react';
import * as math from 'mathjs';

export const useCalculator = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');
    const [expressionHistory, setExpressionHistory] = useState([]);
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
            // Store the current expression in history before evaluation
            setExpressionHistory([...expressionHistory, {
                expression: expression,
                result: ''
            }]);

            const result = math.evaluate(expression);

            // Update the last entry with the result
            setExpressionHistory(history =>
                history.map((item, index) =>
                    index === history.length - 1
                        ? { ...item, result: result.toString() }
                        : item
                )
            );

            setDisplay(result.toString());
            setExpression(result.toString());
            setClearNext(true);
        } catch (error) {
            setDisplay('Error');

            // Add error entry to history
            setExpressionHistory([...expressionHistory, {
                expression: expression,
                result: 'Error'
            }]);

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

            // Store the function operation in history
            setExpressionHistory([...expressionHistory, {
                expression: `${func}(${currentValue})`,
                result: ''
            }]);

            result = parseFloat(result.toFixed(8));

            // Update the last entry with the result
            setExpressionHistory(history =>
                history.map((item, index) =>
                    index === history.length - 1
                        ? { ...item, result: result.toString() }
                        : item
                )
            );

            setDisplay(result.toString());
            setExpression(result.toString());
            setClearNext(true);
        } catch (error) {
            setDisplay('Error');

            // Add error entry to history
            setExpressionHistory([...expressionHistory, {
                expression: `${func}(${display})`,
                result: 'Error'
            }]);

            setClearNext(true);
        }
    };

    const clearHistory = () => {
        setExpressionHistory([]);
    };

    return {
        display,
        expression,
        expressionHistory,
        memory,
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
        clearHistory
    };
};
