import React, { useState, useEffect } from 'react';
import * as math from 'mathjs';

const ScientificCalculator = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [memory, setMemory] = useState(null);
  const [clearNext, setClearNext] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Check system preference for dark/light mode on initial load
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

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
  
  // Theme-based classes
  const calculatorClass = darkMode 
    ? "bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700" 
    : "bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200";
  
  const displayClass = darkMode 
    ? "mb-6 p-4 bg-gray-800 rounded-xl text-right h-24 flex flex-col justify-end border border-gray-700" 
    : "mb-6 p-4 bg-gray-100 rounded-xl text-right h-24 flex flex-col justify-end border border-gray-200";
  
  const expressionClass = darkMode 
    ? "text-gray-400 text-sm h-6 overflow-x-auto whitespace-nowrap" 
    : "text-gray-500 text-sm h-6 overflow-x-auto whitespace-nowrap";
  
  const resultClass = darkMode 
    ? "text-3xl font-bold text-white overflow-x-auto whitespace-nowrap" 
    : "text-3xl font-bold text-gray-800 overflow-x-auto whitespace-nowrap";
  
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
  
  const toggleBtnClass = darkMode 
    ? "absolute top-4 right-4 bg-yellow-500 text-gray-900 p-2 rounded-full hover:bg-yellow-400 transition-colors shadow-md" 
    : "absolute top-4 right-4 bg-gray-700 text-gray-100 p-2 rounded-full hover:bg-gray-600 transition-colors shadow-md";
  
  return (
    <div className="flex justify-center w-full items-center min-h-screen pt-8 transition-colors duration-300" style={{ background: darkMode ? '#1a1a2e' : '#f0f2f5' }}>
      <div className="relative">
        <button 
          onClick={toggleTheme} 
          className={toggleBtnClass}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
        
        <div className={calculatorClass}>
          <div className={displayClass}>
            <div className={expressionClass}>
              {expression}
            </div>
            <div className={resultClass}>
              {display}
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};

export default ScientificCalculator;
