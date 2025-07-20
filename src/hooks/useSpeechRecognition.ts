import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

declare const SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  finalTranscript: string;
  interimTranscript: string;
  error: string | null;
  confidence: number;
}

interface SpeechRecognitionActions {
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

interface SpeechRecognitionConfig {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  timeout: number; // in milliseconds
}

const defaultConfig: SpeechRecognitionConfig = {
  continuous: true,
  interimResults: true,
  lang: 'en-US',
  maxAlternatives: 1,
  timeout: 30000, // 30 seconds
};

// Browser compatibility check
const checkSpeechRecognitionSupport = (): { isSupported: boolean; reason?: string } => {
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

// Error message mapping
const getSpeechRecognitionErrorMessage = (error: string): string => {
  switch (error) {
    case 'not-allowed':
      return 'Microphone access denied. Please enable microphone permissions.';
    case 'no-speech':
      return 'No speech detected. Please try again.';
    case 'audio-capture':
      return 'No microphone found. Please check your audio settings.';
    case 'network':
      return 'Network error occurred. Please check your connection.';
    case 'service-not-allowed':
      return 'Speech recognition service not allowed.';
    case 'bad-grammar':
      return 'Speech recognition grammar error.';
    case 'language-not-supported':
      return 'Language not supported for speech recognition.';
    default:
      return 'Speech recognition error occurred. Please try again.';
  }
};

export const useSpeechRecognition = (
  config: Partial<SpeechRecognitionConfig> = {}
): SpeechRecognitionState & SpeechRecognitionActions => {
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  const [state, setState] = useState<SpeechRecognitionState>(() => {
    const supportCheck = checkSpeechRecognitionSupport();
    return {
      isListening: false,
      isSupported: supportCheck.isSupported,
      transcript: '',
      finalTranscript: '',
      interimTranscript: '',
      error: supportCheck.isSupported ? null : (supportCheck.reason || 'Speech recognition not supported'),
      confidence: 0,
    };
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualStop = useRef(false);

  // Create speech recognition instance
  const createSpeechRecognition = useCallback((): SpeechRecognition | null => {
    if (!state.isSupported) return null;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = finalConfig.continuous;
    recognition.interimResults = finalConfig.interimResults;
    recognition.lang = finalConfig.lang;
    recognition.maxAlternatives = finalConfig.maxAlternatives;

    return recognition;
  }, [state.isSupported, finalConfig]);

  // Setup event handlers
  const setupEventHandlers = useCallback((recognition: SpeechRecognition) => {
    recognition.onstart = () => {
      setState(prev => ({
        ...prev,
        isListening: true,
        error: null,
      }));
    };

    recognition.onend = () => {
      setState(prev => ({
        ...prev,
        isListening: false,
      }));
      
      // Clear timeout when recognition ends
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = getSpeechRecognitionErrorMessage(event.error);
      setState(prev => ({
        ...prev,
        isListening: false,
        error: errorMessage,
      }));
      
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      let confidence = 0;

      // Process all results - build up complete transcripts
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          confidence = result[0].confidence;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      // Update state with separate final and interim transcripts
      setState(prev => ({
        ...prev,
        finalTranscript: finalTranscript.trim(),
        interimTranscript: interimTranscript.trim(),
        transcript: (finalTranscript + interimTranscript).trim(),
        confidence: finalTranscript ? confidence : prev.confidence,
        error: null,
      }));
    };

    recognition.onnomatch = () => {
      setState(prev => ({
        ...prev,
        error: 'No speech was recognized. Please try again.',
      }));
    };
  }, []);

  // Start listening function
  const startListening = useCallback(() => {
    if (!state.isSupported || state.isListening) return;

    const recognition = createSpeechRecognition();
    if (!recognition) {
      setState(prev => ({
        ...prev,
        error: 'Failed to initialize speech recognition.',
      }));
      return;
    }

    recognitionRef.current = recognition;
    setupEventHandlers(recognition);
    
    // Reset previous state
    setState(prev => ({
      ...prev,
      transcript: '',
      finalTranscript: '',
      interimTranscript: '',
      error: null,
      confidence: 0,
    }));

    isManualStop.current = false;

    try {
      recognition.start();
      
      // Set up automatic timeout
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && !isManualStop.current) {
          recognitionRef.current.stop();
          setState(prev => ({
            ...prev,
            error: 'Speech recognition timed out. Please try again.',
          }));
        }
      }, finalConfig.timeout);
      
    } catch (error: unknown) {
      setState(prev => ({
        ...prev,
        error: 'Failed to start speech recognition. Please try again.',
      }));
    }
  }, [state.isSupported, state.isListening, createSpeechRecognition, setupEventHandlers, finalConfig.timeout]);

  // Stop listening function
  const stopListening = useCallback(() => {
    if (!state.isListening || !recognitionRef.current) return;

    isManualStop.current = true;
    
    try {
      recognitionRef.current.stop();
    } catch (error: unknown) {
      // Ignore errors when stopping
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [state.isListening]);

  // Reset transcript function
  const resetTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      finalTranscript: '',
      interimTranscript: '',
      confidence: 0,
      error: null,
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error: unknown) {
          // Ignore cleanup errors
        }
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;