import { useEffect, useRef, useState } from 'react';
import { GameSettings, SKINS, Particle, Star, Obstacle, EnergyCore, PowerUp, LOCALES } from '../types';
import { SoundEffects } from '../utils/SoundEffects';
import { Shield, Sparkles, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';

interface GameCanvasProps {
  settings: GameSettings;
  selectedSkinId: string;
  onGameOver: (finalScore: number, coresCollected: number) => void;
  onCoreCollected: (count: number) => void;
}

export default function GameCanvas({
  settings,
  selectedSkinId,
  onGameOver,
  onCoreCollected,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = LOCALES[settings.language];

  // Game active status state
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  // Active HUD states to show in React layer overlays
  const [hudScore, setHudScore] = useState(0);
  const [hudMultiplier, setHudMultiplier] = useState(1);
  const [hudCores, setHudCores] = useState(0);
  const [activeShieldTime, setActiveShieldTime] = useState(0);
  const [activeMagnetTime, setActiveMagnetTime] = useState(0);
  const [activeMultTime, setActiveMultTime] = useState(0);
  const [swarmWarning, setSwarmWarning] = useState(false);

  // References for mutable game loop state to bypass React re-render lag
  const stateRef = useRef({
    score: 0,
    multiplier: 1,
    coresThisRun: 0,
    gameTime: 0,
    speedMultiplier: 1.0,

    // Entity lists
    stars: [] as Star[],
    obstacles: [] as Obstacle[],
    cores: [] as EnergyCore[],
    powerups: [] as PowerUp[],
    particles: [] as Particle[],

    // Player definitions
    player: {
      x: 180, // logical width 360, middle
      y: 550, // logical height 640, bottom
      vx: 0,
      targetX: 180,
      radius: 15,
      flashTimer: 0,
      invulnerable: false,
      invulnerableTimer: 0,
    },

    // Active powerup state trackers (timestamps/durations in ms)
    powerupDurations: {
      shield: 0,    // active remaining duration
      magnet: 0,
      multiplier: 0,
    },

    // Timers
    obstacleSpawnTimer: 0,
    coreSpawnTimer: 0,
    powerupSpawnTimer: 0,
    swarmTimer: 0,

    lastTime: 0,
  });

  // Selected Ship configuration
  const currentSkin = SKINS.find((s) => s.id === selectedSkinId) || SKINS[0];

  const LOGICAL_WIDTH = 360;
  const LOGICAL_HEIGHT = 640;

  // Sound initializer helper
  const handleStartGame = () => {
    SoundEffects.init();
    SoundEffects.playSelect();
    if (settings.musicEnabled) {
      SoundEffects.startBGM();
    }
    setGameStarted(true);
    stateRef.current.lastTime = performance.now();
  };

  // Trigger local device haptics
  const triggerHaptic = (pattern: number[]) => {
    if (settings.vibrateEnabled && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  // Clear or trigger bomb powerup explosion
  const triggerBombExplosion = () => {
    const state = stateRef.current;
    SoundEffects.playBomb();
    triggerHaptic([200, 100, 200]);

    // Create explosion particles for each obstacle and clear it
    state.obstacles.forEach((obs) => {
      // Points for cleared items
      state.score += Math.round(10 * state.multiplier);

      for (let i = 0; i < 8; i++) {
        state.particles.push({
          x: obs.x,
          y: obs.y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: Math.random() * 4 + 2,
          color: obs.color,
          alpha: 1.0,
          decay: Math.random() * 0.03 + 0.01,
        });
      }
    });

    // Spawn core particles floating from destroyed rocks
    state.obstacles.forEach((obs) => {
      if (Math.random() < 0.6) {
        state.cores.push({
          id: Math.random(),
          x: obs.x,
          y: obs.y,
          radius: 8,
          value: 1,
          isDouble: Math.random() < currentSkin.doubleSpawnBonus,
          color: '#eab308',
          pulseScale: 1.0,
        });
      }
    });

    state.obstacles = [];
  };

  // Keyboard and Touch inputs listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Keys state tracking
    const keysPressed: { [key: string]: boolean } = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed[e.key] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.key] = false;
    };

    // Touch and Drag control logic
    const handleTouchMove = (e: TouchEvent) => {
      if (isPaused || !gameStarted) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeX = (touch.clientX - rect.left) / rect.width;
      // Interpolate x coordinate to logical space
      const targetX = relativeX * LOGICAL_WIDTH;
      stateRef.current.player.targetX = Math.max(
        stateRef.current.player.radius,
        Math.min(LOGICAL_WIDTH - stateRef.current.player.radius, targetX)
      );
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (isPaused || !gameStarted) return;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const relativeX = (touch.clientX - rect.left) / rect.width;
      const targetX = relativeX * LOGICAL_WIDTH;
      stateRef.current.player.targetX = Math.max(
        stateRef.current.player.radius,
        Math.min(LOGICAL_WIDTH - stateRef.current.player.radius, targetX)
      );
    };

    // Mouse movement emulation for desktop
    const handleMouseMove = (e: MouseEvent) => {
      if (isPaused || !gameStarted) return;
      const rect = canvas.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      const targetX = relativeX * LOGICAL_WIDTH;
      stateRef.current.player.targetX = Math.max(
        stateRef.current.player.radius,
        Math.min(LOGICAL_WIDTH - stateRef.current.player.radius, targetX)
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('mousemove', handleMouseMove);

    // Initial stars generator
    const stars: Star[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * LOGICAL_WIDTH,
        y: Math.random() * LOGICAL_HEIGHT,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        color: Math.random() < 0.15 ? '#a855f7' : Math.random() < 0.15 ? '#06b6d4' : '#ffffff',
      });
    }
    stateRef.current.stars = stars;

    // Game interval keyboard check loop
    const inputInterval = setInterval(() => {
      if (isPaused || !gameStarted) return;
      const p = stateRef.current.player;
      const moveSpeed = 6;

      if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        p.targetX = Math.max(p.radius, p.targetX - moveSpeed);
      }
      if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        p.targetX = Math.min(LOGICAL_WIDTH - p.radius, p.targetX + moveSpeed);
      }
    }, 1000 / 60);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('mousemove', handleMouseMove);
      clearInterval(inputInterval);
    };
  }, [isPaused, gameStarted]);

  // Main Loop logic using RequestAnimationFrame
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const game = stateRef.current;

    const mainLoop = (timestamp: number) => {
      if (!game.lastTime) game.lastTime = timestamp;
      const dt = timestamp - game.lastTime;
      game.lastTime = timestamp;

      // Handle running physics only if not paused
      if (gameStarted && !isPaused) {
        updatePhysics(dt);
      }

      // Always draw the state for visual feedback
      drawGame(ctx);

      animationId = requestAnimationFrame(mainLoop);
    };

    // PHYSIC SIMULATIONS
    const updatePhysics = (dt: number) => {
      const state = stateRef.current;
      state.gameTime += dt;

      // Gradually increase game speed multiplier over time (max 2.5x speed)
      state.speedMultiplier = Math.min(2.5, 1.0 + state.gameTime / 90000);

      // Smooth player horizontal interpolation
      const playerSpeedDelay = 0.22; // smooth factor
      state.player.x += (state.player.targetX - state.player.x) * playerSpeedDelay;

      // Update background scrolling stars
      state.stars.forEach((star) => {
        star.y += star.speed * state.speedMultiplier * 0.8;
        if (star.y > LOGICAL_HEIGHT) {
          star.y = 0;
          star.x = Math.random() * LOGICAL_WIDTH;
        }
      });

      // Update Power-up remaining timers
      if (state.powerupDurations.shield > 0) {
        state.powerupDurations.shield = Math.max(0, state.powerupDurations.shield - dt);
        setActiveShieldTime(Math.ceil(state.powerupDurations.shield / 1000));
      } else {
        setActiveShieldTime(0);
      }

      if (state.powerupDurations.magnet > 0) {
        state.powerupDurations.magnet = Math.max(0, state.powerupDurations.magnet - dt);
        setActiveMagnetTime(Math.ceil(state.powerupDurations.magnet / 1000));
      } else {
        setActiveMagnetTime(0);
      }

      if (state.powerupDurations.multiplier > 0) {
        state.powerupDurations.multiplier = Math.max(0, state.powerupDurations.multiplier - dt);
        setActiveMultTime(Math.ceil(state.powerupDurations.multiplier / 1000));
        state.multiplier = 2;
      } else {
        setActiveMultTime(0);
        state.multiplier = 1;
      }

      // Handle player invulnerability grace periods after hit/shield-break
      if (state.player.invulnerable) {
        state.player.invulnerableTimer -= dt;
        if (state.player.invulnerableTimer <= 0) {
          state.player.invulnerable = false;
        }
      }

      // Gradually advance timers
      state.obstacleSpawnTimer += dt;
      state.coreSpawnTimer += dt;
      state.powerupSpawnTimer += dt;
      state.swarmTimer += dt;

      // Swarm Event triggers every 40 seconds (incoming asteroid rush!)
      if (state.swarmTimer >= 40000) {
        state.swarmTimer = 0;
        setSwarmWarning(true);
        triggerHaptic([300, 100, 300, 100, 300]);
        setTimeout(() => setSwarmWarning(false), 4000);
      }

      // Obstacle spawners: spawns faster at high score (capped at 250ms interval)
      const baseSpawnInterval = swarmWarning ? 280 : Math.max(260, 1200 - state.score / 2.8);
      if (state.obstacleSpawnTimer >= baseSpawnInterval) {
        state.obstacleSpawnTimer = 0;
        spawnObstacle();
      }

      // Energy core spawners (regular intervals)
      if (state.coreSpawnTimer >= 1800) {
        state.coreSpawnTimer = 0;
        spawnCore();
      }

      // Rare Powerup Spawner: every 12 to 18 seconds
      const nextPowerupTime = 14000 + Math.random() * 6000;
      if (state.powerupSpawnTimer >= nextPowerupTime) {
        state.powerupSpawnTimer = 0;
        spawnPowerUp();
      }

      // Physics/Movement: Obstacles
      for (let i = state.obstacles.length - 1; i >= 0; i--) {
        const obs = state.obstacles[i];
        obs.y += obs.vy * state.speedMultiplier;
        obs.x += obs.vx;
        obs.angle += obs.spinSpeed;

        // Bounce wiggler rocks on horizontal margins
        if (obs.type === 'wiggly') {
          if (obs.x < obs.radius || obs.x > LOGICAL_WIDTH - obs.radius) {
            obs.vx = -obs.vx;
          }
        }

        // Remove out-of-screen debris
        if (obs.y > LOGICAL_HEIGHT + 30) {
          state.obstacles.splice(i, 1);
          // Reward dodging points!
          state.score += Math.round(2 * state.multiplier);
          setHudScore(state.score);
          continue;
        }

        // Hit-box Collision check with Player
        const pRadius = currentSkin.hitboxRadius; // Skin unique smaller hitbox perk!
        const dx = obs.x - state.player.x;
        const dy = obs.y - state.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < obs.radius + pRadius) {
          // Collision happened!
          if (state.player.invulnerable) {
            // Invulnerable, push away obstacle/shatter it quietly
            shatterDebris(i, obs);
          } else if (state.powerupDurations.shield > 0) {
            // Shield absorbed!
            SoundEffects.playShieldBreak();
            triggerHaptic([100, 50, 100]);
            state.powerupDurations.shield = 0; // Consume shield
            // Grant short invulnerability buffer
            state.player.invulnerable = true;
            state.player.invulnerableTimer = 1800; // 1.8 seconds grace
            shatterDebris(i, obs);
          } else {
            // CRASH! GAME OVER!
            SoundEffects.stopBGM();
            SoundEffects.playExplosion();
            triggerHaptic([600, 200, 600]);

            // Spawn massive explosion particles
            for (let k = 0; k < 25; k++) {
              state.particles.push({
                x: state.player.x,
                y: state.player.y,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                size: Math.random() * 6 + 3,
                color: currentSkin.color,
                alpha: 1.0,
                decay: Math.random() * 0.02 + 0.005,
              });
            }

            // Report final score and cores
            onGameOver(state.score, state.coresThisRun);
            setGameStarted(false);
          }
        }
      }

      // Physics/Movement: Collectible energy cores
      for (let i = state.cores.length - 1; i >= 0; i--) {
        const core = state.cores[i];

        // Magnet attraction pull physics
        const isMagnetActive = state.powerupDurations.magnet > 0;
        const dx = state.player.x - core.x;
        const dy = state.player.y - core.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Standard magnet pull range is 90px, multiplied by current spaceship skin bonus!
        const pullRadius = 90 * currentSkin.magnetBonus;

        if (isMagnetActive && dist < pullRadius) {
          // Attract towards player with increasing strength
          const pullForce = 0.16 * (1 - dist / pullRadius);
          core.x += dx * pullForce;
          core.y += dy * pullForce + 1.2; // pull slightly faster than gravity
        } else {
          // Regular downward gravity fall
          core.y += 3.2 * state.speedMultiplier;
        }

        // Core visual pulse rotation
        core.pulseScale = 1.0 + Math.sin(state.gameTime / 150) * 0.15;

        // Remove out-of-screen cores
        if (core.y > LOGICAL_HEIGHT + 20) {
          state.cores.splice(i, 1);
          continue;
        }

        // Collect verification
        if (dist < core.radius + state.player.radius + 3) {
          // Play pick sound
          SoundEffects.playCoin();
          triggerHaptic([50]);

          // Increase totals
          const earnVal = core.isDouble ? core.value * 2 : core.value;
          state.coresThisRun += earnVal;
          state.score += Math.round(15 * earnVal * state.multiplier);

          setHudCores(state.coresThisRun);
          setHudScore(state.score);
          onCoreCollected(earnVal);

          // Sparkle explosion feedback particles
          for (let k = 0; k < 6; k++) {
            state.particles.push({
              x: core.x,
              y: core.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              size: Math.random() * 3 + 1,
              color: '#facc15',
              alpha: 1.0,
              decay: 0.04,
            });
          }

          state.cores.splice(i, 1);
        }
      }

      // Physics/Movement: Power-ups
      for (let i = state.powerups.length - 1; i >= 0; i--) {
        const pup = state.powerups[i];
        pup.y += 2.2 * state.speedMultiplier;

        if (pup.y > LOGICAL_HEIGHT + 20) {
          state.powerups.splice(i, 1);
          continue;
        }

        // Check collection
        const dx = pup.x - state.player.x;
        const dy = pup.y - state.player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < pup.radius + state.player.radius + 4) {
          SoundEffects.playPowerUp();
          triggerHaptic([150, 100, 150]);

          // Apply power-up modifiers
          if (pup.type === 'shield') {
            // Shield duration has skin unique extension bonus!
            state.powerupDurations.shield = 6000 + currentSkin.shieldBonus;
          } else if (pup.type === 'magnet') {
            state.powerupDurations.magnet = 8000;
          } else if (pup.type === 'multiplier') {
            state.powerupDurations.multiplier = 7000;
          } else if (pup.type === 'bomb') {
            triggerBombExplosion();
          }

          // Sparkle feedback particles
          for (let k = 0; k < 12; k++) {
            state.particles.push({
              x: pup.x,
              y: pup.y,
              vx: (Math.random() - 0.5) * 6,
              vy: (Math.random() - 0.5) * 6,
              size: Math.random() * 4 + 2,
              color: pup.color,
              alpha: 1.0,
              decay: 0.03,
            });
          }

          state.powerups.splice(i, 1);
        }
      }

      // Physics/Movement: Particle decay effects
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const part = state.particles[i];
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= part.decay;
        if (part.alpha <= 0) {
          state.particles.splice(i, 1);
        }
      }
    };

    // Spawn an irregular, rotating asteroid obstacle
    const spawnObstacle = () => {
      const state = stateRef.current;
      const typeRand = Math.random();
      let type: Obstacle['type'] = 'standard';
      let speed = 2.8 + Math.random() * 1.5;
      let radius = 14 + Math.random() * 12;
      let color = '#475569'; // grey Slate
      let vx = 0;
      let maxHealth = 1;

      if (typeRand < 0.15 && state.score > 200) {
        type = 'fast';
        speed = 5.5 + Math.random() * 2.0;
        radius = 11 + Math.random() * 4;
        color = '#ef4444'; // Red fast rocket
      } else if (typeRand < 0.30 && state.score > 400) {
        type = 'wiggly';
        speed = 2.0 + Math.random() * 1.0;
        vx = (Math.random() < 0.5 ? -1.2 : 1.2) * state.speedMultiplier;
        radius = 15 + Math.random() * 6;
        color = '#a855f7'; // Purple wiggler
      } else if (typeRand < 0.45 && state.score > 700) {
        type = 'heavy';
        speed = 1.4 + Math.random() * 0.6;
        radius = 26 + Math.random() * 8;
        color = '#1e293b'; // Slate deep heavy rock
        maxHealth = 2;
      }

      state.obstacles.push({
        id: Math.random(),
        x: Math.random() * (LOGICAL_WIDTH - radius * 2) + radius,
        y: -radius - 10,
        vx,
        vy: speed,
        radius,
        type,
        angle: Math.random() * Math.PI * 2,
        spinSpeed: (Math.random() - 0.5) * 0.04,
        color,
        maxHealth,
        health: maxHealth,
      });
    };

    // Spawn collectible energy core crystal
    const spawnCore = () => {
      const state = stateRef.current;
      const x = Math.random() * (LOGICAL_WIDTH - 30) + 15;

      // Check double-probability skin bonus!
      const isDouble = Math.random() < (0.15 + currentSkin.doubleSpawnBonus);

      state.cores.push({
        id: Math.random(),
        x,
        y: -15,
        radius: 8,
        value: 1,
        isDouble,
        color: isDouble ? '#f59e0b' : '#eab308', // orange vs gold yellow
        pulseScale: 1.0,
      });
    };

    // Spawn powerup capsules
    const spawnPowerUp = () => {
      const state = stateRef.current;
      const types: PowerUp['type'][] = ['shield', 'magnet', 'multiplier', 'bomb'];
      const pickType = types[Math.floor(Math.random() * types.length)];
      let color = '#10b981'; // Shield green
      let label = 'S';

      if (pickType === 'magnet') {
        color = '#a855f7'; // Magnet purple
        label = 'M';
      } else if (pickType === 'multiplier') {
        color = '#f97316'; // Multiplier orange
        label = 'X';
      } else if (pickType === 'bomb') {
        color = '#06b6d4'; // EMP Bomb cyan
        label = 'B';
      }

      state.powerups.push({
        id: Math.random(),
        x: Math.random() * (LOGICAL_WIDTH - 40) + 20,
        y: -18,
        radius: 12,
        type: pickType,
        color,
        label,
      });
    };

    // Shatter obstacle helper
    const shatterDebris = (index: number, obs: Obstacle) => {
      const state = stateRef.current;
      SoundEffects.playShieldBreak();
      for (let k = 0; k < 6; k++) {
        state.particles.push({
          x: obs.x,
          y: obs.y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          size: Math.random() * 3 + 1,
          color: obs.color,
          alpha: 1.0,
          decay: 0.05,
        });
      }
      state.obstacles.splice(index, 1);
    };

    // GRAPHIC DRAWERS (CANVAS RENDERS)
    const drawGame = (c: CanvasRenderingContext2D) => {
      // Clear with elegant futuristic dark space sky gradient
      const skyGrad = c.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
      skyGrad.addColorStop(0, '#020617'); // slate-950
      skyGrad.addColorStop(1, '#0f172a'); // slate-900
      c.fillStyle = skyGrad;
      c.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

      const state = stateRef.current;

      // 1. Draw starfields
      state.stars.forEach((star) => {
        c.fillStyle = star.color;
        c.beginPath();
        c.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        c.fill();
      });

      // 2. Draw power-up gravity lines if MAGNET is active
      const isMagnetActive = state.powerupDurations.magnet > 0;
      if (isMagnetActive) {
        c.strokeStyle = 'rgba(168, 85, 247, 0.2)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(state.player.x, state.player.y, 90 * currentSkin.magnetBonus, 0, Math.PI * 2);
        c.stroke();

        // Pulsing outer magnet dash rings
        c.strokeStyle = 'rgba(168, 85, 247, 0.1)';
        c.setLineDash([6, 8]);
        c.beginPath();
        const pulseR = (90 + Math.sin(state.gameTime / 100) * 8) * currentSkin.magnetBonus;
        c.arc(state.player.x, state.player.y, pulseR, 0, Math.PI * 2);
        c.stroke();
        c.setLineDash([]); // Reset
      }

      // 3. Draw collectible crystals (Energy Cores)
      state.cores.forEach((core) => {
        c.save();
        c.translate(core.x, core.y);
        c.scale(core.pulseScale, core.pulseScale);

        // Core gold glowing shadow
        c.shadowColor = core.color;
        c.shadowBlur = 12;

        c.fillStyle = core.color;
        c.beginPath();
        // Diamond shaped core
        c.moveTo(0, -core.radius);
        c.lineTo(core.radius * 0.8, 0);
        c.lineTo(0, core.radius);
        c.lineTo(-core.radius * 0.8, 0);
        c.closePath();
        c.fill();

        // Inner core sparkle highlight
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.moveTo(0, -core.radius * 0.4);
        c.lineTo(core.radius * 0.3, 0);
        c.lineTo(0, core.radius * 0.4);
        c.lineTo(-core.radius * 0.3, 0);
        c.closePath();
        c.fill();

        c.restore();
      });

      // 4. Draw power-ups capsules
      state.powerups.forEach((pup) => {
        c.save();
        c.translate(pup.x, pup.y);

        // Glowing shadow
        c.shadowColor = pup.color;
        c.shadowBlur = 15;

        // Outer neon pill capsule
        c.strokeStyle = pup.color;
        c.lineWidth = 2.5;
        c.fillStyle = '#0f172a';
        c.beginPath();
        c.arc(0, -pup.radius / 2, pup.radius * 0.8, Math.PI, 0);
        c.lineTo(pup.radius * 0.8, pup.radius / 2);
        c.arc(0, pup.radius / 2, pup.radius * 0.8, 0, Math.PI);
        c.lineTo(-pup.radius * 0.8, -pup.radius / 2);
        c.closePath();
        c.fill();
        c.stroke();

        // Center label letter icon
        c.shadowBlur = 0; // Disable shadow for text to keep crisp
        c.fillStyle = pup.color;
        c.font = 'bold 11px sans-serif';
        c.textAlign = 'center';
        c.textBaseline = 'middle';
        c.fillText(pup.label, 0, 1);

        c.restore();
      });

      // 5. Draw asteroid obstacles
      state.obstacles.forEach((obs) => {
        c.save();
        c.translate(obs.x, obs.y);
        c.rotate(obs.angle);

        // Cyber rock neon outline
        c.strokeStyle = obs.color === '#475569' ? '#64748b' : obs.color;
        c.lineWidth = obs.type === 'heavy' ? 3.5 : 2;
        c.fillStyle = obs.color;

        // Draw irregular asteroid polygon
        c.beginPath();
        const numSides = obs.type === 'heavy' ? 8 : 6;
        for (let s = 0; s < numSides; s++) {
          const angle = (s / numSides) * Math.PI * 2;
          // create rugged mountain-like indentation
          const ruggedness = 0.82 + Math.sin(s * 1.7) * 0.12;
          const rx = obs.radius * ruggedness * Math.cos(angle);
          const ry = obs.radius * ruggedness * Math.sin(angle);
          if (s === 0) c.moveTo(rx, ry);
          else c.lineTo(rx, ry);
        }
        c.closePath();
        c.fill();
        c.stroke();

        // Draw simple craters details for gorgeous arcade looks
        c.fillStyle = 'rgba(0,0,0,0.2)';
        c.beginPath();
        c.arc(-obs.radius * 0.3, -obs.radius * 0.2, obs.radius * 0.25, 0, Math.PI * 2);
        c.fill();

        c.beginPath();
        c.arc(obs.radius * 0.2, obs.radius * 0.4, obs.radius * 0.2, 0, Math.PI * 2);
        c.fill();

        c.restore();
      });

      // 6. Draw decaying particles
      state.particles.forEach((part) => {
        c.save();
        c.globalAlpha = part.alpha;
        c.fillStyle = part.color;
        c.shadowColor = part.color;
        c.shadowBlur = 6;
        c.beginPath();
        c.arc(part.x, part.y, part.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });

      // 7. Draw Player Spaceship
      const p = state.player;
      const isFlashing = p.invulnerable && Math.floor(state.gameTime / 90) % 2 === 0;

      if (gameStarted && !isFlashing) {
        c.save();
        c.translate(p.x, p.y);

        // Thruster core glow fire
        c.fillStyle = '#ef4444'; // Flame red
        c.shadowColor = '#f43f5e';
        c.shadowBlur = 12;
        c.beginPath();
        c.moveTo(-6, 12);
        // Flicker thrust height
        const thrustHeight = 16 + Math.sin(state.gameTime / 40) * 5;
        c.lineTo(0, 12 + thrustHeight);
        c.lineTo(6, 12);
        c.closePath();
        c.fill();

        // Ship shadow glow
        c.shadowColor = currentSkin.color;
        c.shadowBlur = 18;

        // Draw customized spaceship vector shapes
        c.fillStyle = currentSkin.color;
        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.8;

        c.beginPath();
        // Nose point
        c.moveTo(0, -18);
        // Right wing slope
        c.lineTo(12, 11);
        // Center jet notch
        c.lineTo(0, 5);
        // Left wing slope
        c.lineTo(-12, 11);
        c.closePath();
        c.fill();
        c.stroke();

        // Ship cockpit glass
        c.shadowBlur = 0;
        c.fillStyle = '#38bdf8'; // Sky light blue
        c.beginPath();
        c.moveTo(0, -10);
        c.lineTo(4, 1);
        c.lineTo(0, 4);
        c.lineTo(-4, 1);
        c.closePath();
        c.fill();

        // Draw SHIELD glow ring if shield is active!
        const isShieldActive = state.powerupDurations.shield > 0;
        if (isShieldActive) {
          c.strokeStyle = 'rgba(16, 185, 129, 0.7)';
          c.shadowColor = '#10b981';
          c.shadowBlur = 16;
          c.lineWidth = 2.5;
          c.beginPath();
          // Shield pulses slightly
          const shieldPulse = 23 + Math.sin(state.gameTime / 120) * 1.8;
          c.arc(0, 0, shieldPulse, 0, Math.PI * 2);
          c.stroke();
        }

        c.restore();
      }

      // Draw standard swipe/arrows helpers inside menu before start
      if (!gameStarted) {
        c.fillStyle = 'rgba(255, 255, 255, 0.25)';
        c.font = '10px sans-serif';
        c.textAlign = 'center';
        c.fillText('◀ Drag or tap left/right to dodge ▶', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT - 35);
      }
    };

    // Run the animation loop
    animationId = requestAnimationFrame(mainLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameStarted, isPaused, selectedSkinId]);

  // Clean trigger events
  const handleTogglePause = () => {
    SoundEffects.playSelect();
    setIsPaused((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center font-sans">
      {/* HUD Bar overlays above the canvas */}
      <div className="w-full max-w-[360px] bg-slate-950/80 border-b border-slate-800 p-3 flex items-center justify-between text-white text-xs select-none backdrop-blur-md rounded-t-2xl">
        {/* Score metrics */}
        <div className="flex flex-col">
          <span className="text-xxs text-slate-400 uppercase tracking-wider">{t.score}</span>
          <span className="font-mono text-base font-extrabold text-cyan-400">
            {hudScore}{' '}
            {hudMultiplier > 1 && (
              <span className="text-xxs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-1 rounded animate-pulse">
                {hudMultiplier}X
              </span>
            )}
          </span>
        </div>

        {/* Cores metric */}
        <div className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/25 px-2.5 py-1 rounded-full text-yellow-400 font-bold font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{hudCores}</span>
        </div>

        {/* Controls: Pause / Play */}
        {gameStarted && (
          <button
            id="btn-toggle-pause"
            onClick={handleTogglePause}
            className="p-1.5 hover:bg-slate-800 active:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-white" /> : <Pause className="w-4 h-4 fill-white" />}
          </button>
        )}
      </div>

      {/* Main Canvas and overlay containers */}
      <div className="relative w-full max-w-[360px] h-[550px] bg-slate-950 overflow-hidden shadow-2xl rounded-b-2xl border-x border-b border-slate-800">
        {/* HTML5 Canvas Engine */}
        <canvas
          id="space-dodger-canvas"
          ref={canvasRef}
          width={LOGICAL_WIDTH}
          height={LOGICAL_HEIGHT}
          className="w-full h-full object-cover block cursor-crosshair"
        />

        {/* START SCREEN OVERLAY */}
        {!gameStarted && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white gap-6">
            <div className="flex flex-col gap-1">
              {/* Spaceship flying entry vector */}
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-950 mx-auto mb-2 animate-bounce">
                <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2L4 20L12 16L20 20L12 2Z"
                    fill="#fff"
                    stroke="#000"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                {currentSkin.nameEn}
              </h1>
              <p className="text-slate-400 text-xxs px-6 leading-relaxed">
                {settings.language === 'hi' ? currentSkin.perkHi : currentSkin.perkEn}
              </p>
            </div>

            {/* Tap to Start button */}
            <button
              id="btn-play-run"
              onClick={handleStartGame}
              className="w-48 py-3 px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-cyan-950/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
              <span>{t.play}</span>
            </button>
          </div>
        )}

        {/* SWARM APPROACHING EVENT WARNING */}
        {swarmWarning && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 bg-red-950/90 border border-red-500/30 text-red-400 rounded-full flex items-center gap-2 text-xxs font-bold animate-pulse shadow-lg shadow-red-950/40 select-none">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{t.warning}</span>
          </div>
        )}

        {/* POWERUP SECONDS TIMELINE BAR */}
        <div className="absolute top-2 left-3 flex flex-col gap-1.5 select-none pointer-events-none">
          {/* Shield duration */}
          {activeShieldTime > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 text-xxs font-extrabold font-mono animate-pulse">
              <Shield className="w-3.5 h-3.5" />
              <span>SHIELD: {activeShieldTime}s</span>
            </div>
          )}

          {/* Magnet duration */}
          {activeMagnetTime > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-950/80 border border-purple-500/20 text-purple-400 text-xxs font-extrabold font-mono animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MAGNET: {activeMagnetTime}s</span>
            </div>
          )}

          {/* Multiplier duration */}
          {activeMultTime > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-950/80 border border-orange-500/20 text-orange-400 text-xxs font-extrabold font-mono animate-pulse">
              <span className="text-xxs font-extrabold">2X</span>
              <span>BOOST: {activeMultTime}s</span>
            </div>
          )}
        </div>

        {/* PAUSED GAME STATE OVERLAY */}
        {isPaused && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white gap-4 select-none">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 border border-slate-700/50 mb-1">
              <Pause className="w-6 h-6 fill-slate-400 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">GAME PAUSED</h2>
            <p className="text-slate-400 text-xs px-10 leading-relaxed">
              {settings.language === 'hi'
                ? 'अपने शिप को वापस नियंत्रण में लाने के लिए नीचे रिज्यूम पर दबाएं।'
                : 'Pause active. Take a breather, wipe your screen, and tap resume to resume.'}
            </p>
            <button
              id="btn-paused-resume"
              onClick={handleTogglePause}
              className="mt-2 px-6 py-2 bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-cyan-400 active:scale-95 transition-all cursor-pointer"
            >
              Resume Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
