import { motion } from 'motion/react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceIndicatorProps {
  isListening: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceIndicator({
  isListening,
  onToggle,
  disabled = false,
  size = 'md',
}: VoiceIndicatorProps) {
  const sizeClasses = {
    sm: 'w-9 h-9 p-2 text-sm',
    md: 'w-11 h-11 p-2.5 text-base',
    lg: 'w-14 h-14 p-3.5 text-lg',
  }[size];

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26,
  }[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      {isListening && (
        <>
          <motion.div
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-red-500/40 pointer-events-none"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.4, ease: 'easeOut', delay: 0.3 }}
            className="absolute inset-0 rounded-full bg-red-500/50 pointer-events-none"
          />
        </>
      )}

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        title={isListening ? 'กดเพื่อหยุดการบันทึกเสียง' : 'กดไมค์เพื่อพูด (รองรับภาษาไทย)'}
        aria-label={isListening ? 'Stop microphone' : 'Start microphone'}
        className={`${sizeClasses} relative rounded-full flex items-center justify-center transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isListening
            ? 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-400 ring-offset-1 animate-pulse'
            : 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
      >
        {isListening ? (
          <Mic className={`w-[${iconSizes}px] h-[${iconSizes}px] animate-bounce`} />
        ) : (
          <Mic className={`w-[${iconSizes}px] h-[${iconSizes}px]`} />
        )}
      </button>
    </div>
  );
}
