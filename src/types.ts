export interface ShipSkin {
  id: string;
  nameEn: string;
  nameHi: string;
  cost: number;
  color: string;
  glowColor: string;
  perkEn: string;
  perkHi: string;
  hitboxRadius: number;
  magnetBonus: number;
  shieldBonus: number;
  doubleSpawnBonus: number;
}

export type GameScreen = 'menu' | 'playing' | 'gameover' | 'store' | 'settings' | 'instructions';

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrateEnabled: boolean;
  language: 'hi' | 'en';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  color: string;
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: 'standard' | 'fast' | 'heavy' | 'wiggly';
  angle: number;
  spinSpeed: number;
  color: string;
  maxHealth: number;
  health: number;
}

export interface EnergyCore {
  id: number;
  x: number;
  y: number;
  radius: number;
  value: number;
  isDouble: boolean;
  color: string;
  pulseScale: number;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  radius: number;
  type: 'shield' | 'magnet' | 'multiplier' | 'bomb';
  color: string;
  label: string;
}

export const SKINS: ShipSkin[] = [
  {
    id: 'retro_shuttle',
    nameEn: 'Retro Shuttle',
    nameHi: 'क्लासिक शटल',
    cost: 0,
    color: '#ef4444', // Red-500
    glowColor: 'rgba(239, 68, 68, 0.6)',
    perkEn: 'Standard explorer craft. Well-balanced.',
    perkHi: 'साधारण खोजी यान। पूरी तरह से संतुलित।',
    hitboxRadius: 15,
    magnetBonus: 1.0,
    shieldBonus: 0,
    doubleSpawnBonus: 0,
  },
  {
    id: 'neon_vanguard',
    nameEn: 'Neon Vanguard',
    nameHi: 'नियॉन रक्षक',
    cost: 50,
    color: '#06b6d4', // Cyan-500
    glowColor: 'rgba(6, 182, 212, 0.7)',
    perkEn: 'Sleek carbon chassis. Smaller 15% hitbox.',
    perkHi: 'चिकना कार्बन फ्रेम। टकराने का क्षेत्र 15% छोटा।',
    hitboxRadius: 12.5,
    magnetBonus: 1.0,
    shieldBonus: 0,
    doubleSpawnBonus: 0,
  },
  {
    id: 'pulse_phoenix',
    nameEn: 'Pulse Phoenix',
    nameHi: 'पल्स फीनिक्स',
    cost: 120,
    color: '#f97316', // Orange-500
    glowColor: 'rgba(249, 115, 22, 0.7)',
    perkEn: 'Magnetic field core. +30% core attraction distance.',
    perkHi: 'चुंबकीय क्षेत्र कोर। 30% अधिक दूर से सिक्के खींचे।',
    hitboxRadius: 15,
    magnetBonus: 1.3,
    shieldBonus: 0,
    doubleSpawnBonus: 0,
  },
  {
    id: 'void_shadow',
    nameEn: 'Void Shadow',
    nameHi: 'शून्य छाया',
    cost: 250,
    color: '#a855f7', // Purple-500
    glowColor: 'rgba(168, 85, 247, 0.7)',
    perkEn: 'Temporal phase shields. Shields last 4 seconds longer.',
    perkHi: 'अस्थायी फेज शील्ड। शील्ड 4 सेकंड अधिक समय तक टिकती है।',
    hitboxRadius: 15,
    magnetBonus: 1.0,
    shieldBonus: 4000,
    doubleSpawnBonus: 0,
  },
  {
    id: 'cosmic_aurora',
    nameEn: 'Cosmic Aurora',
    nameHi: 'ब्रह्मांडीय आभा',
    cost: 500,
    color: '#10b981', // Emerald-500
    glowColor: 'rgba(16, 185, 129, 0.8)',
    perkEn: 'Quantum luck. +25% chance of double value energy cores.',
    perkHi: 'क्वांटम भाग्य। दोगुने मूल्य वाले ऊर्जा कोर मिलने की 25% अधिक संभावना।',
    hitboxRadius: 14,
    magnetBonus: 1.1,
    shieldBonus: 1000,
    doubleSpawnBonus: 0.25,
  }
];

