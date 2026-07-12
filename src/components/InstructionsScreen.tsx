import { motion } from 'motion/react';
import { ArrowLeft, Rocket, Zap, Shield, Sparkles, AlertTriangle, Eye } from 'lucide-react';
import { GameSettings, LOCALES } from '../types';
import { SoundEffects } from '../utils/SoundEffects';

interface InstructionsScreenProps {
  settings: GameSettings;
  onBack: () => void;
}

export default function InstructionsScreen({ settings, onBack }: InstructionsScreenProps) {
  const t = LOCALES[settings.language];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-700/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-5 max-h-[85vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-3 flex-shrink-0">
        <button
          id="btn-instructions-back"
          onClick={() => {
            SoundEffects.playSelect();
            onBack();
          }}
          className="p-2 hover:bg-slate-800 active:bg-slate-750 rounded-lg transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
          {t.howToPlayTitle}
        </h2>
      </div>

      {/* Instructions Content */}
      <div className="flex flex-col gap-4 text-sm leading-relaxed overflow-y-auto pr-1">
        {/* Concept */}
        <div className="flex gap-3 items-start p-3 bg-slate-800/30 rounded-xl border border-slate-800">
          <Rocket className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <p className="text-slate-200 text-xs">
            {t.dodgeText}
          </p>
        </div>

        <div className="flex gap-3 items-start p-3 bg-slate-800/30 rounded-xl border border-slate-800">
          <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 animate-spin" />
          <p className="text-slate-200 text-xs">
            {t.collectText}
          </p>
        </div>

        {/* Powerups Header */}
        <div className="mt-2 flex-shrink-0">
          <h3 className="text-xs uppercase font-extrabold text-orange-400 tracking-wider mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" /> {t.powerupsText}
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {/* Shield */}
            <div className="flex items-center gap-3 p-2.5 bg-emerald-950/20 border border-emerald-900/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-300">
                {t.pShield}
              </span>
            </div>

            {/* Magnet */}
            <div className="flex items-center gap-3 p-2.5 bg-purple-950/20 border border-purple-900/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-300">
                {t.pMagnet}
              </span>
            </div>

            {/* Multiplier */}
            <div className="flex items-center gap-3 p-2.5 bg-amber-950/20 border border-amber-900/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 animate-pulse">
                <span className="text-xxs font-extrabold">2X</span>
              </div>
              <span className="text-xs text-slate-300">
                {t.pMultiplier}
              </span>
            </div>

            {/* EMP Bomb */}
            <div className="flex items-center gap-3 p-2.5 bg-cyan-950/20 border border-cyan-900/30 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-300">
                {t.pBomb}
              </span>
            </div>
          </div>
        </div>

        {/* Control Tips */}
        <div className="mt-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700/30 flex flex-col gap-1 flex-shrink-0">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            {settings.language === 'hi' ? "गेम के सुझाव" : "Expert Piloting Tips"}
          </h4>
          <ul className="list-disc pl-5 text-xxs text-slate-400 leading-relaxed flex flex-col gap-1">
            {settings.language === 'hi' ? (
              <>
                <li>तैयारी रखने के लिए सबसे पहले <b>क्लासिक शटल</b> का उपयोग करें।</li>
                <li>जब <b>शील्ड</b> खत्म हो, तो घबराएं नहीं। 2 सेकंड के लिए फ्लैशिंग लाइट सुरक्षा देती है।</li>
                <li>जितना आगे बढ़ेंगे, गति उतनी ही तेज़ होती जाएगी। गति के साथ अधिक अंक मिलेंगे!</li>
                <li>दुकान में जाएँ और अधिक शक्तिशाली विशेषताओं वाले जहाजों को खरीदने के लिए सिक्के बटोरें।</li>
              </>
            ) : (
              <>
                <li>Use standard drag controls for the most tactile, lightning-fast response on mobile.</li>
                <li>When your <b>Shield</b> pops, you have a 2-second invulnerable buffer where you flash. Use it to recover.</li>
                <li>Game speed increases slowly. Higher speeds multiply your point-gain rapidly!</li>
                <li>Save up cores to unlock <b>Pulse Phoenix</b> (magnet pull) or <b>Void Shadow</b> (increased shield durations).</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
