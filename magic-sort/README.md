# 🧪 Magic Sort

A colorful liquid puzzle game where learners sort vibrant potions across glass test tubes until each tube holds a single uniform color.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Magic Sort exercises working memory, logical deduction, and forward planning. Players are presented with test tubes filled with mixed layers of colored magical liquids. By pouring potions from tube to tube according to strict rules, players separate the colors until every test tube contains either one uniform potion color or is completely empty.

### How to Play
1. **Choose Difficulty & Mode**:
   - **Difficulty**: 😊 **Easy** (extra empty tubes for breathing room), 🧐 **Medium** (balanced challenge), or 🔥 **Hard** (minimal empty tubes).
   - **Mode**: 🧘 **Practice Mode** (relax with no timer) or ⏰ **Timed Mode** (race the visual timer bar).
2. **Select & Pour**:
   - Tap any tube containing liquid to **select** it (the tube lifts up and glows).
   - Tap a second tube to **pour** into it.
   - If you change your mind, tap the selected tube again (or press `Escape`) to deselect it.
3. **Pouring Rules**:
   - Each test tube holds up to **4 liquid layers**.
   - You can only pour if the destination tube has room AND either:
     - The destination tube is completely **empty**, OR
     - The top layer in the destination tube **matches the color** of the potion being poured.
   - All contiguous matching layers will pour together in an animated stream.
4. **Helpful Controls & Shortcuts**:
   - **↩️ Undo (`Z`)**: Step backwards to undo your last move.
   - **🔄 Restart Level (`R`)**: Reset the current puzzle back to its opening state.
   - **🏁 Quit**: Return to the setup screen at any time.
5. **Win the Level**: Complete the sort to trigger celebration confetti and progress to the next puzzle level!

### Tips for Parents & Educators
- Advise children to look for tubes that already have 2 or 3 layers of the same color — completing these first frees up empty tubes.
- An empty test tube is a valuable resource; avoid filling it with mixed colors unless you have a clear multi-step plan!

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
magic-sort/
├── index.html                 # Clean markup with setup panel, tube grid, and victory modal
├── magic-sort.css             # Glass test tube styling, liquid layers, shine reflections, and pour stream
├── magic-sort.js              # Level generation, tube state machine, pouring animation, and save engine
├── magic-sort.html            # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### Puzzle Generation & Guaranteed Solvability
To avoid creating unsolvable deadlocks, `magic-sort.js` uses a reverse-scramble simulation:
1. **Initial Sorted State**: Creates `numColors` tubes with 4 uniform color layers each, plus `extraEmpty` empty tubes.
2. **Reverse Random Walk**:
   Simulates between 180 and 240 valid legal reverse moves:
   ```js
   for (let tries = 0; tries < target * 16 && done < target; tries++) {
     // Find all valid reverse pour moves
     // Avoid immediate oscillating reversals (last.s === t && last.t === s)
     // Apply random valid move
   }
   ```
3. **Validation Check**: Checks that the resulting board has mixed layers and no already-solved tubes before serving to the player.

### Liquid Stream Animation Pipeline
When pouring from tube `s` to tube `t`:
1. `sn.style.transform = 'translateY(-32px) rotate(-15deg)'` tilts the source tube.
2. `stream(sn, tn, color)` calculates the Euclidean distance and angle between tube mouths using `Math.hypot(dx, dy)` and `Math.atan2(dy, dx)`.
3. An animated DOM element stretches across the trajectory for 520ms before settling liquid into the target stack.

### State & Save Schema
Game progress is persisted locally to `localStorage` under `kidsZone_magicSort_save_v5`:
```json
{
  "level": 4,
  "difficulty": "easy",
  "mode": "practice"
}
```

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('magic-sort')` and `KZ.mountFooter()`.
- **Sound Effects**: Integrates with `KZAudio` for tube selections, pouring bubbles, error buzzers, and victory fanfare.
- **Confetti**: Celebrates level completion using `KZ.confetti()`.

### Customization Guide
- **Adding New Color Palettes**: Expand the `COLORS` hex array in `magic-sort.js` (currently contains 8 vibrant, high-contrast potion colors).
- **Adjusting Tube Capacity**: Change `const CAP = 4` to 3 or 5 for alternate liquid volume mechanics.
