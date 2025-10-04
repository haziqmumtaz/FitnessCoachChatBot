# Backend - Fitness Coach ChatBot

The backend is a Node.js API server built with Koa.js that powers the AI-driven fitness coaching experience. It orchestrates multiple AI models, integrates with ExerciseDB for exercise data, and provides intelligent intent detection and workout generation through a clean, service-oriented architecture.

## Project Overview

The backend serves as the core intelligence layer for the Fitness Coach ChatBot, handling AI model orchestration, exercise data integration, intent detection, and workout generation. It implements a sophisticated pipeline that processes user requests, detects fitness-related intents, and generates personalized workout recommendations.

### Key Features

- **Multi-Model AI Integration**: Support for 6 (and more in the future) different AI providers with unified interface
- **Intent Detection Pipeline**: Intelligent classification of user requests and parameter extraction
- **Exercise Database Integration**: Real-time access to ExerciseDB for comprehensive exercise information
- **Tool Calling System**: Dynamic function calling for AI models to fetch exercise data
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Dependency Injection**: Clean architecture with Inversify container

## Architecture

### Service-Oriented Architecture

The backend follows a clean, service-oriented architecture with clear separation of concerns:

```
src/
├── service/              # Business logic layer
│   ├── chat.service.ts   # Main orchestration service
│   ├── intent.service.ts # Intent detection and classification
│   ├── model.service.ts  # AI model provider abstraction
│   └── tool.service.ts   # External API integration
├── http/                 # HTTP layer
│   ├── schemas/          # Request/response validation
│   └── chat.http.ts      # API endpoints
├── config/               # Configuration and DI
├── constants/            # Application constants and prompts
├── middlewares/          # Koa middlewares
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

### Design Patterns

#### 1. Dependency Injection Pattern

The application uses Inversify for dependency injection, promoting loose coupling and testability:

```typescript
// Service registration
container.bind<IChatService>(TYPES.ChatService).to(ChatService);
container.bind<IModelProvider>(TYPES.ModelProvider).to(ModelProvider);

// Service resolution
const chatService = container.get<IChatService>(TYPES.ChatService);
```

#### 2. Result Pattern

Consistent error handling using a Result pattern for all service operations:

```typescript
export type Result<T> = Success<T> | Failure;

// Success response
return success(chatResponse);

// Failure response
return failure("Model not supported", "MODEL_ERROR", errorDetails);
```

#### 3. Provider Pattern

Abstract model providers enable easy addition of new AI services:

```typescript
export interface IModelProvider {
  chat(
    messages: ChatMessage[],
    options?: ModelProviderOptions
  ): Promise<Result<ModelProviderResponse>>;
  getAvailableModels(): Promise<Result<AvailableModels>>;
}
```

## Core Functionality

### Chat Service Architecture

#### Request Processing Pipeline

```
User Request → Intent Detection → Tool Calling → Workout Generation → Response Formatting
```

#### Service Orchestration

The `ChatService` orchestrates the entire conversation flow:

1. **Intent Detection**: Analyzes user messages to understand fitness-related intents
2. **Guardrail Checking**: Validates requests against safety and scope constraints
3. **Tool Orchestration**: Coordinates AI model interactions with external APIs
4. **Response Generation**: Formats and structures final responses

### Intent Detection System

#### Classification Pipeline

The intent detection system analyzes user messages to determine:

- **Intent Type**: `workout_generation`, `exercise_lookup`, or `exercise_variation`
- **Parameter Extraction**: Duration, target muscles, equipment, intensity level
- **Guardrail Validation**: Ensures requests stay within fitness domain
- **Tool Call Decision**: Determines if external APIs should be invoked

#### Parameter Extraction Logic

```typescript
type WorkoutIntent = {
  type: IntentType;
  confidence: number;
  extractedParams?: {
    targetMuscles?: string[];
    bodyParts?: string[];
    equipment?: string[];
    duration?: number;
    numExercises?: number;
    avoidMuscles?: string[];
  };
};
```

#### Exercise Calculation Algorithm

- **Duration-Based**: `numExercises = Math.floor(duration / 4)` (4 minutes per exercise)
- **Default Fallback**: 5 exercises if no duration specified
- **Muscle Group Mapping**: Maps user terms to ExerciseDB-compatible values

### Model Provider System

#### Multi-Provider Architecture

The `ModelProvider` abstracts different AI services behind a unified interface:

- **OpenAI Compatible**: Works with Groq, DeepSeek, Google Gemini
- **Dynamic Configuration**: Runtime model selection and configuration
- **Tool Calling Support**: Enables AI models to call external functions

#### Model Configuration

```typescript
type ModelConfig = {
  name: string;
  provider: string;
  baseURL?: string;
  apiKey: string;
  showInDropdown?: boolean;
  info: ModelInfo;
};
```

#### Provider-Specific Handling

- **Groq Integration**: High-speed inference for multiple models
- **DeepSeek Support**: Advanced reasoning capabilities
- **Google Gemini**: Multimodal capabilities and large context windows
- **Fallback Mechanisms**: Graceful handling of provider unavailability

### Tool Service Integration

#### ExerciseDB Integration

The `ToolService` provides seamless integration with ExerciseDB:

- **Fuzzy Search**: Intelligent exercise matching across multiple fields
- **Variation Detection**: Smart alternatives for exercise variations
- **Data Transformation**: Converts ExerciseDB format to application format

#### Tool Calling Architecture

```typescript
type Tool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required: string[];
    };
  };
};
```

## Design Considerations

### Error Handling Strategy

#### Multi-Layer Error Handling

```typescript
// Service Level
try {
  const result = await this.modelProvider.chat(messages, options);
  if ("error" in result) {
    return failure("Model error", "MODEL_ERROR", result.error);
  }
  return success(result);
} catch (error: any) {
  return failure("Service error", "SERVICE_ERROR", error.message);
}

