# SciencePapers - Requirements & Dependencies

## Project Overview
SciencePapers is a modern React-based educational platform for chemistry, physics, and biology past papers with AI tutoring capabilities, multi-language support (Tamil & Sinhala), dark mode, user authentication, admin features, exam time management, and comprehensive dashboard functionality.

## System Requirements

### Node.js Version
- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

### Core Framework & Build Tools
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "vite": "^5.4.2",
  "@vitejs/plugin-react": "^4.3.1"
}
```

### Routing
```json
{
  "react-router-dom": "^6.20.1"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.18",
  "postcss": "^8.4.35"
}
```

### Icons & Animations
```json
{
  "lucide-react": "^0.344.0",
  "framer-motion": "^10.16.16"
}
```

### AI & Language Processing
```json
{
  "@google/generative-ai": "^0.2.1",
  "@tensorflow/tfjs": "^4.15.0",
  "@huggingface/inference": "^2.6.4"
}
```

### 3D Visualization & Advanced Features
```json
{
  "@react-three/fiber": "^8.15.12",
  "@react-three/drei": "^9.92.7",
  "@react-three/xr": "^5.7.1",
  "three": "^0.159.0",
  "react-katex": "^3.0.1",
  "katex": "^0.16.9"
}
```

### Voice & Speech
```json
{
  "react-speech-recognition": "^3.10.0",
  "regenerator-runtime": "^0.14.0"
}
```

### Real-time & Collaboration
```json
{
  "socket.io-client": "^4.7.4",
  "y-websocket": "^1.5.0",
  "yjs": "^13.6.10"
}
```

### Blockchain & Web3
```json
{
  "web3.storage": "^4.5.5",
  "ethers": "^6.9.0"
}
```

### Charts & Analytics
```json
{
  "chart.js": "^4.4.0",
  "react-chartjs-2": "^5.2.0",
  "recharts": "^2.8.0",
  "d3": "^7.8.5",
  "@types/d3": "^7.4.3"
}
```

### Utilities
```json
{
  "use-debounce": "^10.0.5",
  "uuid": "^9.0.1",
  "lodash": "^4.17.21",
  "date-fns": "^3.0.6",
  "axios": "^1.6.5"
}
```

### Development Dependencies
```json
{
  "typescript": "^5.5.3",
  "@types/react": "^18.3.5",
  "@types/react-dom": "^18.3.0",
  "@types/three": "^0.159.0",
  "eslint": "^9.9.1",
  "@eslint/js": "^9.9.1",
  "eslint-plugin-react-hooks": "^5.1.0-rc.0",
  "eslint-plugin-react-refresh": "^0.4.11",
  "typescript-eslint": "^8.3.0",
  "globals": "^15.9.0"
}
```

## Installation Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd sciencepapers
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```

### 6. Preview Production Build
```bash
npm run preview
```

## Key Features & Technologies

### 🎨 **Styling & UI**
- **Tailwind CSS**: Utility-first CSS framework
- **Dark Mode**: System-wide dark/light theme support with toggle
- **Responsive Design**: Mobile-first responsive layout
- **Custom Fonts**: Noto Sans Tamil & Sinhala for multi-language support
- **Framer Motion**: Smooth animations and transitions

### 🌐 **Multi-Language Support**
- **Languages**: English, Tamil (தமிழ்), Sinhala (සිංහල)
- **Font Support**: Google Fonts integration for Tamil and Sinhala
- **Context-based**: React Context for language management
- **AI Translation**: Tamil AI understanding and response generation

### 🔐 **Authentication & User Management**
- **User Registration/Login**: Email-based authentication
- **Role-based Access**: Student, Teacher, Admin roles
- **Profile Management**: User preferences and settings
- **Subscription Plans**: Free, Premium, Pro tiers
- **Session Management**: Persistent login state

### 🧠 **AI Features**
- **Tamil AI Support**: Google Gemini integration for Tamil language understanding
- **AI Tutoring**: Interactive tutoring sessions with personalized feedback
- **AI Grading**: Automated answer evaluation with detailed feedback
- **Multi-language AI**: AI responses in Tamil, Sinhala, and English
- **Smart Content Analysis**: Automatic subject and difficulty detection
- **Voice Navigation**: Speech recognition and text-to-speech

### 📚 **Content Management**
- **Paper Upload**: Support for Tamil/Sinhala content upload
- **Content Types**: Past papers, model questions, notes, answer schemes, mind maps, short methods
- **AI Content Analysis**: Automatic categorization and metadata extraction
- **Admin Approval**: Content review and approval workflow
- **File Support**: PDF, DOC, DOCX, TXT formats

### ⏱️ **Exam Management**
- **Time Limits**: Customizable exam duration per paper
- **Exam Settings**: Configurable rules (pause, timer, auto-submit, shuffle)
- **Real-time Timer**: Visual countdown with warnings
- **Attempt Limits**: Maximum attempts per exam
- **Availability Windows**: Start and end date/time controls
- **Instructions**: Custom exam instructions

### 📊 **Advanced Analytics**
- **Learning Progress**: XP system with levels and achievements
- **Subject Mastery**: Progress tracking per subject
- **Performance Analytics**: Detailed charts and insights
- **Learning Streaks**: Daily activity tracking
- **Time Analytics**: Study time and efficiency metrics
- **Blockchain Certificates**: NFT-based achievement certificates

