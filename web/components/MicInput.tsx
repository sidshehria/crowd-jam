"use client";

import { useSpeechToText } from "@/hooks/useSpeechToText";

interface MicInputProps {
  onTranscript: (text: string) => void;
}

export default function MicInput({ onTranscript }: MicInputProps) {
  const { isSupported, isListening, transcript, startListening, stopListening } =
    useSpeechToText();

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript) {
        onTranscript(transcript);
      }
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`p-2 rounded-full transition-all ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
      }`}
      title={isListening ? "Stop recording" : "Start voice input"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

