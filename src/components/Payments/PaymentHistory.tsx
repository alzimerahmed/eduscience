import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Clock, Download, Eye, Calendar, Search, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import PaymentStatusBadge from './PaymentStatusBadge';

interface PaymentTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: 'pending' | 'paid' | 'verified' | 'failed';
  payment_proof_url?: string;
  created_at: string;
  verified_at?: string;
}

interface AccessRequest {
  id: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requested_role: string;
  created_at: string;
  approved_at?: string;
}

interface PaymentHistoryProps {
  className?: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchAccessRequests();
    }
  }, [user]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccessRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAccessRequests(data || []);
    } catch (error) {
      console.error('Error fetching access requests:', error);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchTerm === '' || 
      transaction.transaction_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Payment History</span>
          </h3>
          <PaymentStatusBadge 
            status={accessRequests[0]?.status === 'approved' ? 'verified' : 'pending'} 
            size="md"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <AnimatePresence>
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 text-center"
            >
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No transactions found</h4>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Your payment history will appear here once you make a payment'
                }
              </p>
            </motion.div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Rs {transaction.amount.toLocaleString()}
                      </span>
                      <PaymentStatusBadge status={transaction.status} size="sm" />
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <span className="font-mono">{transaction.transaction_id}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(transaction.created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      {transaction.payment_proof_url && (
                        <button
                          onClick={() => window.open(transaction.payment_proof_url, '_blank')}
                          className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Receipt"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {}} // Download receipt functionality
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Access Status */}
      {accessRequests.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Access Status</h4>
          <div className="space-y-2">
            {accessRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {request.requested_role.charAt(0).toUpperCase() + request.requested_role.slice(1)} Access
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-500">
                    Requested on {formatDate(request.created_at)}
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  request.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                  request.status === 'denied' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;