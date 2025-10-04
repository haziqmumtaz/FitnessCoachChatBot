# Fitness Coach ChatBot

The **Fitness Coach ChatBot** is an AI-powered fitness assistant web application that provides personalized workout plans and exercise recommendations through an intelligent conversational interface. Built with React and Node.js, it leverages multiple AI models and integrates with ExerciseDB for comprehensive exercise data.

## Project Overview

This application features "Tyson" - an AI fitness coach that can create custom workout plans, provide exercise instructions with visual demonstrations, and offer personalized fitness advice based on user requirements including duration, target muscles, available equipment, and fitness goals.

### Key Features

- **AI-Powered Chat Interface**: Conversational fitness coaching with multiple AI model support
- **Personalized Workout Generation**: Create custom workouts based on duration, target muscles, and equipment
- **Exercise Database Integration**: Real-time access to ExerciseDB for comprehensive exercise information
- **Visual Exercise Demonstrations**: Animated GIF demonstrations for each exercise
- **Multi-Model Support**: Choose from 6 different AI models optimized for different fitness scenarios
- **Responsive Design**: Modern UI built with React that works on all devices

## Architecture

This is a **monorepo** containing two main applications - a React frontend and a Node.js backend. It uses a workspace configuration for efficient development and deployment.

## Project Structure

```
FitnessCoachChatBot/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ErrorBanner.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── ModelSelectionModal.tsx
│   │   │   └── QuickActionButton.tsx
│   │   ├── features/           # Feature-based modules
│   │   │   └── chatInterface/  # Chat interface feature
│   │   │       ├── api/        # API layer and hooks
│   │   │       ├── components/ # Chat-specific components
│   │   │       │   ├── ExerciseCard.tsx
│   │   │       │   ├── MessagesSection.tsx
│   │   │       │   └── WelcomeMessage.tsx
│   │   │       └── ChatInterface.tsx
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Utility functions
│   │   └── api/               # HTTP client configuration
│   ├── public/                # Static public assets
│   └── package.json
├── backend/                     # Node.js backend API
│   ├── src/
│   │   ├── http/              # HTTP routes and controllers
│   │   │   ├── schemas/       # Request/response validation schemas
│   │   │   └── chat.http.ts   # Chat endpoints
│   │   ├── service/           # Business logic layer
│   │   │   ├── chat.service.ts
│   │   │   ├── intent.service.ts
│   │   │   ├── model.service.ts
│   │   │   └── tool.service.ts
│   │   ├── constants/         # Application constants and prompts
│   │   ├── config/            # Configuration and dependency injection
│   │   ├── middlewares/       # Koa middlewares
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   └── package.json
├── .gitignore                 # Git ignore rules
└── package.json               # Root package with workspace config
```

### Environment & Configuration

#### Environment Variables

The application uses environment variables for AI model API keys. Create the following files as needed:

**Backend (.env)**

```bash
# Required API Keys
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional configuration
PORT=3001
```

**Frontend (.env.local or .env)**

```bash
VITE_API_URL=http://localhost:3001
```

### Frontend (`@fitnesscoach/frontend`)

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Markdown**: React Markdown with GitHub Flavored Markdown support

### Backend (`@fitnesscoach/backend`)

- **Framework**: Koa.js with TypeScript
- **AI Models**: Multiple provider support (Groq, DeepSeek, Google Gemini)
- **Validation**: Zod schemas for request/response validation
- **Dependency Injection**: Inversify for clean architecture
- **External APIs**: ExerciseDB integration for exercise data
- **Development**: tsx for hot reloading

### Development Tools

- **Concurrently** - Run multiple commands concurrently for monorepo management
- **TypeScript** - Full type safety across the application
- **ESLint** - Code linting and formatting

## Available AI Models

The application supports 6 different AI models, each optimized for different fitness coaching scenarios:

| Model                   | Provider          | Best For                 |
| ----------------------- | ----------------- | ------------------------ |
| **GPT OSS 120b**        | OpenAI (via Groq) | Complex workout planning |
| **Llama 3.3 Versatile** | Meta (via Groq)   | General fitness coaching |
| **Llama 3.1 Instant**   | Meta (via Groq)   | Quick responses          |
| **DeepSeek Chat**       | DeepSeek          | Technical fitness advice |
| **Gemini 2.0 Flash**    | Google            | Visual learning          |
| **Llama Guard 4**       | Meta (via Groq)   | Content moderation       |

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **API Keys** for AI providers (Groq, DeepSeek, Google Gemini)

