// ===================================
// Game Configuration
// ===================================
const CONFIG = {
    INITIAL_HEALTH: 100,
    INITIAL_SPAWN_INTERVAL: 2000,
    INITIAL_ENEMY_SPEED: 1.5,
    DIFFICULTY_INTERVAL: 10000, // 10 seconds
    SPAWN_RATE_DECREASE: 250,
    SPEED_INCREASE: 0.4,
    MIN_SPAWN_INTERVAL: 400,
    MAX_ENEMY_SPEED: 5,
    ENEMY_DAMAGE: 10,
    LEADER_COLLISION_RADIUS: 90,
    ANGRY_DISTANCE_THRESHOLD: 200, // Distance in pixels to trigger angry mode
    IMAGES: {
        patowari: 'images/patowari.png',
        abbas: 'images/abbas.png',
        angry: 'images/angry.png' // Angry Abbas image
    }
};

// ===================================
// Game State
// ===================================
const gameState = {
    health: CONFIG.INITIAL_HEALTH,
    score: 0,
    time: 0,
    wave: 1,
    isPlaying: false,
    spawnInterval: CONFIG.INITIAL_SPAWN_INTERVAL,
    enemySpeed: CONFIG.INITIAL_ENEMY_SPEED,
    enemies: [],
    animationFrame: null,
    lastTime: 0,
    isAngry: false, // Track Abbas angry mode state
    timers: {
        spawn: null,
        difficulty: null,
        game: null
    }
};

// ===================================
// DOM Elements
// ===================================
const elements = {
    // Screens
    menuScreen: document.getElementById('menuScreen'),
    howToPlayScreen: document.getElementById('howToPlayScreen'),
    gameScreen: document.getElementById('gameScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    bgMusic: document.getElementById('bgMusic'),
    heartbeat: document.getElementById('heartbeat'),
    followPopup: document.getElementById('followPopup'),
    hahaSound: document.getElementById('hahaSound'),
    abbasVoice: document.getElementById('abbasVoice'),
    finalScore: document.getElementById('finalScore'),
    finalTime: document.getElementById('finalTime'),
    finalWave: document.getElementById('finalWave'),




    // Menu
    startBtn: document.getElementById('startBtn'),
    howToPlayBtn: document.getElementById('howToPlayBtn'),
    backToMenuBtn: document.getElementById('backToMenuBtn'),

    // Game HUD
    scoreDisplay: document.getElementById('scoreDisplay'),
    timerDisplay: document.getElementById('timerDisplay'),
    waveDisplay: document.getElementById('waveDisplay'),
    healthBar: document.getElementById('healthBar'),
    healthText: document.getElementById('healthText'),

    // Game elements
    abbas: document.getElementById('abbas'),
    abbasImg: document.getElementById('abbasImg'),
    enemyContainer: document.getElementById('enemyContainer'),
    effectsContainer: document.getElementById('effectsContainer'),
    gameCanvas: document.getElementById('gameCanvas'),

    // Game over
    // Game over: Handled above (duplicates removed)
    restartBtn: document.getElementById('restartBtn'),
    menuBtn: document.getElementById('menuBtn')
};

// ===================================
// Screen Management
// ===================================
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

// ===================================
// Audio System (Web Audio API)
// ===================================
const AudioSystem = {
    context: null,

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio not supported');
        }
    },

    playHit() {
        if (!this.context) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.frequency.value = 800;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.2, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);
        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    },

    playDamage() {
        if (!this.context) return;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.frequency.setValueAtTime(200, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.2);
        osc.type = 'sawtooth';
        gain.gain.setValueAtTime(0.3, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.2);
        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    },

    playGameOver() {
        if (!this.context) return;
        [400, 350, 300, 250].forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.frequency.value = freq;
            const start = this.context.currentTime + (i * 0.2);
            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
            osc.start(start);
            osc.stop(start + 0.3);
        });
    }
};

// ===================================
// Visual Effects
// ===================================
function createHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'hit-effect';
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';

    // Expanding ring
    const ring = document.createElement('div');
    ring.className = 'hit-ring';
    effect.appendChild(ring);

    // Particles
    const particles = document.createElement('div');
    particles.className = 'hit-particles';
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = (i / 8) * Math.PI * 2;
        const distance = 60;
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        particles.appendChild(particle);
    }
    effect.appendChild(particles);

    elements.effectsContainer.appendChild(effect);
    setTimeout(() => effect.remove(), 600);
}

