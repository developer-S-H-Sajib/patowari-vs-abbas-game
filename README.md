# 🎮 Patowari vs Abbas

A modern browser-based defense game with smooth animations and polished UI.

## 🚀 Quick Start

### Add Character Images

**Save the two PNG images to the `images/` folder:**

1. **Character 1 (person in vest)** → Save as `images/patowari.png`
   - This is the **enemy** that spawns from all sides

2. **Character 2 (person in white)** → Save as `images/abbas.png`
   - This is **Abbas**, the leader you must protect in the center

### Play the Game

Open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari)

## 🎯 Gameplay

- **Abbas** stays in the center
- **Patowari enemies** spawn from screen edges
- Click/tap enemies to stop them
- Each destroyed enemy = +1 score
- Enemies reaching Abbas = -10 health
- Game over when health reaches 0

## ⚡ Features

✅ **Modern UI** - Clean, gradient buttons with smooth animations  
✅ **Hit Effects** - Expanding rings and particle explosions  
✅ **Floating Score** - Animated +1 text on each hit  
✅ **Progressive Difficulty** - Increases every 10 seconds  
✅ **Enemy Labels** - "Patowari" text under each enemy  
✅ **Screen Shake** - On damage feedback  
✅ **Optimized Performance** - Using requestAnimationFrame  
✅ **Mobile Friendly** - Touch controls and responsive design  
✅ **Sound Effects** - Web Audio API generated sounds  

## 🎨 Visual Polish

- Gradient backgrounds
- Soft shadows
- Rounded corners
- Smooth transitions
- Particle effects
- Health bar shimmer animation
- Character floating animation

## 📊 Game Mechanics

**Health:** 100 HP  
**Difficulty Increase:** Every 10 seconds  
**Spawn Rate:** Starts at 2s, decreases to 0.4s  
**Enemy Speed:** Starts at 1.5x, increases to 5x  
**Damage:** 10 HP per enemy hit  

## 🌊 Wave System

Each wave increases:
- Enemy spawn rate (faster)
- Enemy movement speed (faster)
- Overall challenge

## 🎮 Controls

- **Desktop:** Click enemies to destroy
- **Mobile:** Tap enemies to destroy
- Fully responsive on all devices

## 📱 Mobile Optimization

- Touch events optimized
- Responsive layout
- Smooth performance
- No lag with many enemies

## 🔧 Customization

Edit `js/game.js` CONFIG object:

```javascript
const CONFIG = {
    INITIAL_HEALTH: 100,
    INITIAL_SPAWN_INTERVAL: 2000,
    ENEMY_DAMAGE: 10,
    // ... customize all settings
};
```

## 🎯 Game Over Screen

Shows Bengali text:  
**"আপনি এতবার নেতা কে রক্ষা করেছেন: X বার"**

Where X = your final score (enemies destroyed)

## 💡 Tips

1. Focus on enemies closest to Abbas
2. Click rapidly during later waves
3. Watch the health bar carefully
4. Listen for hit sounds to confirm hits
5. Early waves are easier - build your score!

## 📁 File Structure

```
patowari-vs-abbas/
├── index.html
├── css/style.css
├── js/game.js
├── images/
│   ├── patowari.png    ← ADD THIS
│   └── abbas.png       ← ADD THIS
└── README.md
```

## ⚙️ Technical Features

- **Engine:** Vanilla JavaScript
- **Animation:** requestAnimationFrame (60 FPS)
- **Effects:** CSS3 animations + dynamic particles
- **Audio:** Web Audio API
- **Performance:** Optimized enemy updates
- **Mobile:** Touch events with passive:false

## 🏆 Challenge

Try to beat these scores:
- **Beginner:** 20+ enemies
- **Intermediate:** 50+ enemies
- **Advanced:** 100+ enemies
- **Expert:** 200+ enemies
- **Master:** 500+ enemies

Good luck protecting Abbas! 🛡️
