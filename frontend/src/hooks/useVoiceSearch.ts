import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceSearchState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isSupported: boolean;
}

interface VoiceSearchActions {
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  clearError: () => void;
}

export function useVoiceSearch(): VoiceSearchState & VoiceSearchActions {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognitionConstructor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionConstructor) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionConstructor();
      
      // Configure recognition
      recognition.continuous = false; // Stop automatically when user finishes speaking
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[0];
        if (result.isFinal) {
          const transcribedText = result[0].transcript;
          setTranscript(transcribedText);
          setIsListening(false);
        }
      };

      // Handle end of recognition
      recognition.onend = () => {
        setIsListening(false);
      };

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            setError('No speech detected. Please try again.');
            break;
          case 'audio-capture':
            setError('Microphone not available. Please check your device settings.');
            break;
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access and try again.');
            break;
          case 'network':
            setError('Network error occurred. Please check your connection and try again.');
            break;
          case 'aborted':
            setError('Speech recognition was aborted. Please try again.');
            break;
          default:
            setError('Speech recognition failed. Please try again.');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      setError('Voice search is not available.');
      return;
    }

    // Clear previous state
    setError(null);
    setTranscript('');

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      // Handle case where recognition is already started
      if (err instanceof Error && err.message.includes('already started')) {
        recognitionRef.current.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (retryErr) {
            setError('Failed to start voice recognition. Please try again.');
          }
        }, 100);
      } else {
        setError('Failed to start voice recognition. Please try again.');
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
    clearError,
  };
}