export const LOCALES = {
  en: {
    title: "Space Dodger",
    subtitle: "A Retro Arcade Odyssey",
    play: "Play Game",
    highScore: "High Score",
    cores: "Energy Cores",
    shop: "Ship Store",
    settings: "Settings",
    howToPlay: "How to Play",
    score: "Score",
    multiplier: "Multiplier",
    gameOver: "GAME OVER",
    revive: "Revive Ship",
    restart: "Play Again",
    backMenu: "Back to Menu",
    sound: "Sound Effects",
    music: "Background Music",
    vibration: "Haptic Feedback",
    language: "Language",
    unlocked: "Unlocked",
    equipped: "Equipped",
    equip: "Equip Ship",
    buy: "Unlock for",
    notEnoughCores: "Not enough cores! Keep dodging asteroids to gather more.",
    back: "Back",
    controlDrag: "Drag Controls",
    controlTap: "Tap Controls",
    howToPlayTitle: "Mission Briefing",
    dodgeText: "Dodge falling asteroids and debris. A single hit will crash your craft!",
    collectText: "Collect yellow Energy Cores. They serve as currency in the Ship Store.",
    powerupsText: "Grab power-ups to gain a cosmic advantage:",
    pShield: "Shield (Green): Absorbs one asteroid crash.",
    pMagnet: "Magnet (Purple): Attracts nearby energy cores automatically.",
    pMultiplier: "Multiplier (Orange): Spawns 2x score multipliers.",
    pBomb: "EMP Bomb (Cyan): Instant screen-wide blast clearing all threats.",
    controlType: "Control Style",
    warning: "ASTEROID SWARM AHEAD!",
    hiText: "हिन्दी",
    enText: "English",
  },
  hi: {
    title: "स्पेस डॉजर",
    subtitle: "रेट्रो आर्केड अंतरिक्ष यात्रा",
    play: "गेम खेलें",
    highScore: "सर्वोच्च स्कोर",
    cores: "ऊर्जा कोर",
    shop: "शिप स्टोर",
    settings: "गेम सेटिंग्स",
    howToPlay: "कैसे खेलें",
    score: "स्कोर",
    multiplier: "मल्टीप्लायर",
    gameOver: "खेल समाप्त!",
    revive: "शिप पुनर्जीवित करें",
    restart: "फिर से खेलें",
    backMenu: "मुख्य मेनू",
    sound: "ध्वनि प्रभाव",
    music: "बैकग्राउंड म्यूजिक",
    vibration: "वाइब्रेशन प्रभाव",
    language: "भाषा (Language)",
    unlocked: "अनलॉक है",
    equipped: "सक्रिय है",
    equip: "सक्रिय करें",
    buy: "अनलॉक करें",
    notEnoughCores: "पर्याप्त ऊर्जा कोर नहीं हैं! इन्हें पाने के लिए चट्टानों से बचकर कोर बटोरें।",
    back: "पीछे जाएं",
    controlDrag: "खींचकर चलाएं",
    controlTap: "दबाकर चलाएं",
    howToPlayTitle: "अंतरिक्ष मिशन जानकारी",
    dodgeText: "ऊपर से गिरती चट्टानों (एस्ट्रोइड्स) से बचें। एक भी टक्कर आपके शिप को तबाह कर देगी!",
    collectText: "पीले रंग के 'ऊर्जा कोर' इकट्ठा करें। इनसे आप शिप स्टोर से नए शक्तिशाली यान खरीद सकते हैं।",
    powerupsText: "फायदा पाने के लिए विशेष शक्तियां (पावर-अप) लें:",
    pShield: "शील्ड (हरा): एक टक्कर से सुरक्षा कवच प्रदान करता है।",
    pMagnet: "मैग्नेट (बैंगनी): आसपास के ऊर्जा कोर को अपने आप खींचता है।",
    pMultiplier: "मल्टीप्लायर (नारंगी): स्कोर बढ़ाने के लिए 2x गुना पॉइंट देता है।",
    pBomb: "ईएमपी बम (आसमानी): स्क्रीन पर मौजूद सभी चट्टानों को एक बार में नष्ट करे।",
    controlType: "कंट्रोल स्टाइल",
    warning: "सावधान! चट्टानों का झुंड आ रहा है!",
    hiText: "हिन्दी",
    enText: "English",
  }
};