function createScorePopup(x, y, points = 1) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points}`;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    elements.gameCanvas.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}
function showFollowPopup() {
    if (elements.followPopup) {
        elements.followPopup.style.display = "flex";
    }
}

function closeFollowPopup() {
    elements.followPopup.style.display = "none";
}

function shakeScreen() {
    elements.gameScreen.classList.add('shake');
    setTimeout(() => elements.gameScreen.classList.remove('shake'), 500);
}

// ===================================
// Angry Mode System
// ===================================
/**
 * Calculate Euclidean distance between two elements
 * @param {HTMLElement} elem1 - First element (Abbas)
 * @param {HTMLElement} elem2 - Second element (Enemy)
 * @returns {number} Distance in pixels
 */
function getDistance(elem1, elem2) {
    const rect1 = elem1.getBoundingClientRect();
    const rect2 = elem2.getBoundingClientRect();

    // Calculate center points
    const x1 = rect1.left + rect1.width / 2;
    const y1 = rect1.top + rect1.height / 2;
    const x2 = rect2.left + rect2.width / 2;
    const y2 = rect2.top + rect2.height / 2;

    // Calculate Euclidean distance
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

/**
 * Check enemy proximity and update Abbas image accordingly
 * Switches between normal and angry mode based on distance
 */
function updateAngryMode() {

    let shouldBeAngry = false;

    for (let i = 0; i < gameState.enemies.length; i++) {
        const enemy = gameState.enemies[i];

        if (enemy.alive) {
            const distance = getDistance(elements.abbas, enemy.element);

            if (distance < CONFIG.ANGRY_DISTANCE_THRESHOLD) {
                shouldBeAngry = true;
                break;
            }
        }
    }

    // Enemy close → Angry mode
    if (shouldBeAngry && !gameState.isAngry) {

        elements.abbasImg.src = CONFIG.IMAGES.angry;
        elements.gameScreen.classList.add("danger");

        // music low
        if (elements.bgMusic) {
            elements.bgMusic.volume = 0.2;
        }

        // heartbeat start only once (fix glitch)
        if (elements.heartbeat && elements.heartbeat.paused) {
            elements.heartbeat.currentTime = 0;
            elements.heartbeat.volume = 0.7;
            elements.heartbeat.play().catch(() => { });
        }

        gameState.isAngry = true;
    }

    // Enemy far → Normal mode
    else if (!shouldBeAngry && gameState.isAngry) {

        elements.abbasImg.src = CONFIG.IMAGES.abbas;
        elements.gameScreen.classList.remove("danger");

        // restore music
        if (elements.bgMusic) {
            elements.bgMusic.volume = 0.4;
        }

        // heartbeat stop properly
        if (elements.heartbeat) {
            elements.heartbeat.pause();
            elements.heartbeat.currentTime = 0;
        }

        gameState.isAngry = false;
    }

}
// ===================================
// Update Display
// ===================================
function updateScore() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.scoreDisplay.parentElement.classList.add('value-update');
    setTimeout(() => elements.scoreDisplay.parentElement.classList.remove('value-update'), 300);
}

function updateHealth() {
    const percentage = (gameState.health / CONFIG.INITIAL_HEALTH) * 100;
    elements.healthBar.style.width = percentage + '%';
    elements.healthText.textContent = gameState.health;

    if (percentage < 30) {
        elements.healthBar.classList.add('low');
    } else {
        elements.healthBar.classList.remove('low');
    }
}

function updateTimer() {
    gameState.time++;
    elements.timerDisplay.textContent = gameState.time + 's';
}

function updateWave() {
    elements.waveDisplay.textContent = gameState.wave;
}

// ===================================
// Enemy Class
// ===================================
class Enemy {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'enemy';

        // Create enemy HTML
        this.element.innerHTML = `
            <img src="${CONFIG.IMAGES.patowari}" alt="Patowari" class="character-img"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23e74c3c%22/%3E%3C/svg%3E'">
            <div class="character-label">Patowari</div>
        `;

        // Random spawn position from edges
        const canvas = elements.gameCanvas.getBoundingClientRect();
        const edge = Math.floor(Math.random() * 4);

        switch (edge) {
            case 0: // top
                this.x = Math.random() * canvas.width;
                this.y = -60;
                break;
            case 1: // right
                this.x = canvas.width + 60;
                this.y = Math.random() * canvas.height;
                break;
            case 2: // bottom
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 60;
                break;
            case 3: // left
                this.x = -60;
                this.y = Math.random() * canvas.height;
                break;
        }

        // Calculate direction to Abbas (center)
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const angle = Math.atan2(centerY - this.y, centerX - this.x);

        this.vx = Math.cos(angle) * gameState.enemySpeed;
        this.vy = Math.sin(angle) * gameState.enemySpeed;

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        // Click hit
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onHit();
        });

        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.onHit();
        }, { passive: false });

        elements.enemyContainer.appendChild(this.element);
        this.alive = true;
    }

    update(deltaTime) {
        if (!this.alive) return false;

        this.x += this.vx;
        this.y += this.vy;

        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';

        // Collision check with Abbas
        const canvas = elements.gameCanvas.getBoundingClientRect();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        const distance = Math.sqrt(
            Math.pow(this.x - centerX, 2) +
            Math.pow(this.y - centerY, 2)
        );

        if (distance < CONFIG.LEADER_COLLISION_RADIUS) {
            this.onReachLeader();
            return false;
        }

        return true;
    }

    onHit() {
        if (!this.alive) return;
        this.alive = false;

        gameState.score++;
        updateScore();

        createHitEffect(this.x, this.y);
        createScorePopup(this.x, this.y, 1);

        AudioSystem.playHit();

        this.element.classList.add('hit');
        setTimeout(() => this.remove(), 500);
    }

    onReachLeader() {
        if (!this.alive) return;
        this.alive = false;

        // Damage Abbas
        gameState.health -= CONFIG.ENEMY_DAMAGE;
        gameState.health = Math.max(0, gameState.health);
        updateHealth();

        // Haha sound play
        if (elements.hahaSound) {
            elements.hahaSound.currentTime = 0;
            elements.hahaSound.play().catch(() => { });
        }

        // Visual feedback
        elements.abbas.classList.add('damaged');
        setTimeout(() => elements.abbas.classList.remove('damaged'), 300);

        shakeScreen();
        AudioSystem.playDamage();

        if (gameState.health <= 0) {
            endGame();
        }


        this.remove();
    }

    remove() {
        this.alive = false;
        const index = gameState.enemies.indexOf(this);
        if (index > -1) {
            gameState.enemies.splice(index, 1);
        }
        this.element.remove();
    }
}

// ===================================
// Enemy Spawning
// ===================================
function spawnEnemy() {
    if (gameState.enemies.length > 12) return;
    const enemy = new Enemy();
    gameState.enemies.push(enemy);
}

function startSpawning() {
    if (gameState.timers.spawn) {
        clearInterval(gameState.timers.spawn);
    }
    gameState.timers.spawn = setInterval(spawnEnemy, gameState.spawnInterval);
}

// ===================================
// Difficulty System
// ===================================
function increaseDifficulty() {
    gameState.wave++;
    updateWave();

    // Increase difficulty
    gameState.spawnInterval = Math.max(
        CONFIG.MIN_SPAWN_INTERVAL,
        gameState.spawnInterval - CONFIG.SPAWN_RATE_DECREASE
    );

    gameState.enemySpeed = Math.min(
        CONFIG.MAX_ENEMY_SPEED,
        gameState.enemySpeed + CONFIG.SPEED_INCREASE
    );

    // Restart spawning with new interval
    startSpawning();

    console.log(`Wave ${gameState.wave}: Spawn ${gameState.spawnInterval}ms, Speed ${gameState.enemySpeed}`);
}

// ===================================
// Game Loop (Optimized with RAF)
// ===================================
function gameLoop(currentTime) {
    if (!gameState.isPlaying) return;

    const deltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;

    // Update all enemies
    gameState.enemies = gameState.enemies.filter(enemy => enemy.update(deltaTime));

    // Update angry mode based on enemy proximity
    updateAngryMode();

    gameState.animationFrame = requestAnimationFrame(gameLoop);
}

// ===================================
// Game Control
// ===================================
function startGame() {
    // Reset state
    gameState.health = CONFIG.INITIAL_HEALTH;
    gameState.score = 0;
    gameState.time = 0;
    gameState.wave = 1;
    gameState.isPlaying = true;
    gameState.spawnInterval = CONFIG.INITIAL_SPAWN_INTERVAL;
    gameState.enemySpeed = CONFIG.INITIAL_ENEMY_SPEED;
    gameState.enemies = [];
    gameState.lastTime = performance.now();
    gameState.isAngry = false; // Reset angry state

    // Update UI
    updateScore();
    updateHealth();
    updateWave();
    elements.timerDisplay.textContent = '0s';

    // Clear containers
    elements.enemyContainer.innerHTML = '';
    elements.effectsContainer.innerHTML = '';

    // Load Abbas image
    // First, remove any existing placeholders
    const existingPlaceholders = elements.abbas.querySelectorAll('div');
    existingPlaceholders.forEach(el => {
        if (el.className !== 'character-label') {
            el.remove();
        }
    });

    // Reset image display
    elements.abbasImg.style.display = 'block';
    elements.abbasImg.src = CONFIG.IMAGES.abbas;
    elements.abbasImg.onerror = function () {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'width:100%;height:100%;background:#3498db;border-radius:50%;';
        placeholder.className = 'abbas-placeholder';
        this.parentElement.appendChild(placeholder);
    };

    // Show game screen
    showScreen(elements.gameScreen);

    // Start timers
    gameState.timers.game = setInterval(updateTimer, 1000);
    gameState.timers.difficulty = setInterval(increaseDifficulty, CONFIG.DIFFICULTY_INTERVAL);

    // Start spawning and game loop
    startSpawning();
    gameState.animationFrame = requestAnimationFrame(gameLoop);
    if (elements.bgMusic) {
        elements.bgMusic.volume = 0.4;
        elements.bgMusic.play().catch(() => { });
    }

}

function endGame() {
    gameState.isPlaying = false;

    // Stop all systems
    clearInterval(gameState.timers.game);
    clearInterval(gameState.timers.difficulty);
    clearInterval(gameState.timers.spawn);
    cancelAnimationFrame(gameState.animationFrame);

    // Clear enemies
    gameState.enemies.forEach(e => e.remove());
    gameState.enemies = [];

    // Play sound
    AudioSystem.playGameOver();
    // Stop background music
    if (elements.bgMusic) {
        elements.bgMusic.pause();
        elements.bgMusic.currentTime = 0;
    }

    // Abbas voice play after 1 sec (Added from local function)
    setTimeout(() => {
        if (elements.abbasVoice) {
            elements.abbasVoice.currentTime = 0;
            elements.abbasVoice.play().catch(() => { });
        }
    }, 1000);

    // Update game over screen (The FIX: Ensure these update correctly)
    if (elements.finalScore) elements.finalScore.textContent = gameState.score;
    if (elements.finalTime) elements.finalTime.textContent = gameState.time + 's';
    if (elements.finalWave) elements.finalWave.textContent = gameState.wave;

    // Show game over screen
    showScreen(elements.gameOverScreen);

    // popup after 1 sec (Added from local function)
    setTimeout(() => {
        showFollowPopup();
    }, 1000);
}

// ===================================
// Event Listeners
// ===================================
function initEvents() {
    // Menu
    elements.startBtn.addEventListener('click', startGame);
    elements.howToPlayBtn.addEventListener('click', () => {
        showScreen(elements.howToPlayScreen);
    });
    elements.backToMenuBtn.addEventListener('click', () => {
        showScreen(elements.menuScreen);
    });

    // Game over
    elements.restartBtn.addEventListener('click', startGame);
    elements.menuBtn.addEventListener('click', () => {
        showScreen(elements.menuScreen);
    });

    // Prevent touch scroll
    elements.gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
    }, { passive: false });
}

// ===================================
// Initialize
// ===================================
function init() {
    AudioSystem.init();
    initEvents();
    showScreen(elements.menuScreen);

    console.log('🎮 Patowari vs Abbas Initialized!');
    console.log('📁 Add images:');
    console.log('   - images/patowari.png (Enemy)');
    console.log('   - images/abbas.png (Leader - Normal)');
    console.log('   - images/angry.png (Leader - Angry Mode)');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
