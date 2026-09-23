# 🧮 Times Table Trail

A kid-friendly, interactive multiplication learning game designed to build math fluency through play.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Times Table Trail helps elementary and middle school learners master multiplication facts from 1 to 30. It provides an encouraging, stress-free environment that builds both conceptual understanding (via visual dot arrays) and automatic recall (via timed challenges).

### How to Play
1. **Choose Table Range**: Select a preset range from the dropdown (e.g., 1–5, 1–10, 11–15, up to 26–30), or choose **Custom Range** to specify exact starting/ending tables and total question count (5–50).
2. **Select Game Mode**:
   - **Practice Mode**: Untimed and low-pressure. Kids can retry questions until they find the correct answer, building mastery at their own pace.
   - **Test Mode (Timed)**: Choose between:
     - *Per-Question Timer*: A fast countdown for each question (e.g., 10 seconds).
     - *Total Quiz Timer*: A single countdown for the entire session (e.g., 3 minutes).
3. **Optional Learning Scaffolds**:
   - **Show Visual Arrays**: Renders interactive dot arrays for smaller factors to help visualize products as rows and columns.
   - **Voice Read-Aloud (🗣️)**: Reads the question aloud using speech synthesis.
   - **Audio Effects (🔊)**: Provides cheerful sound feedback on correct and incorrect selections.
4. **Answer Questions**: Pick the correct answer from the horizontal choice buttons or use the number keys on your keyboard.
5. **Review & Print**: At the conclusion of a trail, view total score, completion time, streak badges, and a full question-by-question breakdown. Click **Print** to generate a clean worksheet or physical progress report.

### Keyboard Shortcuts
- `1` to `6`: Select answer option 1 through 6
- `Enter` or `N`: Advance to next question (Test mode)
- `S`: Skip current question
- `R`: Read question aloud

### Tips for Parents & Teachers
- Start younger learners in **Practice Mode** with **Visual Arrays** enabled for tables 1–5.
- Transition to **Test Mode** with a relaxed per-question timer (12–15 seconds) once accuracy exceeds 80%.
- Use the **Printable Summary** at the end of sessions as proof of daily practice or homework checks.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
time-table/
├── index.html                 # Main clean HTML entry point (mounts common header/footer)
├── time-table.css             # Scoped game styling, array grids, and quiz cards
├── time-table.js              # Complete game logic, problem generator, and state engine
├── times-table-trail.html     # Client-side forwarder for legacy links & bookmarks
└── README.md                  # This documentation
```

### Core Architecture & State Management
- **Configuration Object (`cfg`)**:
  ```js
  const cfg = {
    start: 1, end: 10, total: 15,
    mode: 'practice',            // 'practice' | 'test'
    timeboxType: 'per-question', // 'per-question' | 'total'
    perQSeconds: 10,
    totalSeconds: 180,
    showArrays: true,
    shuffleOptions: true,
    factorMax: 12
  };
  ```
- **Question Generation & Smart Distractors**:
  - The problem generator selects factors within `[cfg.start, cfg.end]` multiplied by `[1, cfg.factorMax]`.
  - Distractor generation avoids generic random numbers. Instead, it generates plausible distractors based on:
    - Nearby products (`a * (b ± 1)`)
    - Transposed digits or reversed operations
    - Multiples of either factor to test true recall
- **Timer Subsystem**:
  - `startPerQTimer()` runs an interval ticking every second, triggering timeout when reaching zero.
  - `startTotalTimer()` maintains a global countdown across the full quiz sequence.
- **Local Storage Schema**:
  - Key format: `tt_best_${preset}_${mode}_${timeboxType}`
  - Value: `{ bestScore, bestTime, lastScore, lastTime, timestamp }`

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('time-table')` and `KZ.mountFooter()`.
- **Sound Effects**: Uses `KZAudio.playOk()`, `KZAudio.playWrong()`, `KZAudio.playTick()`, and `KZAudio.playFanfare()`.
- **Celebration**: Triggers `KZ.confetti()` upon quiz completion and high streaks.

### Customization Guide
- **Adjusting Upper Multiplier Limit**: Modify `cfg.factorMax` in `time-table.js` (default is 12).
- **Adding Preset Ranges**: Add `<option>` elements in `index.html` within `#preset-select` and ensure `applyPreset()` parses the start/end bounds accordingly.
- **Styling Changes**: Game layout variables are scoped to `time-table.css` and inherit CSS tokens (`--primary`, `--accent`, `--card`, `--radius`) from `../common/common.css`.
