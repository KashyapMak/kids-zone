# ⚖️ Number Nature Trail (Comparison)

An educational number sense game where learners compare whole numbers, decimals, and fractions using `<`, `=`, or `>`.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Number Nature Trail develops relational thinking and magnitude estimation. Learners compare two numbers that can be whole numbers, decimals, or stacked fractions, deciding whether the first value is less than (`<`), equal to (`=`), or greater than (`>`) the second value.

### Supported Number Types
- **Whole Numbers**: Natural numbers within configurable ranges (e.g., 1–20 or 1–100).
- **Decimals**: Values with 1 or 2 decimal places (e.g., `3.75` vs `3.8`).
- **Simple Fractions**: Fractions with familiar denominators from 2 to 5 (e.g., `1/2`, `3/4`).
- **Complex Fractions**: Fractions with larger denominators from 6 to 20 (e.g., `7/12`, `11/16`).

### How to Play
1. **Select Number Types**: Check any combination of Whole Numbers, Decimals, Simple Fractions, or Complex Fractions.
2. **Configure Comparison Options**:
   - **Include Equal Pairs**: When enabled, generates equivalent values (e.g., `2/4 = 0.5` or `0.75 = 3/4`).
   - **Show Number Line**: Renders an interactive number line plotting both values so learners can physically see which point lies further right.
3. **Choose Mode & Questions**: Select Practice Mode (self-paced) or Test Mode (timed).
4. **Select `<` , `=` , or `>`**:
   - **`<` (Less than)**: Left number is smaller than right number.
   - **`=` (Equal to)**: Both numbers hold identical value.
   - **`>` (Greater than)**: Left number is larger than right number.
5. **Review Results**: View badges, answer history, and print summary sheets.

### Keyboard Shortcuts
- `<` or `1`: Select `<` (Less than)
- `=` or `2`: Select `=` (Equal)
- `>` or `3`: Select `>` (Greater than)
- `Enter` or `N`: Advance to next question (Test mode)
- `S`: Skip question
- `R`: Read aloud

### Tips for Parents & Educators
- Use the classic "hungry alligator" visual memory aid: the open mouth always points toward the larger number!
- Enable the **Number Line** to demonstrate that any number located further to the right is always greater.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
compare-number/
├── index.html                 # Clean setup form and comparison board
├── compare-number.css         # Styling for symbol buttons, stacked fractions, and number line
├── compare-number.js          # Number generation, floating-point comparator, and UI engine
├── number-compare-trail.html  # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### Core Architecture & Comparison Engine
- **Unified Number Model**:
  Every generated operand is represented as an object:
  ```js
  {
    type: 'fraction', // 'whole' | 'decimal' | 'fraction'
    raw: 0.75,
    html: '<div class="stacked-frac"><span class="n">3</span><span class="d">4</span></div>',
    text: '3/4'
  }
  ```
- **Precision Safe Comparison**:
  Floating-point comparison utilizes an epsilon threshold to avoid JavaScript IEEE 754 precision artifacts:
  ```js
  const EPSILON = 1e-6;
  function compareValues(a, b) {
    if (Math.abs(a - b) < EPSILON) return '=';
    return a < b ? '<' : '>';
  }
  ```
- **Number Line Renderer**:
  Calculates the display bounds `[minBound, maxBound]` spanning both values and positions markers using percentage offsets:
  ```js
  const percent = ((val - minBound) / (maxBound - minBound)) * 100;
  markerElement.style.left = `${Math.max(4, Math.min(96, percent))}%`;
  ```

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('compare-number')` and `KZ.mountFooter()`.
- **Audio Feedback**: Uses `KZAudio.playOk()`, `KZAudio.playWrong()`, and `KZAudio.playTick()`.
- **Theming**: Inherits theme tokens (`--primary`, `--accent`, `--card`) from `../common/common.css`.

### Customization Guide
- **Adding Negative Numbers**: Extend the generator in `compare-number.js` to allow negative lower bounds (e.g., `-10` to `10`) and update the number line coordinate scaling accordingly.
- **Custom Denominator Limits**: Adjust `denMin` and `denMax` inside the `generateFractionOperand()` routine.
