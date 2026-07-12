import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Coins, Check, Lock, Sparkles } from 'lucide-react';
import { GameSettings, ShipSkin, SKINS, LOCALES } from '../types';
import { SoundEffects } from '../utils/SoundEffects';
import { useState } from 'react';

interface StoreScreenProps {
  settings: GameSettings;
  energyCores: number;
  unlockedSkins: string[];
  selectedSkinId: string;
  onBuySkin: (skinId: string, cost: number) => void;
  onEquipSkin: (skinId: string) => void;
  onBack: () => void;
}

export default function StoreScreen({
  settings,
  energyCores,
  unlockedSkins,
  selectedSkinId,
  onBuySkin,
  onEquipSkin,
  onBack,
}: StoreScreenProps) {
  const t = LOCALES[settings.language];
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAction = (skin: ShipSkin) => {
    const isUnlocked = unlockedSkins.includes(skin.id);

    if (isUnlocked) {
      SoundEffects.playSelect();
      onEquipSkin(skin.id);
    } else {
      if (energyCores >= skin.cost) {
        SoundEffects.playPowerUp();
        onBuySkin(skin.id, skin.cost);
        setErrorMsg(null);
      } else {
        SoundEffects.playShieldBreak();
        setErrorMsg(t.notEnoughCores);
        setTimeout(() => setErrorMsg(null), 3000);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-md mx-auto bg-slate-900/90 border border-slate-700/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            id="btn-store-back"
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
            {t.shop}
          </h2>
        </div>

        {/* Currency Display */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
          <Coins className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-sm font-bold text-yellow-400 font-mono">{energyCores}</span>
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/40 text-red-300 text-xxs leading-normal text-center flex-shrink-0"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skin Cards List */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        {SKINS.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isEquipped = selectedSkinId === skin.id;

          return (
            <div
              key={skin.id}
              className={`p-3.5 rounded-xl border flex flex-col gap-2.5 transition-all ${
                isEquipped
                  ? 'bg-slate-800/80 border-cyan-500 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-800/20 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Space ship mock representation */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center border transition-shadow relative"
                    style={{
                      borderColor: skin.color,
                      backgroundColor: `${skin.color}08`,
                      boxShadow: `0 0 10px ${skin.color}25`,
                    }}
                  >
                    {/* Tiny SVG ship drawing */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2L4 20L12 16L20 20L12 2Z"
                        fill={skin.color}
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                      />
                      {/* Glow engine fire */}
                      <circle cx="12" cy="17" r="2" fill="#e11d48" className="animate-ping" />
                    </svg>
                  </div>

                  {/* Name and lock state */}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold flex items-center gap-1.5">
                      {settings.language === 'hi' ? skin.nameHi : skin.nameEn}
                      {!isUnlocked && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                    </span>
                    <span className="text-xxs text-slate-400 font-medium">
                      {settings.language === 'hi' ? 'विशेषता: ' : 'Bonus: '}
                      <span className="text-cyan-400">
                        {settings.language === 'hi' ? skin.perkHi : skin.perkEn}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Purchase / Equip Button */}
                <button
                  id={`btn-skin-action-${skin.id}`}
                  onClick={() => handleAction(skin)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isEquipped
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isUnlocked
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 active:scale-95'
                      : 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 active:scale-95 flex items-center'
                  }`}
                >
                  {isEquipped ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.equipped}</span>
                    </>
                  ) : isUnlocked ? (
                    <span>{t.equip}</span>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5" />
                      <span>{skin.cost}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Specific Stats list */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-800/60 pt-2.5 text-xxs text-slate-400">
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{settings.language === 'hi' ? 'टकराव क्षेत्र' : 'Chassis'}</span>
                  <span className="font-semibold text-slate-300 font-mono">
                    {skin.hitboxRadius === 15 ? '100% Std' : `${Math.round((skin.hitboxRadius / 15) * 100)}% Sleek`}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{settings.language === 'hi' ? 'मैग्नेट खिंचाव' : 'Magnet Pull'}</span>
                  <span className="font-semibold text-slate-300 font-mono">
                    {skin.magnetBonus === 1.0 ? '1.0x Std' : `+${Math.round((skin.magnetBonus - 1) * 100)}% Boost`}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-slate-500">{settings.language === 'hi' ? 'शील्ड अवधि' : 'Shield Cap'}</span>
                  <span className="font-semibold text-slate-300 font-mono">
                    {skin.shieldBonus === 0 ? 'Std 5s' : `+${skin.shieldBonus / 1000}s Extend`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
