# SciencePapers - AI-Powered Educational Platform

A revolutionary AI-powered educational platform with Tamil language support, 3D molecular visualization, blockchain integration, predictive ML features, real-time collaboration, advanced analytics, immersive AR/VR experiences, exam time management, comprehensive admin features, and full Supabase backend integration.

## Features

- Multi-language support (English, Tamil, Sinhala)
- AI-powered tutoring and content analysis
- 3D molecular visualization
- Real-time collaboration
- Advanced analytics dashboard
- Exam time management
- Blockchain integration for achievements
- Voice navigation
- AR preview
- Comprehensive admin features

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **AI Integration**: Google Gemini, TensorFlow.js
- **3D Visualization**: Three.js, React Three Fiber
- **Blockchain**: Ethereum-based NFT certificates

## Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Supabase account
- Supabase CLI (optional, for local development)

## Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/sciencepapers.git
cd sciencepapers

# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

### Method 1: Using Deployment Script

We've provided a deployment helper script that will guide you through the process:

```bash
node deploy.js
```

Follow the instructions provided by the script.

### Method 2: Manual Deployment to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

3. Login to Netlify:
   ```bash
   netlify login
   ```

4. Deploy to Netlify:
   ```bash
   netlify deploy
   ```

5. Follow the prompts:
   - Create & configure a new site
   - Select your team
   - Enter a site name (or leave blank for a random name)
   - For the publish directory, enter: `dist`

6. Set up environment variables in Netlify:
   - Go to your Netlify site settings
   - Navigate to "Site settings" > "Environment variables"
   - Add the following environment variables:
     - `VITE_SUPABASE_URL`: Your Supabase URL
     - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

7. For production deployment:
   ```bash
   netlify deploy --prod
   ```

## Database Migrations

The database schema is defined in SQL migration files in the `supabase/migrations` directory. These migrations are automatically applied when the Supabase project is created or updated.

To apply migrations manually (requires Supabase CLI):

```bash
supabase db push
```

## Edge Functions

Edge functions are deployed automatically with the Supabase project. The functions are defined in the `supabase/functions` directory.

## License

This project is licensed under the MIT License - see the LICENSE file for details.