'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { enhanceEvaluationText } from '@/lib/utils/text-enhancement'

interface SpeechRecognitionOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

// SpeechResult interface removed as it was unused

interface UseSpeechRecognitionReturn {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  finalTranscript: string
  confidence: number
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

// Define proper SpeechRecognition types
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
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

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

// Extend Window interface
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export function useSpeechRecognition(
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    language = 'es-ES',
    continuous = false,
    interimResults = true,
    maxAlternatives = 1
  } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check browser support passively on mount WITHOUT instantiating SpeechRecognition
  useEffect(() => {
    const hasSupport =
      typeof window !== 'undefined' &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
    setIsSupported(hasSupport)

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // ignore cleanup stop errors
        }
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (typeof window === 'undefined' || !isSupported) return

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    try {
      setError(null)
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition()
      }

      const recognition = recognitionRef.current
      recognition.lang = language
      recognition.continuous = continuous
      recognition.interimResults = interimResults
      recognition.maxAlternatives = maxAlternatives

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        setError(event.error)
        setIsListening(false)

        switch (event.error) {
          case 'network':
            setError('network-error')
            break
          case 'not-allowed':
            setError('microphone-access-denied')
            break
          case 'no-speech':
            setError('no-speech-detected')
            break
          case 'audio-capture':
            setError('audio-not-supported')
            break
          default:
            setError(`speech-error-${event.error}`)
        }
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscriptValue = ''
        let finalTranscriptValue = finalTranscript

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcriptText = result[0].transcript

          if (result.isFinal) {
            const languageCode = language.startsWith('ar')
              ? 'ar'
              : language.startsWith('es')
                ? 'es'
                : 'en'
            const enhancedText = enhanceEvaluationText(transcriptText, languageCode)
            finalTranscriptValue += enhancedText + ' '
            setConfidence(result[0].confidence)
          } else {
            interimTranscriptValue += transcriptText
          }
        }

        setInterimTranscript(interimTranscriptValue)
        setFinalTranscript(finalTranscriptValue)
        setTranscript(finalTranscriptValue + interimTranscriptValue)
      }

      recognition.start()
    } catch {
      setError('Failed to start speech recognition')
    }
  }, [isSupported, language, continuous, interimResults, maxAlternatives, finalTranscript])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return
    
    try {
      recognitionRef.current.stop()
    } catch {
      setError('Failed to stop speech recognition')
    }
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
    setFinalTranscript('')
    setConfidence(0)
    setError(null)
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    finalTranscript,
    confidence,
    error,
    startListening,
    stopListening,
    resetTranscript
  }
}