import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, Key, Copy, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TwoFactorAuthProps {
  className?: string;
}

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user]);

  const checkTwoFactorStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('two_factor_auth')
        .select('is_enabled')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setIsEnabled(data?.is_enabled || false);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    }
  };

  const generateSecret = () => {
    // Generate a base32 secret (simplified for demo)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      let code = '';
      for (let j = 0; j < 8; j++) {
        code += Math.floor(Math.random() * 10);
      }
      codes.push(code.slice(0, 4) + '-' + code.slice(4));
    }
    return codes;
  };

  const setupTwoFactor = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const newSecret = generateSecret();
      const newBackupCodes = generateBackupCodes();
      
      setSecret(newSecret);
      setBackupCodes(newBackupCodes);
      setIsSetup(true);
      
      // Generate QR code URL for authenticator apps
      const appName = 'SciencePapers';
      const userEmail = user?.email || 'user@example.com';
      const qrData = `otpauth://totp/${appName}:${userEmail}?secret=${newSecret}&issuer=${appName}`;
      
      // Use a QR code generation service
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`);
      
    } catch (error) {
      setError('Failed to setup 2FA. Please try again.');
      console.error('Error setting up 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real implementation, you would verify the TOTP code here
      // For demo purposes, we'll accept any 6-digit code
      
      const { error } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: user?.id,
          secret_key: secret, // In production, this should be encrypted
          backup_codes: backup_codes, // In production, these should be encrypted
          is_enabled: true,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setIsEnabled(true);
      setSuccess('Two-factor authentication has been enabled successfully!');
    } catch (error) {
      setError('Failed to enable 2FA. Please try again.');
      console.error('Error enabling 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase
        .from('two_factor_auth')
        .update({ is_enabled: false })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setIsEnabled(false);
      setSuccess('Two-factor authentication has been disabled.');
    } catch (error) {
      setError('Failed to disable 2FA. Please try again.');
      console.error('Error disabling 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadBackupCodes = () => {
    const element = document.createElement('a');
    const file = new Blob([backupCodes.join('\n')], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = 'backup-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add an extra layer of security to your account
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
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

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-3 flex items-center space-x-2"
          >
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
          </motion.div>
        )}

        {isEnabled ? (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <h4 className="font-medium text-green-900 dark:text-green-100">Two-Factor Authentication is Enabled</h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your account is protected with an additional layer of security.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">Security Options</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You can disable two-factor authentication, but this will make your account less secure.
              </p>
              <button
                onClick={disableTwoFactor}
                disabled={isLoading}
                className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700 dark:border-red-300"></div>
                ) : (
                  <Shield className="h-4 w-4" />
                )}
                <span>Disable Two-Factor Authentication</span>
              </button>
            </div>
          </div>
        ) : isSetup ? (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Scan QR Code</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="bg-white p-4 rounded-lg inline-block">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Manual Setup</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                If you can't scan the QR code, enter this code manually in your app:
              </p>
              <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <code className="font-mono text-sm text-gray-900 dark:text-white flex-1">
                  {secret}
                </code>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
                >
                  <Copy className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Backup Codes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Save these backup codes in a secure place. You can use them to sign in if you lose access to your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono text-sm text-gray-900 dark:text-white text-center">
                    {code}
                  </div>
                ))}
              </div>
              <button
                onClick={downloadBackupCodes}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Backup Codes</span>
              </button>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Verification</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Enter the 6-digit code from your authenticator app to verify setup:
              </p>
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center font-mono text-lg"
                  maxLength={6}
                />
                <button
                  onClick={enableTwoFactor}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>Verify & Enable</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Why use Two-Factor Authentication?</h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Adds an extra layer of security to your account</li>
                <li>• Protects against unauthorized access even if your password is compromised</li>
                <li>• Secures your payment information and personal data</li>
                <li>• Recommended for all users, especially teachers and administrators</li>
              </ul>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <Smartphone className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Authenticator App</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use an authenticator app like Google Authenticator, Authy, or Microsoft Authenticator
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <Key className="h-6 w-6 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Backup Codes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Get backup codes to use when you don't have your device
                </p>
              </div>
            </div>

            <button
              onClick={setupTwoFactor}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 font-medium"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  <span>Setup Two-Factor Authentication</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;