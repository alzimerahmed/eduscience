import React, { useState } from 'react';
import { Clock, Settings, Save, Plus, Edit, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../contexts/AdminContext';
import { useLanguage } from '../../contexts/LanguageContext';

const ExamSettings: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    paperId: '',
    timeLimit: 180,
    allowPause: true,
    showTimer: true,
    autoSubmit: true,
    shuffleQuestions: false,
    showResults: true,
    passingScore: 60,
    maxAttempts: 3,
    availableFrom: new Date().toISOString().slice(0, 16),
    availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    instructions: ''
  });

  const { examSettings, createExamSettings, updateExamSettings, deleteExamSettings } = useAdmin();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateExamSettings(editingId, formData);
      setEditingId(null);
    } else {
      createExamSettings(formData);
      setIsCreating(false);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      paperId: '',
      timeLimit: 180,
      allowPause: true,
      showTimer: true,
      autoSubmit: true,
      shuffleQuestions: false,
      showResults: true,
      passingScore: 60,
      maxAttempts: 3,
      availableFrom: new Date().toISOString().slice(0, 16),
      availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      instructions: ''
    });
  };

  const handleEdit = (setting: any) => {
    setFormData({
      ...setting,
      availableFrom: new Date(setting.availableFrom).toISOString().slice(0, 16),
      availableTo: new Date(setting.availableTo).toISOString().slice(0, 16)
    });
    setEditingId(setting.id);
    setIsCreating(true);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('admin.examSettings.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.examSettings.subtitle')}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>{t('admin.examSettings.create')}</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingId ? t('admin.examSettings.edit') : t('admin.examSettings.create')}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.examSettings.paperId')}
                  </label>
                  <input
                    type="text"
                    value={formData.paperId}
                    onChange={(e) => setFormData(prev => ({ ...prev, paperId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.examSettings.timeLimit')} (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.timeLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.examSettings.passingScore')} (%)
                  </label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.examSettings.maxAttempts')}
                  </label>
                  <input
                    type="number"
                    value={formData.maxAttempts}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.examSettings.availableFrom')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.availableFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableFrom: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('admin.examSettings.availableTo')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.availableTo}
                    onChange={(e) => setFormData(prev => ({ ...prev, availableTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { key: 'allowPause', label: t('admin.examSettings.allowPause') },
                  { key: 'showTimer', label: t('admin.examSettings.showTimer') },
                  { key: 'autoSubmit', label: t('admin.examSettings.autoSubmit') },
                  { key: 'shuffleQuestions', label: t('admin.examSettings.shuffleQuestions') },
                  { key: 'showResults', label: t('admin.examSettings.showResults') }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData[key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('admin.examSettings.instructions')}
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('admin.examSettings.instructionsPlaceholder')}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{t('common.save')}</span>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Settings */}
      <div className="grid grid-cols-1 gap-4">
        {examSettings.map((setting) => (
          <motion.div
            key={setting.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Paper ID: {setting.paperId}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatTime(setting.timeLimit)} • {setting.maxAttempts} attempts • {setting.passingScore}% to pass
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(setting)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteExamSettings(setting.id)}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${setting.allowPause ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">Pause: {setting.allowPause ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${setting.showTimer ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">Timer: {setting.showTimer ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${setting.autoSubmit ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">Auto Submit: {setting.autoSubmit ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${setting.shuffleQuestions ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600 dark:text-gray-400">Shuffle: {setting.shuffleQuestions ? 'Yes' : 'No'}</span>
              </div>
            </div>

            {setting.instructions && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">{setting.instructions}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ExamSettings;