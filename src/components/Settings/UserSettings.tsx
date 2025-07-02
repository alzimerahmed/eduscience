import React, { useState } from 'react';
import { User, Bell, Globe, Palette, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const UserSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  const tabs = [
    { id: 'profile', label: t('settings.profile'), icon: User },
    { id: 'notifications', label: t('settings.notifications'), icon: Bell },
    { id: 'language', label: t('settings.language'), icon: Globe },
    { id: 'appearance', label: t('settings.appearance'), icon: Palette },
    { id: 'privacy', label: t('settings.privacy'), icon: Shield },
    { id: 'subscription', label: t('settings.subscription'), icon: CreditCard },
    { id: 'help', label: t('settings.help'), icon: HelpCircle }
  ];

  const handleProfileUpdate = async (updates: any) => {
    setIsLoading(true);
    try {
      await updateProfile(updates);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('settings.profile.title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.profile.name')}
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('settings.profile.email')}
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('settings.language.title')}
              </h3>
              <div className="space-y-3">
                {[
                  { code: 'en', name: 'English', flag: '🇺🇸' },
                  { code: 'ta', name: 'தமிழ் (Tamil)', flag: '🇱🇰' },
                  { code: 'si', name: 'සිංහල (Sinhala)', flag: '🇱🇰' }
                ].map((lang) => (
                  <label key={lang.code} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value={lang.code}
                      checked={language === lang.code}
                      onChange={() => setLanguage(lang.code as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-gray-900 dark:text-white">{lang.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('settings.appearance.title')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {t('settings.appearance.darkMode')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('settings.appearance.darkModeDesc')}
                    </p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {t('settings.subscription.title')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    name: 'Free',
                    price: '$0',
                    features: ['Basic papers', 'Limited AI help', 'Standard support'],
                    current: user?.subscription === 'free'
                  },
                  {
                    name: 'Premium',
                    price: '$9.99',
                    features: ['All papers', 'Unlimited AI help', 'Priority support', 'Advanced analytics'],
                    current: user?.subscription === 'premium'
                  },
                  {
                    name: 'Pro',
                    price: '$19.99',
                    features: ['Everything in Premium', 'Custom uploads', 'Admin features', 'API access'],
                    current: user?.subscription === 'pro'
                  }
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`p-6 border-2 rounded-xl ${
                      plan.current
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h4>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {plan.price}<span className="text-sm font-normal">/month</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      className={`w-full py-2 px-4 rounded-lg transition-colors ${
                        plan.current
                          ? 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : 'Upgrade'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              {t('settings.comingSoon')}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {t('settings.title')}
              </h2>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;