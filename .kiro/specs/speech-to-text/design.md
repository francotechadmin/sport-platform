# Design Document

## Overview

This design implements speech-to-text functionality using the browser's built-in Web Speech API, integrating seamlessly with the existing chat interface. The solution leverages the existing microphone button in the chat input area and adds voice recognition capabilities without requiring external services or dependencies.

## Architecture

### Current State Analysis
- **Chat Interface**: Existing `ChatInterface` component with microphone button already present
- **Input System**: Textarea-based input with keyboard handling and auto-resize
- **UI Components**: Button components with proper accessibility and styling
- **State Management**: React hooks for chat state and conversation management

### Proposed Integration
- **Web Speech API**: Use `SpeechRecognition` interface for browser-based voice input
- **State Management**: Add speech recognition state to existing chat component
- **Visual Feedback**: Enhance existing microphone button with recording states
- **Error Handling**: Graceful fallbacks for unsupported browsers or permission issues

## Components and Interfaces

### 1. Speech Recognition Hook

#### Custom Hook for Speech Recognition
```typescript
interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  error: string | null;
  confidence: number;
}

interface SpeechRecognitionActions {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const useSpeechRecognition = (): SpeechRecognitionState & SpeechRecognitionActions => {
  const [state, setState] = useState<SpeechRecognitionState>({
    isListening: false,
    isSupported: typeof window !== 'undefined' && 'webkitSpeechRecognition' in window,
    transcript: '',
    error: null,
    confidence: 0
  });

  // Implementation details...
};
```

### 2. Enhanced Chat Interface Integration

#### Modified ChatInterface Component
```typescript
export default function ChatInterface() {
  // Existing state and hooks...
  const {
    isListening,
    isSupported,
    transcript,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Handle speech input completion
  useEffect(() => {
    if (transcript && !isListening) {
      // Append transcript to current input
      const newValue = input ? `${input} ${transcript}` : transcript;
      handleInputChange({
        target: { value: newValue }
      } as React.ChangeEvent<HTMLTextAreaElement>);
      
      // Reset transcript after use
      resetTranscript();
    }
  }, [transcript, isListening, input]);

  // Handle microphone button click
  const handleMicrophoneClick = () => {
    if (!isSupported) {
      // Show unsupported message
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };
}
```

### 3. Enhanced Microphone Button

#### Visual States for Recording
```typescript
const MicrophoneButton = ({ 
  isListening, 
  isSupported, 
  onClick 
}: MicrophoneButtonProps) => {
  if (!isSupported) {
    return null; // Hide button if not supported
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={`rounded-full h-10 w-10 flex-shrink-0 border-border hover:bg-muted transition-all duration-200 ${
        isListening 
          ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white animate-pulse' 
          : 'hover:bg-muted'
      }`}
      onClick={onClick}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      <Mic className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`} />
      <span className="sr-only">
        {isListening ? 'Stop recording' : 'Voice input'}
      </span>
    </Button>
  );
};
```

## Data Models

### Speech Recognition Configuration
```typescript
interface SpeechRecognitionConfig {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  grammars?: SpeechGrammarList;
}

const defaultConfig: SpeechRecognitionConfig = {
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  maxAlternatives: 1
};
```

### Speech Recognition Events
```typescript
interface SpeechRecognitionEvent {
  type: 'start' | 'end' | 'result' | 'error' | 'nomatch';
  transcript?: string;
  confidence?: number;
  error?: {
    code: string;
    message: string;
  };
}
```

## Error Handling

### Browser Compatibility
```typescript
const checkSpeechRecognitionSupport = (): {
  isSupported: boolean;
  reason?: string;
} => {
  if (typeof window === 'undefined') {
    return { isSupported: false, reason: 'Server-side rendering' };
  }

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return { 
      isSupported: false, 
      reason: 'Speech recognition not supported in this browser' 
    };
  }

  return { isSupported: true };
};
```

### Permission Handling
```typescript
const handleSpeechRecognitionError = (event: SpeechRecognitionErrorEvent) => {
  switch (event.error) {
    case 'not-allowed':
      return 'Microphone access denied. Please enable microphone permissions.';
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your audio settings.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    default:
      return 'Speech recognition error occurred. Please try again.';
  }
};
```

### Timeout Management
```typescript
const useSpeechTimeout = (isListening: boolean, onTimeout: () => void) => {
  useEffect(() => {
    if (!isListening) return;

    const timeoutId = setTimeout(() => {
      onTimeout();
    }, 30000); // 30 second timeout

    return () => clearTimeout(timeoutId);
  }, [isListening, onTimeout]);
};
```

## Testing Strategy

### Unit Tests
1. **Speech Recognition Hook Tests**
   - Test hook initialization and state management
   - Mock Web Speech API for consistent testing
   - Test error handling for various scenarios

2. **Component Integration Tests**
   - Test microphone button state changes
   - Verify transcript integration with input field
   - Test visual feedback during recording

### Browser Compatibility Tests
1. **Cross-Browser Testing**
   - Chrome/Chromium (primary support)
   - Safari (WebKit implementation)
   - Firefox (limited/no support)
   - Edge (Chromium-based)

2. **Feature Detection Tests**
   - Test graceful degradation when unsupported
   - Verify proper error messages
   - Test fallback behavior

## Implementation Details

### Web Speech API Integration
```typescript
const createSpeechRecognition = (): SpeechRecognition | null => {
  const SpeechRecognition = 
    window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.maxAlternatives = 1;

  return recognition;
};
```

### Event Handling
```typescript
const setupSpeechRecognitionEvents = (
  recognition: SpeechRecognition,
  callbacks: SpeechRecognitionCallbacks
) => {
  recognition.onstart = () => callbacks.onStart();
  recognition.onend = () => callbacks.onEnd();
  recognition.onerror = (event) => callbacks.onError(event);
  recognition.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    if (result.isFinal) {
      callbacks.onResult(result[0].transcript, result[0].confidence);
    }
  };
};
```

### Performance Considerations
1. **Memory Management**: Properly cleanup speech recognition instances
2. **Event Listeners**: Remove event listeners on component unmount
3. **State Updates**: Debounce interim results to avoid excessive re-renders
4. **Resource Usage**: Stop recognition when not needed to preserve battery

## Security and Privacy

### Data Handling
- **No Audio Storage**: Only process text transcripts, never store audio
- **Local Processing**: Use browser's built-in API, no external services
- **Permission Respect**: Immediately stop when permissions are revoked
- **User Control**: Always provide clear start/stop controls

### Browser Permissions
- **Microphone Access**: Request only when user initiates voice input
- **Permission Persistence**: Respect user's permission choices
- **Graceful Degradation**: Hide feature when permissions denied

## Migration Strategy

### Backward Compatibility
- **Existing Functionality**: All current chat features remain unchanged
- **Progressive Enhancement**: Voice input adds to existing text input
- **Fallback Behavior**: Graceful degradation when speech recognition unavailable

### Rollout Plan
1. **Phase 1**: Implement core speech recognition functionality
2. **Phase 2**: Add visual feedback and error handling
3. **Phase 3**: Optimize performance and add advanced features