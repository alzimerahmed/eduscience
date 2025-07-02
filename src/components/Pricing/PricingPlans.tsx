import React, { useState } from 'react';
import { Check, Star, Zap, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';

const PricingPlans: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');

  const plans = [
    {
      name: 'Free',
      price: 0,
      currency: 'Rs',
      period: 'month',
      description: 'Perfect for getting started',
      icon: Star,
      color: 'gray',
      features: [
        'Access to 50+ past papers',
        'Basic AI tutoring (5 sessions/month)',
        'Standard support',
        'Basic progress tracking',
        'Download papers (PDF)',
        'Community access'
      ],
      limitations: [
        'Limited AI interactions',
        'No advanced analytics',
        'No custom uploads'
      ]
    },
    {
      name: 'Student',
      price: 500,
      currency: 'Rs',
      period: 'month',
      annualPrice: 5000,
      description: 'Perfect for individual students',
      icon: Zap,
      color: 'blue',
      popular: true,
      features: [
        'Access to 500+ past papers',
        'Unlimited AI tutoring',
        'Priority support',
        'Advanced analytics dashboard',
        'Download papers (PDF, Word)',
        'Voice navigation',
        '3D molecular visualization',
        'Real-time collaboration',
        'Custom study plans',
        'Progress insights'
      ]
    },
    {
      name: 'Teacher',
      price: 5000,
      currency: 'Rs',
      period: 'month',
      annualPrice: 50000,
      description: 'For educators and institutions',
      icon: Crown,
      color: 'purple',
      features: [
        'Everything in Premium',
        'Upload custom papers',
        'Admin dashboard',
        'Exam time management',
        'Blockchain certificates',
        'API access',
        'White-label options',
        'Advanced user management',
        'Custom branding',
        'Dedicated support',
        'Analytics exports',
        'Multi-language AI'
      ]
    }
  ];

  const handleSubscribe = (planName: string, isFreePlan: boolean = false) => {
    if (isFreePlan) {
      if (user) {
        // User is already logged in, redirect to dashboard
        navigate('/dashboard');
      } else {
        // Open register modal
        setAuthModalMode('register');
        setIsAuthModalOpen(true);
      }
    } else {
      // For paid plans
      if (user) {
        // User is logged in, redirect to payments page
        navigate('/payments');
      } else {
        // User needs to log in first
        setAuthModalMode('register');
        setIsAuthModalOpen(true);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('pricing.title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {t('pricing.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const IconComponent = plan.icon;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 overflow-hidden ${
                plan.popular
                  ? 'border-blue-500 scale-105'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  {t('pricing.mostPopular')}
                </div>
              )}

              <div className={`p-8 ${plan.popular ? 'pt-12' : ''}`}>
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    plan.color === 'gray' ? 'bg-gray-100 dark:bg-gray-700' :
                    plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <IconComponent className={`h-8 w-8 ${
                      plan.color === 'gray' ? 'text-gray-600 dark:text-gray-400' :
                      plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    <div className="flex flex-col items-center">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {plan.currency} {plan.price.toLocaleString()}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{plan.period}
                    </span>
                      {plan.annualPrice && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                          Annual: {plan.currency} {plan.annualPrice.toLocaleString()}/year (Save 16.7%)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature}
                      </span>
                    </div>
                  ))}
                  
                  {plan.limitations && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start space-x-3 opacity-60">
                          <div className="h-5 w-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                            <div className="h-1 w-3 bg-gray-400 rounded"></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-400 text-sm">
                            {limitation}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(plan.name, plan.name === 'Free')}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                      : plan.name === 'Free'
                      ? 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {plan.name === 'Free' ? t('pricing.getStarted') : t('pricing.subscribe')}
                </button>

                {plan.name === 'Free' && (
                  <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                    {t('pricing.noCard')}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          {t('pricing.faq.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              question: t('pricing.faq.q1'),
              answer: t('pricing.faq.a1')
            },
            {
              question: t('pricing.faq.q2'),
              answer: t('pricing.faq.a2')
            },
            {
              question: t('pricing.faq.q3'),
              answer: t('pricing.faq.a3')
            },
            {
              question: t('pricing.faq.q4'),
              answer: t('pricing.faq.a4')
            }
          ].map((faq, index) => (
            <div key={index} className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authModalMode}
      />
    </div>
  );
};

export default PricingPlans;