### Installation and Running the Application

**Install all dependencies**

```bash
npm install
```

**Set up environment variables**

```bash
# Copy the example environment file
cp backend/.env.example backend/.env

# Edit backend/.env with your API keys
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Start development servers**

```bash
npm run dev
```

This will start:

- Backend API server on `http://localhost:3001`
- Frontend development server on `http://localhost:5173`

### Production Deployment

**Build both applications**

```bash
npm run build
```

**Start production servers**

```bash
npm run start
```

This will start:

- Backend API server on `http://localhost:3001`
- Frontend production server on `http://localhost:8080`

## Development

### Available Scripts

| Command                | Description                                         |
| ---------------------- | --------------------------------------------------- |
| `npm run dev`          | Start both frontend and backend in development mode |
| `npm run dev:backend`  | Start only the backend server                       |
| `npm run dev:frontend` | Start only the frontend development server          |
| `npm run build`        | Build both applications for production              |
| `npm run start`        | Start production servers                            |
| `npm run clean`        | Clean all node_modules and build artifacts          |
| `npm run lint`         | Run linting for both frontend and backend           |

## API Endpoints

The backend provides a RESTful API with the following endpoints:

| Method | Endpoint       | Description                   |
| ------ | -------------- | ----------------------------- |
| `POST` | `/chat`        | Send chat message to AI coach |
| `GET`  | `/chat/models` | Get available AI models       |

### Example API Usage

```bash
# Send a chat message
curl -X POST http://localhost:3001/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a 30-minute upper body workout",
    "model": "GPT OSS 120b",
    "conversationHistory": [],
    "sessionId": "optional-session-id"
  }'

# Get available models
curl http://localhost:3001/chat/models
```

## User Interface

The application provides a modern, responsive chat interface with:

- **Welcome Screen**: Introduction with Tyson's branding and quick action buttons
- **Chat Interface**:
  - Real-time conversation with the AI fitness coach
  - Message history with conversation context
  - Loading states and error handling
- **Exercise Cards**: Visual exercise demonstrations with:
  - Animated GIF demonstrations
  - Target muscle information
  - Equipment requirements
  - Step-by-step instructions
- **Model Selection**: Choose from 6 different AI models optimized for different scenarios
- **Responsive Design**: Optimized for both desktop and mobile devices

## Core Features

### Workout Generation

- **Intent Detection**: Automatically understands workout requests vs. exercise lookups or unrelated queries
- **Parameter Extraction**: Extracts duration, target muscles, equipment, and other preferences
- **Exercise Database Tool Call Integration**: Fetches exercises from ExerciseDB based on user criteria
- **Structured Responses**: Provides both conversational coaching and detailed exercise information

### Exercise Information

- **Visual Demonstrations**: Animated GIFs for each exercise
- **Detailed Instructions**: Step-by-step exercise instructions
- **Equipment Requirements**: Clear equipment and setup information
- **Target Muscles**: Specific muscle groups targeted by each exercise

### Conversation Management

- **Session Persistence**: Maintains conversation context across messages
- **History Condensation**: Intelligently manages conversation history for optimal AI responses to reduce token cost
- **Error Handling**: Graceful error handling with user-friendly messages

## Getting Started with Tyson

1. **Choose Your Model**: Select an AI model based on your needs (complex planning, quick responses, technical advice, etc.)
2. **Ask for Workouts**: Use natural language to request workouts:
   - "Create a 30-minute upper body workout"
   - "Give me a 45-minute leg workout with dumbbells"
   - "Plan a 20-minute ab routine with no equipment"
3. **Get Exercise Details**: Click on exercise cards to see detailed instructions and demonstrations
4. **Request Variations**: Ask for different exercises or modifications
5. **Continue Conversations**: Build on previous messages for personalized recommendations

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Koa.js, TypeScript, Inversify
- **AI Integration**: Multiple providers (Groq, DeepSeek, Google Gemini)
- **External APIs Tool Calling**: ExerciseDB for exercise data
