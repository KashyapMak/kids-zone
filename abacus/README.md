# 🧮 Abacus Trail

An interactive, animated vertical Japanese Soroban abacus designed to teach place value and arithmetic through tactile bead mechanics.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Abacus Trail transforms the ancient Japanese Soroban abacus into a vibrant, animated digital learning tool. By visualizing numbers as physical beads on rods rather than abstract symbols, children develop intuitive mental math capabilities (Anzan) and understand how place value functions from Ones all the way up to Billions.

### How the Soroban Works
Each vertical rod represents a decimal place value:
- **Upper Deck (Heaven Bead)**: Contains **1 bead** per rod. Each heaven bead has a value of **5**. It activates when slid **down** toward the central horizontal divider beam.
- **Lower Deck (Earth Beads)**: Contains **4 beads** per rod. Each earth bead has a value of **1**. They activate when slid **up** toward the central beam.
- **Reading a Rod**:
  - `0`: All beads away from the beam (heaven up, earth down).
  - `1` to `4`: 1 to 4 earth beads pushed up to the beam.
  - `5`: Heaven bead pushed down, earth beads down.
  - `6` to `9`: Heaven bead pushed down PLUS 1 to 4 earth beads pushed up (e.g., `5 + 3 = 8`).

### How to Use the 3 Learning Trails
1. **Show Number**:
   - Enter any number up to `9,999,999,999`.
   - Click **"Let's Go! 🚀"** or press **Enter**.
   - Watch the beads smoothly glide to represent the exact number across all place value rods (Ones, Tens, Hundreds, Thousands, etc.).
2. **Add Numbers**:
   - Enter a starting number and an addition amount.
   - Watch the animated transition: the abacus first displays the initial value, then slides additional beads up/down to arrive at the final sum.
3. **Subtract Numbers**:
   - Enter a minuend and subtrahend.
   - Watch the beads step-by-step retreat away from the beam to illustrate subtraction.

### Tips for Parents & Educators
- Start in **Show Number** mode with numbers between 1 and 20 to help young children recognize when 5 requires moving the heaven bead down.
- Challenge students to predict how many beads will touch the beam before clicking "Let's Go!".
- Relate the column labels (Units, Tens, Hundreds, Thousands) directly to standard school place-value charts.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
abacus/
├── index.html                 # Clean markup containing setup controls and 10-rod abacus frame
├── abacus.css                 # Soroban wooden frame, rod rails, and bead CSS transitions
├── abacus.js                  # Place value digit parser, bead animation state, and audio triggers
├── abacus-trail.html          # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### Soroban Bead State & Math Engine
In `abacus.js`, any number is decomposed into its individual base-10 digits across 10 rods:
```js
function getDigitAt(num, rodIndex) {
  // rodIndex 0 = Ones, 1 = Tens, 2 = Hundreds ...
  return Math.floor(num / Math.pow(10, rodIndex)) % 10;
}
```
- **Bead State Mapping**:
  For each rod representing digit `D` (from 0 to 9):
  - **Heaven Bead (Val 5)**: Active if `D >= 5`. Applied class `.active` translates the bead downward by `var(--bead-travel)`.
  - **Earth Beads (Val 1 each)**: Number of active earth beads is `D % 5`. The first `k` beads receive `.active` and translate upward toward the beam.
- **Realistic Bead Physics**:
  CSS transitions in `abacus.css` utilize a snappy cubic-bezier timing function:
  ```css
  .bead {
    transition: transform 0.28s cubic-bezier(0.25, 1, 0.5, 1);
  }
  ```
- **Animation Sequencing (Add / Sub)**:
  Uses `setTimeout` promises to stage transitions:
  1. Render starting number state (delay: 600ms).
  2. Highlight active rods involved in the operation.
  3. Animate intermediate carries/borrows into the final calculated state.

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('abacus')` and `KZ.mountFooter()`.
- **Sound Synthesis**: Uses `KZAudio.playTick()` on individual bead movements and `KZAudio.playOk()` on calculation completions.
- **Themes**: Bead colors and abacus wooden textures adapt smoothly across all 6 Kids Zone color themes.

### Customization Guide
- **Changing Rod Count**: The default is 10 rods (supports up to 9.9 Billion). To change to 7 rods (Millions), adjust `NUM_RODS = 7` in `abacus.js` and modify column labels in `index.html`.
