import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, FileText, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AccessRequestFormProps {
  transactionId: string;
  onComplete: () => void;
}

const AccessRequestForm: React.FC<AccessRequestFormProps> = ({ transactionId, onComplete }) => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    role: profile?.role || 'student',
    institutionName: '',
    contactNumber: '',
    additionalInfo: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { error } = await supabase
        .from('access_requests')
        .insert({
          user_id: user.id,
          payment_transaction_id: transactionId,
          requested_role: formData.role,
          institution_name: formData.institutionName,
          contact_number: formData.contactNumber,
          additional_info: formData.additionalInfo ? { notes: formData.additionalInfo } : null
        });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error('Error submitting access request:', error);
      setError('Failed to submit access request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Access Request
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Please provide the following information to process your access request
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 flex items-center space-x-2"
        >
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </motion.div>
      )}

      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full inline-flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Access Request Submitted
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your access request has been submitted successfully. We'll review your payment and grant access within 24 hours.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            You'll receive an email notification when your access is approved.
          </p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('role', 'student')}
                className={`p-3 border-2 rounded-lg transition-all text-left ${
                  formData.role === 'student'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Student</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Access learning materials
                    </p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInputChange('role', 'teacher')}
                className={`p-3 border-2 rounded-lg transition-all text-left ${
                  formData.role === 'teacher'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Teacher</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Upload and manage content
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Institution Name
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your school or university name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter your contact number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Information (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Any additional information you'd like to provide..."
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Our team will review your payment and access request</li>
              <li>• You'll receive an email notification when access is granted</li>
              <li>• Typical approval time is within 24 hours</li>
              <li>• Contact support if you have any questions</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Submit Access Request</span>
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default AccessRequestForm;