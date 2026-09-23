# ➕➖ Add & Sub Trail

A customizable arithmetic game focusing on addition and subtraction with comprehensive scaffolding controls.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Add & Sub Trail helps learners master addition and subtraction from basic single-digit facts up to multi-digit operations (1 to 4 digits). It features essential scaffolding options that prevent frustration, allowing learners to focus on foundational mechanics before introducing complex regrouping.

### How to Play
1. **Choose Digit Level**: Select **1-digit** (1–9), **2-digit** (10–99), **3-digit** (100–999), or **4-digit** (1,000–9,999) problems.
2. **Select Operation**: Practice pure **Addition**, pure **Subtraction**, or a **Mixed** blend of both.
3. **Configure Scaffolding & Safety**:
   - **No Negatives (Subtraction)**: Automatically places the larger number first so the result is always non-negative.
   - **No Carry (Addition)**: Filters out sums where column regrouping occurs (e.g., `23 + 14` instead of `28 + 15`).
   - **No Borrow (Subtraction)**: Filters out subtractions where decomposition is required (e.g., `47 - 23` instead of `42 - 19`).
   - **Number Line Aid**: Displays a visual number line for small calculations to demonstrate step counting.
4. **Select Mode & Timers**:
   - **Practice Mode**: Untimed with unlimited retries on missed questions.
   - **Test Mode**: Timed evaluation with either a per-question countdown or total test timer.
5. **Answer & Review**: Click answer buttons or press keyboard keys (`1`–`6`). Finish the quiz to see streaks, badges, and a printable mistake review sheet.

### Keyboard Shortcuts
- `1` to `6`: Choose corresponding answer choice
- `Enter` or `N`: Advance to next question (Test mode)
- `S`: Skip question
- `R`: Read problem aloud

### Tips for Parents & Educators
- For children just learning column addition: select **2-digit**, check **No Carry**, and play in **Practice Mode**.
- Once confident, uncheck **No Carry** to introduce regrouping concepts gradually.
- Subtraction beginners benefit immensely from enabling both **No Negatives** and **No Borrow**.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
add-sub/
├── index.html                 # Clean HTML shell mounting common layout
├── add-sub.css                # Scoped styles for number line, option buttons, and quiz cards
├── add-sub.js                 # Math engine, problem generation, and validation
├── add-sub-trail.html         # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### Problem Generation Algorithm & Constraints
The problem generator in `add-sub.js` validates every generated equation against user-selected safety rules:
- **Operand Range Calculation**:
  ```js
  const min = digits === 1 ? 1 : Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  ```
- **Regrouping Filters**:
  - `hasCarry(a, b)`: Inspects digit-by-digit addition; rejects candidate pairs if `(a_i + b_i) >= 10`.
  - `hasBorrow(a, b)`: Inspects digit-by-digit subtraction; rejects pairs if `a_i < b_i`.
- **Smart Distractors**:
  - Candidate wrong answers include `correct ± 1`, `correct ± 10`, `correct ± 2`, and common carry/borrow mistake outcomes.
  - Distractors are deduplicated and shuffled alongside the correct solution.

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('add-sub')` and `KZ.mountFooter()`.
- **Audio Feedback**: Utilizes `KZAudio` synthesized audio (`KZAudio.playOk()`, `KZAudio.playWrong()`, etc.).
- **Confetti**: Calls `KZ.confetti()` upon high scores and quiz completion.

### Customization Guide
- **Adding 5-Digit Challenges**: Increase max digit input in `index.html` and update the upper limit clamp in `add-sub.js`.
- **Number Line Range**: Visual number line display threshold is set in `add-sub.js` (`a + b <= 20`); this can be adjusted for wider visual scales.
