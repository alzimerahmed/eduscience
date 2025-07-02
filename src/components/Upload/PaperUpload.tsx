import React, { useState } from 'react';
import { Upload, FileText, Image, Brain, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdmin } from '../../contexts/AdminContext';
import { useAuth } from '../../contexts/AuthContext';
import { tamilAI } from '../../services/tamilAI';
import { useLanguage } from '../../contexts/LanguageContext';

const PaperUpload: React.FC = () => {
  const [uploadData, setUploadData] = useState({
    title: '',
    subject: '',
    type: 'pastpaper' as const,
    language: 'ta' as const,
    file: null as File | null,
    content: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { uploadPaper } = useAdmin();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadData(prev => ({ ...prev, file }));

    // Extract text content for AI analysis
    try {
      const content = await tamilAI.extractTextFromFile(file);
      setUploadData(prev => ({ ...prev, content }));

      // Analyze content with AI
      const analysisResult = await tamilAI.analyzeTamilContent(content);
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('File analysis failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !uploadData.file) return;

    setIsUploading(true);
    try {
      await uploadPaper({
        ...uploadData,
        uploadedBy: user.id
      });
      setUploadStatus('success');
      // Reset form
      setUploadData({
        title: '',
        subject: '',
        type: 'pastpaper',
        language: 'ta',
        file: null,
        content: ''
      });
      setAnalysis(null);
    } catch (error) {
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('upload.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('upload.subtitle')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 flex items-center space-x-3"
            >
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-green-700 dark:text-green-300">{t('upload.success')}</p>
            </motion.div>
          )}

          {uploadStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 flex items-center space-x-3"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-red-700 dark:text-red-300">{t('upload.error')}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('upload.title.label')}
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder={t('upload.title.placeholder')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('upload.subject.label')}
                </label>
                <select
                  value={uploadData.subject}
                  onChange={(e) => setUploadData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">{t('upload.subject.placeholder')}</option>
                  <option value="Chemistry">{t('subject.chemistry')}</option>
                  <option value="Physics">{t('subject.physics')}</option>
                  <option value="Biology">{t('subject.biology')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('upload.type.label')}
                </label>
                <select
                  value={uploadData.type}
                  onChange={(e) => setUploadData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="pastpaper">{t('upload.type.pastpaper')}</option>
                  <option value="model">{t('upload.type.model')}</option>
                  <option value="notes">{t('upload.type.notes')}</option>
                  <option value="answerScheme">{t('upload.type.answerScheme')}</option>
                  <option value="mindMap">{t('upload.type.mindMap')}</option>
                  <option value="shortMethod">{t('upload.type.shortMethod')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('upload.language.label')}
                </label>
                <select
                  value={uploadData.language}
                  onChange={(e) => setUploadData(prev => ({ ...prev, language: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="ta">தமிழ் (Tamil)</option>
                  <option value="si">සිංහල (Sinhala)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('upload.file.label')}
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {uploadData.file ? uploadData.file.name : t('upload.file.placeholder')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {t('upload.file.formats')}
                    </p>
                  </label>
                </div>
              </div>

              {/* AI Analysis Results */}
              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 mb-3">
                    <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">
                      {t('upload.analysis.title')}
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>{t('upload.analysis.subject')}:</strong> {analysis.subject}</p>
                    <p><strong>{t('upload.analysis.difficulty')}:</strong> {analysis.difficulty}</p>
                    <p><strong>{t('upload.analysis.questions')}:</strong> {analysis.questionCount}</p>
                    <p><strong>{t('upload.analysis.topics')}:</strong> {analysis.topics.join(', ')}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setUploadData({
                  title: '',
                  subject: '',
                  type: 'pastpaper',
                  language: 'ta',
                  file: null,
                  content: ''
                });
                setAnalysis(null);
                setUploadStatus('idle');
              }}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isUploading || !uploadData.file}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span>{isUploading ? t('upload.uploading') : t('upload.submit')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaperUpload;