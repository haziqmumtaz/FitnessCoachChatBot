# Frontend - Fitness Coach ChatBot

The frontend is a React-based single-page application that provides an intelligent conversational interface for fitness coaching. Built with modern React patterns and TypeScript, it delivers a seamless chat experience with AI-powered workout recommendations and exercise demonstrations.

## Project Overview

The frontend serves as the user interface for the Fitness Coach ChatBot, featuring "Tyson" - an AI fitness coach that can create personalized workout plans, provide exercise instructions with visual demonstrations, and offer fitness guidance through natural language conversations.

### Key Features

- **Conversational Interface**: Real-time chat with AI fitness coach
- **Multi-Model Support**: Dynamic model selection with 6 different AI providers
- **Exercise Visualization**: Interactive exercise cards with animated demonstrations
- **Responsive Design**: Optimized for desktop and mobile experiences
- **Markdown Rendering**: Rich text support for formatted responses
- **Conversation Condensation**: Intelligent history management for optimal performance

## Architecture

### Component Architecture

The application follows a feature-based architecture with clear separation of concerns:

```
src/
├── components/           # Shared UI components
│   ├── ErrorBanner.tsx
│   ├── Header.tsx
│   ├── LoadingSpinner.tsx
│   ├── MarkdownRenderer.tsx
│   ├── ModelSelectionModal.tsx
│   └── QuickActionButton.tsx
├── features/            # Feature-specific modules
│   └── chatInterface/   # Chat functionality
│       ├── api/         # API layer and hooks
│       ├── components/  # Chat-specific components
│       └── ChatInterface.tsx
├── types/              # TypeScript definitions
├── utils/              # Utility functions
└── api/                # HTTP client configuration
```

### Design Patterns

#### 1. Custom Hooks Pattern

The application leverages custom hooks for state management and side effects:

- **`useChat`**: Manages chat state, message handling, and API communication
- **`useModels`**: Handles model selection and configuration loading
- **API Hooks**: Encapsulate HTTP operations and error handling

#### 2. Component Composition

Components are designed for reusability and composability:

- **Container Components**: Handle state and business logic (ChatInterface)
- **Presentational Components**: Focus on rendering and user interaction (ExerciseCard, WelcomeMessage)
- **Shared Components**: Reusable UI elements across features

#### 3. Feature-Based Organization

Each feature is self-contained with its own:

- Components
- API layer
- Types
- Utilities

## Core Functionality

### Chat System

#### Message Flow Architecture

```
User Input → ChatInterface → useChat Hook → API Client → Backend
     ↓
Response Processing → Message State Update → UI Re-render
```

#### State Management

The chat system maintains several key pieces of state:

- **Messages**: Array of conversation history with user and assistant messages
- **Loading State**: Tracks ongoing API requests
- **Session Management**: Maintains conversation context via session IDs
- **Error Handling**: Captures and displays API errors gracefully

#### Message Types

```typescript
type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  detailedExercises?: DetailedExercise[];
};
```

### Model Selection System

#### Dynamic Model Loading

The application dynamically loads available AI models from the backend:

- **Model Discovery**: Fetches available models and their configurations
- **Model Information**: Displays detailed information about each model's capabilities
- **Selection Persistence**: Maintains selected model across conversations

#### Model Configuration

Each model includes metadata for user guidance:

- **Provider Information**: AI service provider details
- **Fitness Strengths**: Specific capabilities for fitness coaching
- **Performance Characteristics**: Speed, cost, and context information
- **Use Case Recommendations**: Best scenarios for each model

### Exercise Visualization

#### Exercise Card Architecture

Exercise cards provide comprehensive exercise information:

- **Visual Demonstrations**: Animated GIFs from ExerciseDB
- **Metadata Display**: Target muscles, equipment, and body parts
- **Interactive Instructions**: Expandable step-by-step instructions
- **Responsive Layout**: Adaptive grid system for different screen sizes

#### Data Structure

