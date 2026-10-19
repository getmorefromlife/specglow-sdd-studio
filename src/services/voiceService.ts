/**
 * Voice Recognition & Audio Dictation Service
 * Uses standard browser SpeechRecognition / webkitSpeechRecognition API
 * 100% Client-Side • Zero External Server Overhead
 */

export interface SpeechRecognitionEventLike {
  resultIndex: number
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
        confidence: number
      }
    }
  }
}

export interface SpeechRecognitionErrorEventLike {
  error: string
  message?: string
}

export interface VoiceServiceCallbacks {
  onTranscript: (transcript: string, isFinal: boolean) => void
  onError: (error: string) => void
  onEnd: () => void
  onStart: () => void
}

// Global declaration for vendor-prefixed speech recognition
interface IWindow extends Window {
  SpeechRecognition?: any
  webkitSpeechRecognition?: any
}

export class VoiceRecognitionService {
  private recognition: any = null
  private isListening: boolean = false
  private accumulatedTranscript: string = ''

  constructor() {
    const win = typeof window !== 'undefined' ? (window as unknown as IWindow) : null
    const SpeechRecognitionClass = win?.SpeechRecognition || win?.webkitSpeechRecognition

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass()
        this.recognition.continuous = true
        this.recognition.interimResults = true
        this.recognition.lang = 'en-US'
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err)
      }
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null
  }

  public startListening(callbacks: VoiceServiceCallbacks): boolean {
    if (!this.recognition) {
      callbacks.onError('Web Speech Recognition is not supported in this browser. You can type or paste your voice transcript directly.')
      return false
    }

    if (this.isListening) {
      this.stopListening()
    }

    this.accumulatedTranscript = ''
    this.isListening = true

    this.recognition.onstart = () => {
      this.isListening = true
      callbacks.onStart()
    }

    this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let interimTranscript = ''
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i]
        if (item.isFinal) {
          this.accumulatedTranscript += (this.accumulatedTranscript ? ' ' : '') + item[0].transcript
        } else {
          interimTranscript += item[0].transcript
        }
      }

      const currentFullText = this.accumulatedTranscript + (interimTranscript ? ' ' + interimTranscript : '')
      callbacks.onTranscript(currentFullText, interimTranscript.length === 0)
    }

    this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      console.warn('Speech recognition error:', event.error)
      if (event.error === 'not-allowed') {
        callbacks.onError('Microphone permission was denied. Please allow microphone access in your browser.')
      } else if (event.error !== 'no-speech') {
        callbacks.onError(`Voice recognition: ${event.error}`)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
      callbacks.onEnd()
    }

    try {
      this.recognition.start()
      return true
    } catch (err) {
      console.warn('Failed to start speech recognition:', err)
      this.isListening = false
      return false
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop()
      } catch (err) {
        console.warn('Error stopping recognition:', err)
      }
      this.isListening = false
    }
  }
}

export const voiceService = new VoiceRecognitionService()
