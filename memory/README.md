# 🧠 Memory Trail

A card-matching memory workout game designed to exercise short-term working memory, concentration, and visual recall under gentle time challenges.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Memory Trail trains working memory and cognitive focus by challenging players to find matching pairs hidden beneath face-down cards. By adjusting card sets between familiar numbers and distinctive graphic symbols, it helps children develop spatial recall and pattern recognition strategies.

### Card Sets & Progressive Difficulty
- **Card Sets**:
  - **Numbers**: Integer cards from 1 to 50.
  - **Symbols**: Distinctive geometric and playful symbols (stars, hearts, music notes, clouds, fruits).
  - **Mixed**: A challenging blend of numbers and symbols.
- **5 Progressive Levels**:
  - Level 1: 8 cards (4 pairs)
  - Level 2: 12 cards (6 pairs)
  - Level 3: 16 cards (8 pairs)
  - Level 4: 20 cards (10 pairs)
  - Level 5: 24 cards (12 pairs)
- **Difficulty Modes**:
  | Mode | Flip-back Delay | Timer Penalty per Miss | Base Score per Match |
  | :--- | :---: | :---: | :---: |
  | **Easy** | 850 ms | None (0s) | 10 pts |
  | **Medium** | 700 ms | −2 seconds | 12 pts |
  | **Hard** | 550 ms | −5 seconds | 15 pts |

### How to Play
1. **Configure Setup**: Pick your Card Set, Difficulty Mode, and Total Time (default is 120 seconds).
2. **Helpful Options**:
   - **1-Second Peek**: Flips all cards face-up for 1 second at the start of each level to allow quick mental mapping.
   - **Shuffle Cards**: Re-shuffles card placement between levels.
3. **Flip Cards**: Click any card to turn it over, then click a second card:
   - **Match**: Both cards stay face-up, your score increases, and your streak counter grows!
   - **Mismatch**: Both cards flip back after a brief pause. In Medium and Hard modes, time is deducted from the clock.
4. **Advance & Finish**: Clear all pairs on the board to advance to the next level before the countdown expires. View your final score, trophies, and print your trail certificate.

### Tips for Parents & Educators
- Encourage younger children to verbalize the symbol or number out loud when flipping ("Top left is a red apple").
- Start on **Easy** with **1-Second Peek** enabled to build confidence and reduce frustration.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
memory/
├── index.html                 # Clean setup screen, dynamic card grid, and results modal
├── memory.css                 # 3D card flip styles, grid layouts, and badge styling
├── memory.js                  # Deck builder, flip state machine, timer, and score tracker
├── memory-trail.html          # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### 3D Card Flip Mechanics & State Machine
- **CSS 3D Transform Architecture**:
  In `memory.css`, tiles utilize hardware-accelerated 3D backface visibility:
  ```css
  .tile { perspective: 800px; }
  .tile-inner { transform-style: preserve-3d; transition: transform 0.35s ease; }
  .tile.flipped .tile-inner { transform: rotateY(180deg); }
  .front, .back { backface-visibility: hidden; }
  ```
- **Concurrency & Board Locking**:
  `memory.js` employs a strict `lockBoard` boolean flag to prevent rapid-click race conditions:
  ```js
  function onFlip(tile, t) {
    if (lockBoard || tile.classList.contains('flipped')) return;
    tile.classList.add('flipped');
    if (!firstPick) { firstPick = { tile, t }; return; }
    lockBoard = true;
    if (firstPick.t.val === t.val) {
      // Match found -> unlock board immediately
      lockBoard = false;
    } else {
      // Mismatch -> pause, then flip back and unlock
      setTimeout(() => {
        a.classList.remove('flipped');
        b.classList.remove('flipped');
        lockBoard = false;
      }, flipBackDelay);
    }
  }
  ```
- **Deck Builder**:
  Randomly samples `N / 2` unique symbols/numbers from the pool, duplicates each element with distinct IDs, and applies an in-place Fisher-Yates shuffle.

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('memory')` and `KZ.mountFooter()`.
- **Sound Effects**: Plays `KZAudio.playOk()` on matches, `KZAudio.playWrong()` on mismatches, and `KZAudio.playTick()` on countdowns.
- **Confetti**: Celebrates level clearances and game completion using `KZ.confetti()`.

### Customization Guide
- **Adding Custom Emoji/Icon Packs**: Expand `symbolBank` in `memory.js` with new emoji, letters, or unicode icons.
- **Adjusting Level Card Counts**: Modify `cfg.levelCards` (default: `[8, 12, 16, 20, 24]`) to adjust grid progression.
