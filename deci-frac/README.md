# ➗➕ Deci-Frac Trail

An educational math game designed to practice addition and subtraction with decimals and fractions using authentic stacked and column layouts.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Deci-Frac Trail bridges the gap between horizontal equation solving and vertical paper-and-pencil calculations. It displays decimal arithmetic aligned strictly to the decimal point and renders fractions with true stacked numerators and denominators (`a/b`), reinforcing conceptual grasp and mental calculation.

### How to Play
1. **Choose Problem Type**:
   - **Decimals**: Practice multi-digit decimal addition or subtraction with configurable whole digits (1–3) and decimal places (1–3).
   - **Fractions**: Work with fractions including like or unlike denominators, with options for auto-simplification and proper fractions only.
   - **Mixed**: Alternates between decimal and fraction problems for comprehensive review.
2. **Select Operation**: Pure **Addition**, pure **Subtraction**, or a **Mixed** blend.
3. **Visual Learning Aids**:
   - **100-Grid Visualizer**: Highlights percentage-like shaded areas for decimal values up to 2 decimal places.
   - **Fraction Bars**: Renders side-by-side fraction proportion bars to visualize the magnitude of each fraction before adding or subtracting.
4. **Choose Game Mode**:
   - **Practice Mode**: Explore without a timer; re-attempt any incorrect answer immediately.
   - **Test Mode (Timed)**: Choose per-question or total test countdowns to measure speed and accuracy.
5. **Answer & Print Summary**: Select the correct answer or press keyboard keys `1`–`6`. Review your final score and print the detailed calculation sheet.

### Keyboard Shortcuts
- `1` to `6`: Select answer option
- `Enter` or `N`: Proceed to next question (Test mode)
- `S`: Skip current question
- `R`: Read question aloud

### Tips for Parents & Educators
- For beginners introducing fractions, keep **Like Denominators** checked.
- Once learners understand common denominators, uncheck **Like Denominators** to practice finding LCM.
- Encourage students to observe the **Fraction Bars** before selecting an answer to estimate whether the sum should be greater or less than 1.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
deci-frac/
├── index.html                 # Clean markup containing setup form, quiz area, and print modal
├── deci-frac.css              # Custom styling for stacked fractions, decimal columns, and visual grids
├── deci-frac.js               # Fraction arithmetic library, decimal generator, and quiz engine
├── deci-frac-trail.html       # Legacy URL forwarder
└── README.md                  # This documentation
```

### Fraction & Decimal Engine Logic
- **Greatest Common Divisor (GCD) & Simplification**:
  ```js
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  function simplifyFraction(n, d) {
    const g = gcd(Math.abs(n), Math.abs(d));
    return { n: n / g, d: d / g };
  }
  ```
- **Fraction Layout Renderer**:
  Constructs stacked HTML representations:
  ```html
  <div class="stacked-fraction">
    <span class="num">3</span>
    <span class="denom">4</span>
  </div>
  ```
- **Decimal Alignment**:
  Decimals are formatted with fixed decimal point string alignment, ensuring tenths and hundredths columns match standard classroom presentation.
- **Visual Aid Generators**:
  - `render100Grid(val)`: Populates a 10×10 CSS grid to represent hundredths graphically.
  - `renderFractionBar(num, denom)`: Generates CSS flex containers with colored segments proportional to the fraction value.

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('deci-frac')` and `KZ.mountFooter()`.
- **Audio & Accessibility**: Integrates with `KZAudio` and supports high-contrast theme toggling via `../common/common.css`.
- **Celebration**: Triggers `KZ.confetti()` upon quiz completion.

### Customization Guide
- **Adjusting Denominator Bounds**: Default denominator range is 2 to 12. Modify `cfg.denMin` and `cfg.denMax` in `deci-frac.js`.
- **Supporting Mixed Numbers**: Extend the `Fraction` object to include a whole number component `w` and update the stacked fraction HTML template.
