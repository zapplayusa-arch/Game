import { motion } from 'motion/react';
import { Volume2, VolumeX, Music, Smartphone, ShieldAlert, Globe, ArrowLeft } from 'lucide-react';
import { GameSettings, LOCALES } from '../types';
import { SoundEffects } from '../utils/SoundEffects';

interface SettingsScreenProps {
  settings: GameSettings;
  onChangeSettings: (settings: GameSettings) => void;
  onBack: () => void;
}

export default function SettingsScreen({ settings, onChangeSettings, onBack }: SettingsScreenProps) {
  const t = LOCALES[settings.language];

  const handleToggleSound = () => {
    SoundEffects.playSelect();
    const updated = { ...settings, soundEnabled: !settings.soundEnabled };
    onChangeSettings(updated);
    SoundEffects.setSoundEnabled(updated.soundEnabled);
  };

  const handleToggleMusic = () => {
    SoundEffects.playSelect();
    const updated = { ...settings, musicEnabled: !settings.musicEnabled };
    onChangeSettings(updated);
    SoundEffects.setMusicEnabled(updated.musicEnabled);
    if (updated.musicEnabled) {
      SoundEffects.startBGM();
    } else {
      SoundEffects.stopBGM();
    }
  };

  const handleToggleVibration = () => {
    SoundEffects.playSelect();
    const updated = { ...settings, vibrateEnabled: !settings.vibrateEnabled };
    onChangeSettings(updated);
    if (updated.vibrateEnabled && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  };

  const handleToggleLanguage = (lang: 'hi' | 'en') => {
    SoundEffects.playSelect();
    const updated = { ...settings, language: lang };
    onChangeSettings(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-700/50 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
        <button
          id="btn-settings-back"
          onClick={() => {
            SoundEffects.playSelect();
            onBack();
          }}
          className="p-2 hover:bg-slate-800 active:bg-slate-750 rounded-lg transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
          {t.settings}
        </h2>
      </div>

      {/* Settings Grid */}
      <div className="flex flex-col gap-4">
        {/* Language Selection */}
        <div className="flex flex-col gap-2 p-3 bg-slate-800/40 rounded-xl border border-slate-850">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold">{t.language}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              id="btn-lang-hi"
              onClick={() => handleToggleLanguage('hi')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                settings.language === 'hi'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                  : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-750'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              id="btn-lang-en"
              onClick={() => handleToggleLanguage('en')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                settings.language === 'en'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 font-bold'
                  : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-750'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Sound FX */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-850">
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400 animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{t.sound}</span>
              <span className="text-xxs text-slate-400">Arpeggios & collisions</span>
            </div>
          </div>
          <button
            id="btn-toggle-sound"
            onClick={handleToggleSound}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Background Music */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-850">
          <div className="flex items-center gap-3">
            <Music className={`w-5 h-5 ${settings.musicEnabled ? 'text-indigo-400 animate-bounce' : 'text-slate-500'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{t.music}</span>
              <span className="text-xxs text-slate-400">Procedural 8-bit bass groove</span>
            </div>
          </div>
          <button
            id="btn-toggle-music"
            onClick={handleToggleMusic}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              settings.musicEnabled ? 'bg-indigo-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                settings.musicEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Vibration / Haptic */}
        <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-xl border border-slate-850">
          <div className="flex items-center gap-3">
            <Smartphone className={`w-5 h-5 ${settings.vibrateEnabled ? 'text-orange-400 animate-pulse' : 'text-slate-500'}`} />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{t.vibration}</span>
              <span className="text-xxs text-slate-400">Collision & bonus rumblings</span>
            </div>
          </div>
          <button
            id="btn-toggle-vibration"
            onClick={handleToggleVibration}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer ${
              settings.vibrateEnabled ? 'bg-orange-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${
                settings.vibrateEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info Notice about Web constraints */}
      <div className="flex gap-2.5 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/30 text-xs text-indigo-300">
        <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0" />
        <p className="leading-relaxed text-xxs">
          {settings.language === 'hi'
            ? "गेम का सर्वोत्तम अनुभव लेने के लिए, इसे मोबाइल ब्राउज़र में चलाएं। पहली बार खेलने पर ऑडियो शुरू करने के लिए स्क्रीन पर कहीं भी छुएं।"
            : "For the best Android feel, open this app in your mobile browser. Tap anywhere on screen to activate the synthesized audio engine."}
        </p>
      </div>
    </motion.div>
  );
}
