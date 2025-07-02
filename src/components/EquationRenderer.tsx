import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Calculator, Edit3, Check, X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EquationStep {
  equation: string;
  explanation: string;
  highlight?: boolean;
}

interface EquationRendererProps {
  equation: string;
  steps?: EquationStep[];
  title?: string;
  interactive?: boolean;
  className?: string;
}

const EquationRenderer: React.FC<EquationRendererProps> = ({
  equation,
  steps = [],
  title,
  interactive = false,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEquation, setEditedEquation] = useState(equation);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSteps, setShowSteps] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, you'd save this to state/backend
  };

  const handleCancel = () => {
    setEditedEquation(equation);
    setIsEditing(false);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Sample step-by-step solutions for common equations
  const defaultSteps: EquationStep[] = steps.length > 0 ? steps : [
    {
      equation: "ax^2 + bx + c = 0",
      explanation: "Start with the standard quadratic equation form"
    },
    {
      equation: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      explanation: "Apply the quadratic formula",
      highlight: true
    },
    {
      equation: "\\Delta = b^2 - 4ac",
      explanation: "Calculate the discriminant to determine the nature of roots"
    }
  ];

  const currentSteps = steps.length > 0 ? steps : defaultSteps;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Calculator className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {title || 'Mathematical Equation'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Interactive LaTeX renderer with step-by-step solutions
              </p>
            </div>
          </div>
          
          {interactive && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors text-sm font-medium"
              >
                <Lightbulb className="h-4 w-4" />
                <span>{showSteps ? 'Hide Steps' : 'Show Steps'}</span>
              </button>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              ) : (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleSave}
                    className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Equation Display */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Edit LaTeX Equation:
              </label>
              <textarea
                value={editedEquation}
                onChange={(e) => setEditedEquation(e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Enter LaTeX equation..."
              />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
              <div className="text-center">
                <BlockMath math={editedEquation} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-lg border border-blue-200 dark:border-blue-700">
              <BlockMath math={equation} />
            </div>
          </div>
        )}
      </div>

      {/* Step-by-step Solution */}
      <AnimatePresence>
        {showSteps && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Step-by-Step Solution
                </h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Step {currentStep + 1} of {currentSteps.length}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={currentStep === currentSteps.length - 1}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-lg border-2 ${
                    currentSteps[currentStep].highlight
                      ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
                      : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="text-center mb-3">
                    <BlockMath math={currentSteps[currentStep].equation} />
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
                    {currentSteps[currentStep].explanation}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / currentSteps.length) * 100}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Examples */}
      {interactive && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quick Examples:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "E = mc^2",
              "\\frac{d}{dx}(x^2) = 2x",
              "\\int_0^1 x^2 dx = \\frac{1}{3}",
              "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setEditedEquation(example)}
                className="px-2 py-1 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-500 transition-colors text-xs"
              >
                <InlineMath math={example} />
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default EquationRenderer;