// Middleware Level
export function errorHandler(): Middleware {
  return async (ctx, next) => {
    try {
      await next();
      // Handle Result pattern responses
      if (ctx.body && "error" in ctx.body) {
        ctx.status = 500;
      }
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        ctx.status = 400;
        ctx.body = { error: "Validation failed", details: error.message };
      }
    }
  };
}
```

### Middleware Stack

1. **Request Logging**: Performance monitoring and debugging
2. **Error Handling**: Centralized error processing and formatting
3. **Body Parsing**: JSON request/response handling
4. **CORS**: Cross-origin request support for frontend integration

## Service Layer Documentation

### Core Services

#### ChatService

Main orchestration service that coordinates the entire conversation flow:

- **Intent Coordination**: Orchestrates intent detection and parameter extraction
- **Tool Orchestration**: Manages AI model interactions with external APIs
- **Response Generation**: Formats and structures final responses

#### IntentService

Specialized service for understanding user intentions:

- **Message Analysis**: Processes user messages and conversation history
- **Parameter Extraction**: Identifies workout parameters from natural language
- **Guardrail Enforcement**: Ensures requests stay within fitness domain
- **Confidence Scoring**: Provides reliability metrics for intent detection

#### ModelProvider

Abstraction layer for multiple AI model providers:

- **Unified Interface**: Consistent API across different AI services
- **Dynamic Configuration**: Runtime model selection and parameter tuning
- **Tool Calling**: Enables AI models to invoke external functions

#### ToolService

Integration layer for external APIs and data sources:

- **ExerciseDB Integration**: Comprehensive exercise data access
- **Search Optimization**: Intelligent exercise matching and filtering
- **Data Transformation**: Converts external formats to application models
- **Error Recovery**: Graceful handling of API failures and timeouts

## Development Considerations

### Type Safety

The backend maintains comprehensive type safety:

- **Service Interfaces**: Strict typing for all service contracts
- **API Contracts**: Type-safe request/response handling
- **Data Models**: Strongly typed data structures throughout

### Testing Strategy

- **Unit Tests**: Individual service testing with mocked dependencies
- **Integration Tests**: End-to-end API testing with real services
- **Performance Tests**: Load testing and performance benchmarking

### Code Organization

- **Service Isolation**: Each service is independently testable and maintainable
- **Shared Types**: Common type definitions for consistency
- **Utility Functions**: Reusable functionality extracted into utilities

## Technical Specifications

### Dependencies

- **Koa.js**: Lightweight web framework with middleware support
- **TypeScript**: Full type safety and modern JavaScript features
- **Inversify**: Dependency injection container for clean architecture
- **Zod**: Runtime type validation and schema definition
- **Axios**: HTTP client for external API integration

### Environment Configuration

```bash
# Required API Keys
GROQ_API_KEY=your_groq_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional Configuration
PORT=3001
NODE_ENV=production
```
