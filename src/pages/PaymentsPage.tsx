import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ShieldCheck, Clock, ArrowRight, Info } from 'lucide-react';
import PaymentPortal from '../components/Payments/PaymentPortal';
import PaymentInstructions from '../components/Payments/PaymentInstructions';
import PaymentHistory from '../components/Payments/PaymentHistory';
import TwoFactorAuth from '../components/Security/TwoFactorAuth';
import AccessRequestForm from '../components/Payments/AccessRequestForm';
import { useAuth } from '../contexts/AuthContext';

const PaymentsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [currentTransaction, setCurrentTransaction] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Payments & Access
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Make payments, manage your access, and secure your account
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {currentTransaction ? (
            <AccessRequestForm 
              transactionId={currentTransaction}
              onComplete={() => setCurrentTransaction(null)}
            />
          ) : (
            <PaymentPortal />
          )}
          
          <PaymentInstructions
            selectedPlan={selectedPlan}
          />
          
          <PaymentHistory />
        </div>

        <div className="space-y-8">
          <TwoFactorAuth />

          {/* Security Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Secure Payments
              </h3>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p>
                All payment information is encrypted and processed securely. We never store your payment details on our servers.
              </p>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Manual Verification</h4>
                  <p className="text-xs">
                    Payments are manually verified by our team for added security
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    All payments must be made through Commercial Bank of Sri Lanka
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Need Help?</h4>
                  <p className="text-xs">
                    Contact our support team at support@sciencepapers.com
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Access Levels */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Access Levels
            </h3>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Student Access</h4>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">$9.99/month</span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>View all educational content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Download materials</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Access AI tutoring</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">Teacher Access</h4>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">$19.99/month</span>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>All student features</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Upload educational content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>Create and manage exams</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;