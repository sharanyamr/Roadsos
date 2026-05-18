import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceAssistantOptions {
  onCommand?: (command: string) => void;
  lang?: string;
}

export function useVoiceAssistant({ onCommand, lang = 'en-US' }: VoiceAssistantOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Attempt to find a voice for the language
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
      if (voice) utterance.voice = voice;
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [lang]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening for command...");
    };

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log('Voice Command:', command);
      
      if (onCommand) {
        onCommand(command);
      }
      
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast.error("Microphone access denied. Please enable microphone permissions in your browser settings.");
      } else if (event.error !== 'no-speech') {
        toast.error("Voice recognition failed. Try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  }, [isSupported, onCommand]);

  return {
    isListening,
    isSupported,
    startListening,
    speak
  };
}
