# Hackingly - LinkedIn Profile Analyzer

A comprehensive LinkedIn profile analysis tool that provides AI-powered insights and recommendations for professional growth.

## Features

### Multiple Input Methods
- **PDF Upload**: Export your LinkedIn profile as PDF and upload for analysis
- **Screenshots**: Take screenshots of your profile sections for instant analysis
- **Username**: Enter your LinkedIn username for direct profile fetching

### AI-Powered Analysis
- Comprehensive profile scoring across all sections
- Professional headline and about section rewrites
- Experience improvement suggestions with quantified achievements
- Skills gap analysis and recommendations
- Career match suggestions with match percentages
- Actionable insights for profile optimization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Gemini API key

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Integration

The username analysis feature requires the backend server to be running on `http://localhost:10000`. Make sure your backend is running and accessible before using the username input method.

## Usage

1. Navigate to the `/analyze` page
2. Choose your preferred input method:
   - **PDF**: Upload your exported LinkedIn PDF
   - **Screenshots**: Upload profile screenshots
   - **Username**: Enter your LinkedIn username (e.g., "john-doe")
3. Wait for the AI analysis to complete
4. Review your personalized insights and recommendations

## API Endpoints

- `POST /api/analyze-pdf` - Analyze LinkedIn PDF files
- `POST /api/analyze-images` - Analyze profile screenshots
- `POST /api/analyze-linkedin` - Analyze profile by username
- `POST /api/analyze` - General profile analysis

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini AI
- PDF.js (for PDF parsing)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
