import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Copy, Info, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentInstructionsProps {
  className?: string;
  selectedPlan?: any;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({ className = '', selectedPlan }) => {
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('method_name', 'Commercial Bank Transfer')
        .single();
      
      if (error) throw error;
      setPaymentMethod(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Payment Instructions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Follow these steps to complete your payment
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Selected Plan</h4>
            <div className="flex justify-between items-center">
              <span className="text-blue-800 dark:text-blue-200">{selectedPlan.name}</span>
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Rs {selectedPlan.price_lkr.toLocaleString()}/{selectedPlan.period}
              </span>
            </div>
          </div>
        )}

        {/* Bank Details */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Bank Account Details</h4>
          <div className="space-y-3">
            {paymentMethod?.configuration && Object.entries(paymentMethod.configuration).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {key.replace(/_/g, ' ')}:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 dark:text-white font-medium">{String(value)}</span>
                  <button
                    onClick={() => copyToClipboard(String(value), key)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                  >
                    {copied === key ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Steps to Follow */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">How to Complete Your Payment</h4>
          <ol className="space-y-4 text-gray-600 dark:text-gray-400">
            <li className="flex items-start space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Make the Bank Transfer</p>
                <p className="text-sm">Transfer the exact amount to the Commercial Bank account details provided above.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Save Payment Proof</p>
                <p className="text-sm">Take a screenshot or photo of your payment confirmation/receipt.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Create Transaction Record</p>
                <p className="text-sm">Click "Create Payment Transaction" above to generate a transaction record in our system.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Upload Payment Proof</p>
                <p className="text-sm">Upload your payment confirmation screenshot to verify your payment.</p>
              </div>
            </li>
            <li className="flex items-start space-x-2">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">5</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Complete Registration</p>
                <p className="text-sm">Fill out the registration form with your details.</p>
              </div>
            </li>
          </ol>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 flex items-start space-x-3">
          <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">Important</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-200">
              Your access will be granted within 24 hours after payment verification. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentInstructions;