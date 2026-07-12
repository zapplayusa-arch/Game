import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Rocket,
  Coins,
  Trophy,
  Settings as SettingsIcon,
  HelpCircle,
  ShoppingBag,
  Sparkles,
  Globe,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { GameScreen, GameSettings, SKINS, LOCALES } from './types';
import { SoundEffects } from './utils/SoundEffects';
import SettingsScreen from './components/SettingsScreen';
import InstructionsScreen from './components/InstructionsScreen';
import StoreScreen from './components/StoreScreen';
import GameCanvas from './components/GameCanvas';

export default function App() {
  // Game states with local storage caching
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [highScore, setHighScore] = useState<number>(0);
  const [energyCores, setEnergyCores] = useState<number>(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['retro_shuttle']);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('retro_shuttle');

  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    musicEnabled: true,
    vibrateEnabled: true,
    language: 'hi', // Hindi default as requested "Mujhe ek Android chhoti si game banaoo"
  });

  // Score states for last finished game run
  const [lastRunScore, setLastRunScore] = useState<number>(0);
  const [lastRunCores, setLastRunCores] = useState<number>(0);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Load progress and preferences on mount
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('space_dodger_highscore');
      if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));

      const savedCores = localStorage.getItem('space_dodger_cores');
      if (savedCores) setEnergyCores(parseInt(savedCores, 10));

      const savedSkins = localStorage.getItem('space_dodger_unlocked_skins');
      if (savedSkins) setUnlockedSkins(JSON.parse(savedSkins));

      const savedSelectedSkin = localStorage.getItem('space_dodger_selected_skin');
      if (savedSelectedSkin) setSelectedSkinId(savedSelectedSkin);

      const savedSettings = localStorage.getItem('space_dodger_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        // Initialize synthesizer flags
        SoundEffects.setSoundEnabled(parsed.soundEnabled);
        SoundEffects.setMusicEnabled(parsed.musicEnabled);
      } else {
        // Initialize with default
        SoundEffects.setSoundEnabled(true);
        SoundEffects.setMusicEnabled(true);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
  }, []);

  // Update background BGM state based on screen changes
  useEffect(() => {
    if (screen === 'playing') {
      // GameCanvas handles starting BGM
    } else {
      SoundEffects.stopBGM();
    }
  }, [screen]);

  // Settings modification helper
  const handleUpdateSettings = (updated: GameSettings) => {
    setSettings(updated);
    try {
      localStorage.setItem('space_dodger_settings', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Skin unlocking/purchasing state helpers
  const handleBuySkin = (skinId: string, cost: number) => {
    if (energyCores >= cost) {
      const updatedCores = energyCores - cost;
      const updatedSkins = [...unlockedSkins, skinId];

      setEnergyCores(updatedCores);
      setUnlockedSkins(updatedSkins);
      setSelectedSkinId(skinId);

      try {
        localStorage.setItem('space_dodger_cores', updatedCores.toString());
        localStorage.setItem('space_dodger_unlocked_skins', JSON.stringify(updatedSkins));
        localStorage.setItem('space_dodger_selected_skin', skinId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleEquipSkin = (skinId: string) => {
    if (unlockedSkins.includes(skinId)) {
      setSelectedSkinId(skinId);
      try {
        localStorage.setItem('space_dodger_selected_skin', skinId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Core collectible increments inside a live run
  const handleCoreCollected = (amount: number) => {
    const updatedCores = energyCores + amount;
    setEnergyCores(updatedCores);
    try {
      localStorage.setItem('space_dodger_cores', updatedCores.toString());
    } catch (e) {
      console.error(e);
    }
  };

  // Game over handler callback from GameCanvas
  const handleGameOver = (finalScore: number, runCores: number) => {
    setLastRunScore(finalScore);
    setLastRunCores(runCores);

    let isNewHigh = false;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      setIsNewHighScore(true);
      isNewHigh = true;
      try {
        localStorage.setItem('space_dodger_highscore', finalScore.toString());
      } catch (e) {
        console.error(e);
      }
    } else {
      setIsNewHighScore(false);
    }

    setScreen('gameover');
  };

  const t = LOCALES[settings.language];

  // Helper: check if player has enough cores to unlock ANY skin they do not own yet
  const canAffordAnyUnownedSkin = SKINS.some(
    (skin) => !unlockedSkins.includes(skin.id) && energyCores >= skin.cost
  );

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-3 relative overflow-hidden select-none">
      {/* Visual Ambient Grid / Particles background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(6,182,212,0.06),transparent_60%)] pointer-events-none" />

      {/* Screen Routing Frame */}
      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-6"
          >
            {/* Menu Header with Currency Counter */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full px-3 py-1 font-mono text-sm text-yellow-400 font-bold">
                <Coins className="w-4 h-4 animate-pulse" />
                <span>{energyCores}</span>
              </div>

              {/* Language Instant Switcher */}
              <button
                id="btn-lang-toggle-fast"
                onClick={() => {
                  SoundEffects.playSelect();
                  handleUpdateSettings({
                    ...settings,
                    language: settings.language === 'hi' ? 'en' : 'hi',
                  });
                }}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-750 active:bg-slate-700 border border-slate-700/40 text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold">
                  {settings.language === 'hi' ? 'English' : 'हिन्दी'}
                </span>
              </button>
            </div>

            {/* Glowing Retro Title */}
            <div className="flex flex-col items-center text-center mt-3 gap-1">
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className="w-14 h-14 bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-950/40 border border-indigo-400/20"
              >
                <Rocket className="w-8 h-8 text-white rotate-45" />
              </motion.div>

              <div className="mt-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 filter drop-shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  {t.title}
                </h1>
                <p className="text-slate-400 text-xs mt-1 font-medium font-sans">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* High Score Panel */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <Trophy className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xxs text-slate-400 uppercase tracking-widest">{t.highScore}</span>
                  <span className="text-lg font-black text-white font-mono leading-none mt-0.5">
                    {highScore}
                  </span>
                </div>
              </div>

              {/* Equpped ship mini info */}
              <div className="flex flex-col items-end">
                <span className="text-xxs text-slate-500">{settings.language === 'hi' ? 'सक्रिय यान' : 'Active Ship'}</span>
                <span className="text-xs font-bold text-indigo-300">
                  {settings.language === 'hi'
                    ? SKINS.find((s) => s.id === selectedSkinId)?.nameHi
                    : SKINS.find((s) => s.id === selectedSkinId)?.nameEn}
                </span>
              </div>
            </div>

            {/* Navigation Button Menu list */}
            <div className="flex flex-col gap-3 mt-2">
              {/* PLAY */}
              <button
                id="btn-nav-play"
                onClick={() => {
                  SoundEffects.playSelect();
                  setScreen('playing');
                }}
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 active:scale-98 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-cyan-950/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Rocket className="w-4 h-4 fill-slate-950" />
                <span>{t.play}</span>
              </button>

              {/* STORE */}
              <button
                id="btn-nav-store"
                onClick={() => {
                  SoundEffects.playSelect();
                  setScreen('store');
                }}
                className="w-full py-3 bg-slate-800 hover:bg-slate-750 active:scale-98 text-slate-100 font-bold text-xs rounded-xl border border-slate-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer relative"
              >
                <ShoppingBag className="w-4 h-4 text-yellow-400" />
                <span>{t.shop}</span>
                {/* Red pulse notification bubble if unowned skins are affordable! */}
                {canAffordAnyUnownedSkin && (
                  <span className="absolute right-4 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* HOW TO PLAY */}
                <button
                  id="btn-nav-instructions"
                  onClick={() => {
                    SoundEffects.playSelect();
                    setScreen('instructions');
                  }}
                  className="py-3 bg-slate-800 hover:bg-slate-750 active:scale-98 text-slate-100 font-bold text-xs rounded-xl border border-slate-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t.howToPlay}</span>
                </button>

                {/* SETTINGS */}
                <button
                  id="btn-nav-settings"
                  onClick={() => {
                    SoundEffects.playSelect();
                    setScreen('settings');
                  }}
                  className="py-3 bg-slate-800 hover:bg-slate-750 active:scale-98 text-slate-100 font-bold text-xs rounded-xl border border-slate-700/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-indigo-400" />
                  <span>{t.settings}</span>
                </button>
              </div>
            </div>

            {/* Aesthetic Disclaimer Credits */}
            <div className="text-center text-slate-500 text-xxs mt-3 select-none">
              {settings.language === 'hi'
                ? '© अंतरिक्ष डॉजर - एक उत्तम एंड्रॉइड मिनी गेम अनुभव'
                : '© Space Dodger - Premium Mobile Arcade Experience'}
            </div>
          </motion.div>
        )}

        {/* ACTIVE RUN SCREEN */}
        {screen === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex justify-center"
          >
            <GameCanvas
              settings={settings}
              selectedSkinId={selectedSkinId}
              onGameOver={handleGameOver}
              onCoreCollected={handleCoreCollected}
            />
          </motion.div>
        )}

        {/* GAME OVER SCREEN */}
        {screen === 'gameover' && (
          <motion.div
            key="gameover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-5 text-center"
          >
            {/* Skull / Explosion Header */}
            <div className="flex flex-col items-center gap-2 mt-2">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 animate-bounce">
                <Rocket className="w-6 h-6 rotate-180" />
              </div>
              <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest">
                {t.gameOver}
              </h1>
            </div>

            {/* Score Summary Metrics */}
            <div className="flex flex-col gap-2.5 my-1">
              {/* Score panel */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col gap-0.5 relative overflow-hidden">
                <span className="text-slate-400 text-xxs uppercase tracking-wider">{t.score}</span>
                <span className="text-2xl font-black text-cyan-400 font-mono leading-none mt-1">
                  {lastRunScore}
                </span>

                {/* Sparkles on new High Score */}
                {isNewHighScore && (
                  <div className="absolute inset-y-0 right-3 flex items-center gap-1 px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-400 text-xxs font-extrabold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>NEW HIGH!</span>
                  </div>
                )}
              </div>

              {/* Cores collected in this run */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <span className="text-slate-400 text-xxs uppercase tracking-wider">
                  {settings.language === 'hi' ? 'इस बार इकट्ठा किए गए कोर' : 'Cores Gathered'}
                </span>
                <div className="flex items-center gap-1.5 text-yellow-400 font-bold font-mono">
                  <Coins className="w-4 h-4" />
                  <span>+{lastRunCores}</span>
                </div>
              </div>
            </div>

            {/* Actions button stack */}
            <div className="flex flex-col gap-3">
              <button
                id="btn-gameover-restart"
                onClick={() => {
                  SoundEffects.playSelect();
                  setScreen('playing');
                }}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-extrabold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/20"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t.restart}</span>
              </button>

              <button
                id="btn-gameover-menu"
                onClick={() => {
                  SoundEffects.playSelect();
                  setScreen('menu');
                }}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-100 font-bold text-xs rounded-xl border border-slate-750 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-400" />
                <span>{t.backMenu}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* SETTINGS ROUTE SCREEN */}
        {screen === 'settings' && (
          <SettingsScreen
            settings={settings}
            onChangeSettings={handleUpdateSettings}
            onBack={() => setScreen('menu')}
          />
        )}

        {/* INSTRUCTIONS ROUTE SCREEN */}
        {screen === 'instructions' && (
          <InstructionsScreen settings={settings} onBack={() => setScreen('menu')} />
        )}

        {/* STORE ROUTE SCREEN */}
        {screen === 'store' && (
          <StoreScreen
            settings={settings}
            energyCores={energyCores}
            unlockedSkins={unlockedSkins}
            selectedSkinId={selectedSkinId}
            onBuySkin={handleBuySkin}
            onEquipSkin={handleEquipSkin}
            onBack={() => setScreen('menu')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
