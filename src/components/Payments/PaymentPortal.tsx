import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Building, Shield, Clock, CheckCircle, AlertCircle, Upload, Copy, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface PaymentMethod {
  id: string;
  method_name: string;
  configuration: any;
  instructions: string;
  is_active: boolean;
}

interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: 'LKR' | 'USD';
  payment_method: string;
  status: string;
  created_at: string;
  payment_proof_url?: string;
}

const PaymentPortal: React.FC = () => {
  const { user, profile } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState<number>(0);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
    fetchSubscriptionPlans();
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_lkr', { ascending: true });
      
      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const generateTransactionId = () => {
    return `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  };

  const handleCreateTransaction = async () => {
    if (!user || !selectedMethod || amount <= 0) return;

    setIsProcessing(true);
    try {
      const transactionId = generateTransactionId();
      
      const { data, error } = await supabase
        .from('payment_transactions')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          amount: selectedPlan ? selectedPlan.price_lkr : amount,
          currency: 'LKR',
          payment_method: selectedMethod.method_name.toLowerCase().replace(' ', '_'),
          payment_details: {
            method_config: selectedMethod.configuration,
            subscription_plan: selectedPlan ? selectedPlan.name : null,
            user_info: {
              name: profile?.name,
              email: profile?.email
            }
          },
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentTransaction(data);
      await fetchTransactions();
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (transactionId: string) => {
    if (!paymentProof) return;

    try {
      const fileExt = paymentProof.name.split('.').pop();
      const fileName = `payment-proof/${transactionId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProof);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('payment_transactions')
        .update({ 
          payment_proof_url: publicUrl,
          status: 'paid'
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;
      
      await fetchTransactions();
      setPaymentProof(null);
    } catch (error) {
      console.error('Error uploading payment proof:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'paid': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'verified': return 'text-green-600 bg-green-100 border-green-200';
      case 'failed': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <Upload className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Secure Payment Portal
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Complete your payment to gain access to premium educational content. All transactions are secure and encrypted.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Subscription Payment</span>
            </h2>

            {/* Subscription Plans */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Subscription Plan
              </label>
              <div className="grid grid-cols-1 gap-4">
                {plans.filter(p => p.role === (profile?.role || 'student')).map((plan) => (
                  <motion.button
                    key={plan.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedPlan(plan);
                      setAmount(plan.price_lkr);
                    }}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {plan.name}
                        </span>
                      </div>
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        Rs {plan.price_lkr.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {plan.period === 'annual' ? 'Annual subscription (save 16.7%)' : 'Monthly subscription'}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Payment Method
              </label>
              <div className="grid grid-cols-1 gap-3">
                {paymentMethods.map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMethod(method)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      selectedMethod?.id === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {method.method_name === 'Commercial Bank Transfer' ? (
                        <Building className="h-5 w-5 text-blue-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      )}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {method.method_name}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Create Transaction Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateTransaction}
              disabled={!selectedMethod || !selectedPlan || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg transition-all duration-200 font-semibold disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                'Create Payment Transaction'
              )}
            </motion.button>
          </div>

          {/* Current Transaction Details */}
          <AnimatePresence>
            {currentTransaction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span>Transaction Created</span>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID:</span>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {currentTransaction.transaction_id}
                      </code>
                      <button
                        onClick={() => copyToClipboard(currentTransaction.transaction_id)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Rs {currentTransaction.amount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(currentTransaction.status)}`}>
                      {getStatusIcon(currentTransaction.status)}
                      <span className="capitalize">{currentTransaction.status}</span>
                    </span>
                  </div>

                  {selectedMethod?.method_name === 'Commercial Bank Transfer' && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Bank Details</h4>
                        <button
                          onClick={() => setShowBankDetails(!showBankDetails)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {showBankDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span>{showBankDetails ? 'Hide' : 'Show'}</span>
                        </button>
                      </div>

                      <AnimatePresence>
                        {showBankDetails && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 text-sm"
                          >
                            {Object.entries(selectedMethod.configuration).map(([key, value]) => (
                              <div key={key} className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                <span className="text-gray-600 dark:text-gray-400 capitalize">
                                  {key.replace('_', ' ')}:
                                </span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 dark:text-white font-mono">{value}</span>
                                  <button
                                    onClick={() => copyToClipboard(value as string)}
                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                  >
                                    <Copy className="h-3 w-3 text-gray-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Payment Proof Upload */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Upload Payment Receipt
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                          className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {paymentProof && (
                          <button
                            onClick={() => handleFileUpload(currentTransaction.id)}
                            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                          >
                            Upload Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {transaction.transaction_id}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      Rs {transaction.amount.toLocaleString()}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPortal;