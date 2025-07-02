import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, CheckCircle, X, Eye, Download, Mail, Search, Filter, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  payment_proof_url?: string;
  admin_notes?: string;
  created_at: string;
  verified_at?: string;
  profiles: {
    name: string;
    email: string;
    role: string;
  };
}

const PaymentManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PaymentTransaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          profiles (name, email, role)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const updateTransactionStatus = async (transactionId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { 
        status,
        admin_notes: notes || adminNotes
      };

      if (status === 'verified') {
        updateData.verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payment_transactions')
        .update(updateData)
        .eq('id', transactionId);

      if (error) throw error;

      // Send notification email
      await sendNotificationEmail(transactionId, status);
      
      await fetchTransactions();
      setSelectedTransaction(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const sendNotificationEmail = async (transactionId: string, status: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      const notificationType = status === 'verified' ? 'access_granted' : 'access_denied';
      
      const { error } = await supabase
        .from('notification_logs')
        .insert({
          user_id: transaction.profiles.id,
          notification_type: notificationType,
          email_to: transaction.profiles.email,
          subject: status === 'verified' ? 'Payment Verified - Access Granted' : 'Payment Review Update',
          content: status === 'verified' 
            ? `Your payment of $${transaction.amount} has been verified. You now have full access to the platform.`
            : `Your payment of $${transaction.amount} requires additional review. Please contact support for more information.`,
          sent_at: new Date().toISOString(),
          delivery_status: 'sent'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and approve payment transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
            {filteredTransactions.length} transactions
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTransactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {transaction.profiles.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.profiles.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                    {transaction.profiles.role}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  Rs {transaction.amount.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {transaction.currency}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <p className="font-mono text-sm text-gray-900 dark:text-white">
                  {transaction.transaction_id}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method:</span>
                <p className="text-sm text-gray-900 dark:text-white capitalize">
                  {transaction.payment_method.replace('_', ' ')}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatDate(transaction.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
              </span>
              
              <div className="flex items-center space-x-2">
                {transaction.payment_proof_url && (
                  <button
                    onClick={() => window.open(transaction.payment_proof_url, '_blank')}
                    className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title="View Payment Proof"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                
                <button
                  onClick={() => setSelectedTransaction(transaction)}
                  className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors text-sm font-medium"
                >
                  Review
                </button>
              </div>
            </div>

            {transaction.admin_notes && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Admin Notes:</span>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{transaction.admin_notes}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTransaction(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Review Transaction
                </h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">User:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedTransaction.profiles.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedTransaction.profiles.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      Rs {selectedTransaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedTransaction.payment_proof_url && (
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Payment Proof:</span>
                    <img
                      src={selectedTransaction.payment_proof_url}
                      alt="Payment Proof"
                      className="mt-2 max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    placeholder="Add notes about this transaction..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => updateTransactionStatus(selectedTransaction.id, 'failed')}
                  className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors font-medium"
                >
                  Reject Payment
                </button>
                <button
                  onClick={() => updateTransactionStatus(selectedTransaction.id, 'verified')}
                  className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors font-medium flex items-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve Payment</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Payment transactions will appear here once users make payments'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;