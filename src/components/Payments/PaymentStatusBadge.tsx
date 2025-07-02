import React from 'react';
import { Clock, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

interface PaymentStatusBadgeProps {
  status: 'pending' | 'paid' | 'verified' | 'failed' | 'refunded';
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ 
  status, 
  className = '', 
  showIcon = true,
  size = 'md'
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          text: 'Pending',
          colors: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
        };
      case 'paid':
        return {
          icon: Upload,
          text: 'Paid',
          colors: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
        };
      case 'verified':
        return {
          icon: CheckCircle,
          text: 'Verified',
          colors: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
        };
      case 'failed':
        return {
          icon: AlertCircle,
          text: 'Rejected',
          colors: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
        };
      case 'refunded':
        return {
          icon: AlertCircle,
          text: 'Refunded',
          colors: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
        };
      default:
        return {
          icon: Clock,
          text: 'Unknown',
          colors: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <motion.span
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      className={`inline-flex items-center space-x-1 rounded-full border ${config.colors} ${sizeClasses[size]} font-medium ${className}`}
    >
      {showIcon && <IconComponent className={iconSizes[size]} />}
      <span>{config.text}</span>
    </motion.span>
  );
};

export default PaymentStatusBadge;