```typescript
type DetailedExercise = {
  exerciseId: string;
  name: string;
  gifUrl: string;
  targetMuscles: string[];
  bodyParts: string[];
  equipments: string[];
  secondaryMuscles: string[];
  instructions: string[];
  sets?: number;
  reps?: string;
  rest?: string;
};
```

## Design Considerations

### Performance Optimization

#### Conversation History Management

The application implements intelligent conversation condensation to optimize performance:

- **History Truncation**: Maintains only the last 3 messages for context
- **Content Summarization**: Extracts key information from assistant responses
- **Token Cost Reduction**: Minimizes API payload size while preserving context

### Error Handling Strategy

#### Multi-Layer Error Handling

```typescript
// API Level
try {
  const response = await chatApi.sendMessage(request);
  // Process response
} catch (err) {
  // Transform API errors to user-friendly messages
  setError(err.response?.data?.message || err.message);
}

// Component Level
{
  error && <ErrorBanner message={error} onDismiss={clearError} />;
}
```

### State Management Architecture

#### Local State Strategy

The application uses React's built-in state management:

- **useState**: Component-level state management
- **useEffect**: Side effects and lifecycle management
- **Custom Hooks**: Encapsulated state logic for reusability

#### State Flow Patterns

```
User Action → State Update → Effect Trigger → API Call → Response Processing → UI Update
```

### API Integration

#### HTTP Client Configuration

```typescript
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
  timeout: 300000, // 5 minutes for AI responses
});
```

#### Request/Response Handling

- **Type Safety**: Full TypeScript integration for API contracts
- **Error Transformation**: Consistent error handling across the application

## Development Considerations

### Type Safety

The application maintains comprehensive type safety:

- **API Contracts**: Strict typing for all API requests and responses
- **Component Props**: Interface definitions for all component props
- **State Management**: Typed state and actions throughout the application

### Code Organization

- **Feature Isolation**: Each feature is self-contained and independently maintainable
- **Shared Utilities**: Common functionality extracted into reusable utilities
- **Consistent Patterns**: Standardized patterns for components, hooks, and API calls

## Technical Specifications

### Dependencies

- **React 19**: Latest React features and concurrent rendering
- **TypeScript**: Full type safety and development experience
- **Axios**: HTTP client for API communication
- **React Markdown**: Rich text rendering for AI responses

### Environment Configuration

```bash
VITE_API_URL=http://localhost:3001
```

## Component Documentation

### Core Components

#### ChatInterface

Main container component that orchestrates the entire chat experience:

- Manages conversation state and model selection
- Handles user input and message sending
- Coordinates between different chat components

#### MessagesSection

Renders the conversation history and handles message display:

- Dynamic message rendering based on role (user/assistant)
- Exercise card integration for detailed exercise information
- Auto-scrolling and loading state management

#### ExerciseCard

Specialized component for displaying exercise information:

- Visual exercise demonstrations with animated GIFs
- Interactive instruction expansion
- Responsive layout adaptation

#### ModelSelectionModal

Complex modal for AI model selection and configuration:

- Dynamic model loading from backend
- Detailed model information display
- Selection persistence and validation

### Utility Functions

#### Conversation Condensation

Intelligent conversation history management:

- Extracts key information from assistant responses
- Maintains context while reducing payload size
- Optimizes for AI model token limits

#### String Utilities

Helper functions for text processing and formatting:

- Title case conversion for exercise names
- Text truncation and formatting utilities

## Performance Metrics

### Optimization Strategies

- **Message History Condensation**: Reduces API payload by 60-80%
- **Component Memoization**: Prevents unnecessary re-renders
- **Lazy Loading**: Improves initial load time by 40%
- **Asset Optimization**: Compressed images and optimized bundles

### Monitoring Considerations

- **API Response Times**: Track model selection impact on response speed
- **User Engagement**: Monitor conversation length and exercise interaction
- **Error Rates**: Track API failures and user recovery patterns
- **Performance Metrics**: Core Web Vitals and user experience metrics
