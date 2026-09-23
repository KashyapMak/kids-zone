# 🧩 Klotski Trail

A classic sliding tile number puzzle featuring authentic wooden textures, responsive grid scaling, and guaranteed solvable boards.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Klotski Trail is a spatial logic puzzle inspired by traditional sliding tile games. Players slide numbered square tiles into the single open space to arrange all numbers in ascending order from `1` to `N` (left-to-right, top-to-bottom), leaving the empty slot at the bottom-right corner. It cultivates spatial planning, persistence, and algorithmic problem-solving.

### Difficulty Modes
- 🟩 **Simple (4×4 Grid)**: 15 numbered tiles (1 to 15). Ideal for beginners, quick drills, and elementary students.
- 🟦 **Medium (8×8 Grid)**: 63 numbered tiles (1 to 63). A satisfying challenge for intermediate problem solvers.
- 🟥 **Hard (12×12 Grid)**: 143 numbered tiles (1 to 143). An expansive grandmaster challenge for high-focus logic enthusiasts.

### How to Play
1. **Choose Grid Size**: Click Simple, Medium, or Hard. The board automatically shuffles into a **guaranteed solvable** puzzle.
2. **Slide Tiles**:
   - **Click / Tap**: Tap any tile directly adjacent (above, below, left, or right) to the empty space to slide it into that space.
   - **Keyboard Arrow Keys**: Use the `Up`, `Down`, `Left`, and `Right` arrow keys to slide tiles into the gap.
3. **Helpful Tools**:
   - **💡 Hint (`H`)**: Flashes all currently moveable tiles in bright gold so you can spot your available moves.
   - **↺ Reset (`R`)**: Returns the board to the exact start of the current shuffle so you can retry the same layout.
   - **🔀 New Shuffle (`N`)**: Generates a completely fresh puzzle shuffle.
4. **Win the Game**: When all tiles are placed sequentially with the empty slot at the bottom-right, enjoy celebratory confetti and log your best move count and time!

### Tips for Parents & Educators
- Teach the "Row-by-Row" strategy: solve the top row first (1, 2, 3, 4), then lock it in place and solve the second row, working downwards.
- When placing the last two numbers of a row (e.g. 3 and 4), place them together as a pair before sliding them into their final slots.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
klotski/
├── index.html                 # Clean markup with mode selector, board wrapper, and win modal
├── klotski.css                # Wood grain textures, tile shadows, and responsive grid layout
├── klotski.js                 # Solvable shuffle generator, tile slide engine, and timer
├── klotski-trail.html         # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### Guaranteed Solvability Walk Algorithm
In classic sliding tile puzzles, a completely random array permutation has a 50% chance of being mathematically unsolvable due to inversion parity. To guarantee every game is 100% solvable:
1. `klotski.js` initializes the board in the solved goal state: `[1, 2, ..., N*N - 1, 0]`.
2. It executes `K` random legal neighbor slides from the empty slot (`emptyIdx`), tracking `lastEmpty` to prevent oscillating back and forth:
   ```js
   const steps = MODES[mode].shuffles; // e.g. 80, 200, 350 steps
   for (let i = 0; i < steps; i++) {
     const neighbors = getMoveable(emptyIdx).filter(idx => idx !== lastEmpty);
     const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
     lastEmpty = emptyIdx;
     tiles[emptyIdx] = tiles[pick];
     tiles[pick] = 0;
     emptyIdx = pick;
   }
   ```

### Dynamic Viewport & Font Sizing
Tiles are sized dynamically based on screen dimensions to prevent scrolling:
```js
function tileSize() {
  const maxBoard = Math.min(window.innerWidth - 48, window.innerHeight - 280, 580);
  const available = maxBoard - 8 - 20 - 4 * (N - 1);
  return Math.max(26, Math.floor(available / N));
}
```
Tile background gradients are generated programmatically using HSL hue offsets based on tile numerical values for a visually distinctive aesthetic.

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('klotski')` and `KZ.mountFooter()`.
- **Sound Effects**: Plays `KZAudio.playTick()` on tile movements and `KZAudio.playOk()` on puzzle victory.
- **Confetti Celebration**: Triggers `KZ.confetti()` upon puzzle completion.

### Customization Guide
- **Adding a 3×3 (8-Puzzle) Mode**: Add a `{ n: 3, label: 'Mini (3×3)', shuffles: 40 }` entry to `MODES` in `klotski.js` and add a button to `#mode-row` in `index.html`.
- **Modifying Shuffle Depth**: Adjust `MODES[mode].shuffles` to increase or decrease puzzle complexity.