### 🎯 **Academic Structure**
- **Paper Types**: 
  - 1st Year (1st, 2nd, 3rd Term)
  - 2nd Year (1st, 2nd, 3rd Term)
  - Practical Questions
  - Past Papers
  - Model Papers
- **Subjects**: Chemistry, Physics, Biology
- **Difficulty Levels**: Easy, Medium, Hard
- **XP Rewards**: Points based on difficulty and completion

### 🔬 **Advanced Visualizations**
- **3D Molecular Viewer**: Interactive molecular models using Three.js
- **LaTeX Equation Renderer**: Real-time mathematical equation rendering
- **AR Preview**: Augmented reality paper preview (experimental)
- **Interactive Charts**: Progress and analytics visualization

### 🤝 **Collaboration Features**
- **Real-time Collaboration**: Study with peers in real-time
- **Voice Chat**: Integrated voice communication
- **Shared Annotations**: Collaborative note-taking
- **Screen Sharing**: Share study materials
- **Group Sessions**: Multi-user study rooms

### 🏗️ **Admin Features**
- **Exam Settings Management**: Configure time limits and rules
- **Content Moderation**: Review and approve uploaded content
- **User Management**: Manage student and teacher accounts
- **Analytics Dashboard**: Platform-wide usage statistics
- **Subscription Management**: Handle user subscriptions

### 📱 **User Experience**
- **Search & Filter**: Advanced filtering by subject, difficulty, paper type
- **Favorites**: Save and manage favorite papers
- **Progress Tracking**: XP system and achievement tracking
- **Student Dashboard**: Comprehensive progress analytics
- **Settings Panel**: Customizable user preferences
- **User Guide**: Interactive tutorial system

### ⚡ **Performance**
- **Vite**: Fast build tool and dev server
- **Code Splitting**: Optimized bundle sizes
- **Debounced Search**: Efficient search performance
- **Lazy Loading**: Optimized component loading
- **Caching**: Intelligent data caching strategies

### 🔧 **Technical Architecture**
- **Context Providers**: Auth, Admin, Theme, Language contexts
- **Service Layer**: Tamil AI service for language processing
- **Type Safety**: Comprehensive TypeScript definitions
- **Error Handling**: Robust error boundaries and fallbacks
- **State Management**: React Context and local state

## File Structure
```
src/
├── components/          # React components
│   ├── Auth/           # Authentication components
│   ├── Upload/         # File upload components
│   ├── Admin/          # Admin dashboard components
│   ├── Exam/           # Exam timer and management
│   ├── Settings/       # User settings components
│   ├── Pricing/        # Subscription plans
│   ├── UserGuide/      # Interactive tutorials
│   └── ...
├── contexts/           # React contexts
│   ├── AuthContext.tsx
│   ├── AdminContext.tsx
│   ├── ThemeContext.tsx
│   └── LanguageContext.tsx
├── services/           # External services
│   └── tamilAI.ts     # Tamil AI integration
├── data/              # Mock data and utilities
│   └── mockData.ts
├── types/             # TypeScript type definitions
│   └── index.ts
└── App.tsx           # Main application component
```

## Environment Setup

### Development
```bash
npm run dev
```
- Starts development server on `http://localhost:5173`
- Hot module replacement enabled
- TypeScript checking enabled
- Tamil AI service integration

### Production
```bash
npm run build
npm run preview
```
- Optimized production build
- Static file generation
- Performance optimizations applied
- Tamil font optimization

## Browser Compatibility
- Modern ES6+ features used
- CSS Grid and Flexbox for layouts
- Web APIs: localStorage, fetch, Speech Recognition, Speech Synthesis
- WebRTC for real-time collaboration
- No IE support (modern browsers only)

## Performance Considerations
- Bundle size optimized with Vite
- Tree shaking enabled
- CSS purging with Tailwind
- Image optimization recommended
- Lazy loading for routes and components
- Tamil font subset loading

## Security Features
- XSS protection through React
- Content Security Policy ready
- No inline scripts
- Sanitized user inputs
- Secure authentication flow
- Role-based access control

## Accessibility
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- Multi-language screen reader support

## Tamil Language Features
- **Tamil Content Upload**: Support for Tamil PDF and text files
- **AI Tamil Understanding**: Google Gemini integration for Tamil text analysis
- **Tamil UI**: Complete Tamil translation of interface
- **Tamil Fonts**: Noto Sans Tamil font integration
- **Tamil Voice**: Text-to-speech in Tamil (browser dependent)
- **Tamil Search**: Search Tamil content and papers

## Admin Capabilities
- **Exam Time Management**: Set custom time limits per paper
- **Content Approval**: Review uploaded Tamil/Sinhala content
- **User Role Management**: Assign student/teacher/admin roles
- **Analytics Access**: View platform-wide usage statistics
- **Subscription Control**: Manage user subscription levels

## Future Enhancements
- PWA capabilities with offline Tamil content
- Advanced Tamil NLP features
- Real-time Tamil translation
- Tamil voice recognition
- Mobile app version with Tamil support
- Advanced blockchain integration
- Enhanced AR/VR features
- Microservices architecture
- Advanced analytics and ML features