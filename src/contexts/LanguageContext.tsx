import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta' | 'si';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'header.title': 'SciencePapers',
    'header.subtitle': 'Learn • Practice • Excel',
    'header.search': 'Search papers, topics...',
    'header.progress': 'Progress',
    'header.profile': 'Profile',
    'header.level': 'Level',
    'header.login': 'Login',
    'header.register': 'Register',
    
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.papers': 'Papers',
    'nav.favorites': 'Favorites',
    'nav.downloads': 'Downloads',
    'nav.upload': 'Upload',
    'nav.settings': 'Settings',
    'nav.pricing': 'Pricing',
    'nav.guide': 'User Guide',
    'nav.admin': 'Admin',
    
    // Auth
    'auth.login.title': 'Welcome Back',
    'auth.login.subtitle': 'Sign in to your account',
    'auth.login.button': 'Sign In',
    'auth.login.link': 'Sign In',
    'auth.login.noAccount': "Don't have an account?",
    'auth.register.title': 'Create Account',
    'auth.register.subtitle': 'Join thousands of students',
    'auth.register.button': 'Create Account',
    'auth.register.link': 'Sign Up',
    'auth.register.hasAccount': 'Already have an account?',
    'auth.email': 'Email',
    'auth.email.placeholder': 'Enter your email',
    'auth.password': 'Password',
    'auth.password.placeholder': 'Enter your password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.confirmPassword.placeholder': 'Confirm your password',
    'auth.name': 'Full Name',
    'auth.name.placeholder': 'Enter your full name',
    
    // Upload
    'upload.title': 'Upload Educational Content',
    'upload.subtitle': 'Share your Tamil papers, notes, and study materials',
    'upload.title.label': 'Title',
    'upload.title.placeholder': 'Enter content title',
    'upload.subject.label': 'Subject',
    'upload.subject.placeholder': 'Select subject',
    'upload.type.label': 'Content Type',
    'upload.type.pastpaper': 'Past Paper',
    'upload.type.model': 'Model Questions',
    'upload.type.notes': 'Notes',
    'upload.type.answerScheme': 'Answer Scheme',
    'upload.type.mindMap': 'Mind Map',
    'upload.type.shortMethod': 'Short Method',
    'upload.language.label': 'Language',
    'upload.file.label': 'Upload File',
    'upload.file.placeholder': 'Click to select file or drag and drop',
    'upload.file.formats': 'Supports PDF, DOC, DOCX, TXT',
    'upload.analysis.title': 'AI Content Analysis',
    'upload.analysis.subject': 'Detected Subject',
    'upload.analysis.difficulty': 'Difficulty Level',
    'upload.analysis.questions': 'Question Count',
    'upload.analysis.topics': 'Topics',
    'upload.submit': 'Upload Content',
    'upload.uploading': 'Uploading...',
    'upload.success': 'Content uploaded successfully! It will be reviewed by our team.',
    'upload.error': 'Upload failed. Please try again.',
    
    // Admin
    'admin.examSettings.title': 'Exam Time Management',
    'admin.examSettings.subtitle': 'Configure time limits and exam settings',
    'admin.examSettings.create': 'Create New Setting',
    'admin.examSettings.edit': 'Edit Exam Setting',
    'admin.examSettings.paperId': 'Paper ID',
    'admin.examSettings.timeLimit': 'Time Limit',
    'admin.examSettings.passingScore': 'Passing Score',
    'admin.examSettings.maxAttempts': 'Max Attempts',
    'admin.examSettings.availableFrom': 'Available From',
    'admin.examSettings.availableTo': 'Available To',
    'admin.examSettings.allowPause': 'Allow Pause',
    'admin.examSettings.showTimer': 'Show Timer',
    'admin.examSettings.autoSubmit': 'Auto Submit',
    'admin.examSettings.shuffleQuestions': 'Shuffle Questions',
    'admin.examSettings.showResults': 'Show Results',
    'admin.examSettings.instructions': 'Instructions',
    'admin.examSettings.instructionsPlaceholder': 'Enter exam instructions...',
    
    // Settings
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.notifications': 'Notifications',
    'settings.language': 'Language',
    'settings.appearance': 'Appearance',
    'settings.privacy': 'Privacy',
    'settings.subscription': 'Subscription',
    'settings.help': 'Help',
    'settings.comingSoon': 'This feature is coming soon!',
    'settings.profile.title': 'Profile Information',
    'settings.profile.name': 'Name',
    'settings.profile.email': 'Email',
    'settings.language.title': 'Language Preferences',
    'settings.appearance.title': 'Appearance Settings',
    'settings.appearance.darkMode': 'Dark Mode',
    'settings.appearance.darkModeDesc': 'Switch between light and dark themes',
    'settings.subscription.title': 'Subscription Plans',
    
    // Pricing
    'pricing.title': 'Choose Your Plan',
    'pricing.subtitle': 'Unlock the full potential of AI-powered learning',
    'pricing.mostPopular': 'Most Popular',
    'pricing.getStarted': 'Get Started',
    'pricing.subscribe': 'Subscribe Now',
    'pricing.noCard': 'No credit card required',
    'pricing.faq.title': 'Frequently Asked Questions',
    'pricing.faq.q1': 'Can I change my plan anytime?',
    'pricing.faq.a1': 'Yes, you can upgrade or downgrade your plan at any time.',
    'pricing.faq.q2': 'Is there a free trial?',
    'pricing.faq.a2': 'Yes, all paid plans come with a 7-day free trial.',
    'pricing.faq.q3': 'What payment methods do you accept?',
    'pricing.faq.a3': 'We accept all major credit cards and PayPal.',
    'pricing.faq.q4': 'Can I cancel anytime?',
    'pricing.faq.a4': 'Yes, you can cancel your subscription at any time.',
    
    // User Guide
    'guide.title': 'User Guide',
    'guide.subtitle': 'Learn how to make the most of SciencePapers',
    'guide.sections': 'Guide Sections',
    'guide.gettingStarted.title': 'Getting Started',
    'guide.gettingStarted.register.title': 'Create Your Account',
    'guide.gettingStarted.register.description': 'Sign up and set up your profile',
    'guide.gettingStarted.browse.title': 'Browse Papers',
    'guide.gettingStarted.browse.description': 'Find and filter past papers',
    'guide.gettingStarted.exam.title': 'Take Your First Exam',
    'guide.gettingStarted.exam.description': 'Start practicing with timed exams',
    'guide.aiFeatures.title': 'AI Features',
    'guide.aiFeatures.tutor.title': 'AI Tutor',
    'guide.aiFeatures.tutor.description': 'Get personalized help and feedback',
    'guide.aiFeatures.tamil.title': 'Tamil AI Support',
    'guide.aiFeatures.tamil.description': 'Use AI in Tamil language',
    'guide.aiFeatures.voice.title': 'Voice Navigation',
    'guide.aiFeatures.voice.description': 'Navigate using voice commands',
    'guide.uploading.title': 'Uploading Content',
    'guide.uploading.papers.title': 'Upload Papers',
    'guide.uploading.papers.description': 'Share your study materials',
    'guide.uploading.tamil.title': 'Tamil Content',
    'guide.uploading.tamil.description': 'Upload Tamil language papers',
    'guide.uploading.approval.title': 'Approval Process',
    'guide.uploading.approval.description': 'How content gets reviewed',
    'guide.advanced.title': 'Advanced Features',
    'guide.advanced.examSettings.title': 'Exam Settings',
    'guide.advanced.examSettings.description': 'Configure time limits and rules',
    'guide.advanced.analytics.title': 'Analytics Dashboard',
    'guide.advanced.analytics.description': 'Track your learning progress',
    'guide.advanced.collaboration.title': 'Collaboration',
    'guide.advanced.collaboration.description': 'Study with peers in real-time',
    'guide.search.title': 'Quick Help',
    'guide.search.q1': 'How do I upload Tamil papers?',
    'guide.search.a1': 'Go to Upload section and select Tamil as language',
    'guide.search.q2': 'How does AI tutoring work?',
    'guide.search.a2': 'AI analyzes your answers and provides personalized feedback',
    'guide.search.q3': 'Can I set custom exam times?',
    'guide.search.a3': 'Yes, admins can configure time limits for each paper',
    
    // Subjects
    'subject.chemistry': 'Chemistry',
    'subject.physics': 'Physics',
    'subject.biology': 'Biology',
    
    // Paper Card
    'paper.download': 'Download',
    'paper.view': 'View',
    'paper.startLearning': 'Start Learning',
    'paper.aiTutor': 'AI Tutor',
    'paper.solutions': 'Solutions',
    'paper.answerScheme': 'Answer Scheme',
    'paper.reward': 'Reward',
    
    // Filters
    'filter.title': 'Filters',
    'filter.clearAll': 'Clear all',
    'filter.difficulty': 'Difficulty Level',
    'filter.paperType': 'Paper Type',
    'filter.results': 'results',
    'filter.result': 'result',
    
    // Difficulty
    'difficulty.easy': 'Easy',
    'difficulty.medium': 'Medium',
    'difficulty.hard': 'Hard',
    
    // Exam Types
    'examType.1st-year-1st-term': '1st Year - 1st Term',
    'examType.1st-year-2nd-term': '1st Year - 2nd Term',
    'examType.1st-year-3rd-term': '1st Year - 3rd Term',
    'examType.2nd-year-1st-term': '2nd Year - 1st Term',
    'examType.2nd-year-2nd-term': '2nd Year - 2nd Term',
    'examType.2nd-year-3rd-term': '2nd Year - 3rd Term',
    'examType.practical': 'Practical Questions',
    'examType.past-paper': 'Past Papers',
    'examType.model-paper': 'Model Papers',
    
    // Common
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.days': 'days',
    'common.grade': 'Grade',
  },
  ta: {
    // Header
    'header.title': 'அறிவியல் தாள்கள்',
    'header.subtitle': 'கற்றல் • பயிற்சி • சிறப்பு',
    'header.search': 'தாள்கள், தலைப்புகளைத் தேடுங்கள்...',
    'header.progress': 'முன்னேற்றம்',
    'header.profile': 'சுயவிவரம்',
    'header.level': 'நிலை',
    'header.login': 'உள்நுழைவு',
    'header.register': 'பதிவு',
    
    // Navigation
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.papers': 'தாள்கள்',
    'nav.favorites': 'விருப்பங்கள்',
    'nav.downloads': 'பதிவிறக்கங்கள்',
    'nav.upload': 'பதிவேற்றம்',
    'nav.settings': 'அமைப்புகள்',
    'nav.pricing': 'விலை நிர்ணயம்',
    'nav.guide': 'பயனர் வழிகாட்டி',
    'nav.admin': 'நிர்வாகம்',
    
    // Auth
    'auth.login.title': 'மீண்டும் வரவேற்கிறோம்',
    'auth.login.subtitle': 'உங்கள் கணக்கில் உள்நுழையவும்',
    'auth.login.button': 'உள்நுழைவு',
    'auth.login.link': 'உள்நுழைவு',
    'auth.login.noAccount': 'கணக்கு இல்லையா?',
    'auth.register.title': 'கணக்கு உருவாக்கவும்',
    'auth.register.subtitle': 'ஆயிரக்கணக்கான மாணவர்களுடன் சேரவும்',
    'auth.register.button': 'கணக்கு உருவாக்கவும்',
    'auth.register.link': 'பதிவு செய்யவும்',
    'auth.register.hasAccount': 'ஏற்கனவே கணக்கு உள்ளதா?',
    'auth.email': 'மின்னஞ்சல்',
    'auth.email.placeholder': 'உங்கள் மின்னஞ்சலை உள்ளிடவும்',
    'auth.password': 'கடவுச்சொல்',
    'auth.password.placeholder': 'உங்கள் கடவுச்சொல்லை உள்ளிடவும்',
    'auth.confirmPassword': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'auth.confirmPassword.placeholder': 'உங்கள் கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'auth.name': 'முழு பெயர்',
    'auth.name.placeholder': 'உங்கள் முழு பெயரை உள்ளிடவும்',
    
    // Upload
    'upload.title': 'கல்வி உள்ளடக்கத்தை பதிவேற்றவும்',
    'upload.subtitle': 'உங்கள் தமிழ் தாள்கள், குறிப்புகள் மற்றும் படிப்பு பொருட்களைப் பகிரவும்',
    'upload.title.label': 'தலைப்பு',
    'upload.title.placeholder': 'உள்ளடக்க தலைப்பை உள்ளிடவும்',
    'upload.subject.label': 'பாடம்',
    'upload.subject.placeholder': 'பாடத்தைத் தேர்ந்தெடுக்கவும்',
    'upload.type.label': 'உள்ளடக்க வகை',
    'upload.type.pastpaper': 'கடந்த தாள்',
    
    'upload.type.model': 'மாதிரி கேள்விகள்',
    'upload.type.notes': 'குறிப்புகள்',
    'upload.type.answerScheme': 'பதில் திட்டம்',
    'upload.type.mindMap': 'மனப் படம்',
    'upload.type.shortMethod': 'குறுகிய முறை',
    'upload.language.label': 'மொழி',
    'upload.file.label': 'கோப்பை பதிவேற்றவும்',
    'upload.file.placeholder': 'கோப்பைத் தேர்ந்தெடுக்க கிளிக் செய்யவும் அல்லது இழுத்து விடவும்',
    'upload.file.formats': 'PDF, DOC, DOCX, TXT ஆதரிக்கிறது',
    'upload.analysis.title': 'AI உள்ளடக்க பகுப்பாய்வு',
    'upload.analysis.subject': 'கண்டறியப்பட்ட பாடம்',
    'upload.analysis.difficulty': 'சிரம நிலை',
    'upload.analysis.questions': 'கேள்வி எண்ணிக்கை',
    'upload.analysis.topics': 'தலைப்புகள்',
    'upload.submit': 'உள்ளடக்கத்தை பதிவேற்றவும்',
    'upload.uploading': 'பதிவேற்றுகிறது...',
    'upload.success': 'உள்ளடக்கம் வெற்றிகரமாக பதிவேற்றப்பட்டது! இது எங்கள் குழுவால் மதிப்பாய்வு செய்யப்படும்.',
    'upload.error': 'பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.',
    
    // Rest of Tamil translations...
    'subject.chemistry': 'வேதியியல்',
    'subject.physics': 'இயற்பியல்',
    'subject.biology': 'உயிரியல்',
    'common.back': 'பின்',
    'common.next': 'அடுத்து',
    'common.submit': 'சமர்பிக்கவும்',
    'common.cancel': 'ரத்து செய்',
    'common.save': 'சேமி',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
  },
  si: {
    // Header
    'header.title': 'විද්‍යා ප්‍රශ්න පත්‍ර',
    'header.subtitle': 'ඉගෙන ගන්න • පුහුණු වන්න • විශිෂ්ට වන්න',
    'header.search': 'ප්‍රශ්න පත්‍ර, මාතෘකා සොයන්න...',
    'header.progress': 'ප්‍රගතිය',
    'header.profile': 'පැතිකඩ',
    'header.level': 'මට්ටම',
    'header.login': 'ප්‍රවේශය',
    'header.register': 'ලියාපදිංචිය',
    
    // Navigation
    'nav.dashboard': 'උපකරණ පුවරුව',
    'nav.papers': 'ප්‍රශ්න පත්‍ර',
    'nav.favorites': 'ප්‍රියතම',
    'nav.downloads': 'බාගැනීම්',
    'nav.upload': 'උඩුගත කරන්න',
    'nav.settings': 'සැකසීම්',
    'nav.pricing': 'මිල ගණන්',
    'nav.guide': 'පරිශීලක මාර්ගෝපදේශය',
    'nav.admin': 'පරිපාලනය',
    
    // Rest of Sinhala translations...
    'subject.chemistry': 'රසායන විද්‍යාව',
    'subject.physics': 'භෞතික විද්‍යාව',
    'subject.biology': 'ජීව විද්‍යාව',
    'common.back': 'ආපසු',
    'common.next': 'ඊළඟ',
    'common.submit': 'ඉදිරිපත් කරන්න',
    'common.cancel': 'අවලංගු කරන්න',
    'common.save': 'සුරකින්න',
    'common.loading': 'පූරණය වෙමින්...',
    'common.error': 'දෝෂය',
    'common.success': 'සාර්ථකත්වය',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};