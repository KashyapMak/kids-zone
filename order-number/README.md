# 🔢 Number Order Trail

An interactive card sequencing game where learners arrange numbers and fractions in ascending or descending order.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Number Order Trail develops sequencing skills and a deep understanding of relative numbers. Learners sort 3 to 5 cards from left to right, handling a mix of integers, decimals, and stacked fractions. It supports both mouse drag-and-drop on desktop and simple tap-to-place interactions on mobile devices and tablets.

### Supported Number Types
- **Whole Numbers**: Natural numbers (e.g., `4`, `12`, `19`).
- **Decimals**: Values with 1 or 2 decimal places (e.g., `0.4`, `1.25`, `3.8`).
- **Simple Fractions**: Denominators from 2 to 5 (e.g., `1/3`, `2/5`, `3/4`).
- **Complex Fractions**: Denominators from 6 to 20 (e.g., `5/8`, `7/12`).

### How to Play
1. **Choose Number Types**: Select any mix of Whole Numbers, Decimals, Simple Fractions, and Complex Fractions.
2. **Set Direction & Length**:
   - **Direction**: **Ascending ⬆️** (Smallest to Largest), **Descending ⬇️** (Largest to Smallest), or **Mixed 🔀** (changes randomly each round).
   - **Cards Per Round**: 3 cards (beginner), 4 cards (intermediate), or 5 cards (advanced challenge).
3. **Move Cards Into Slots**:
   - **On Desktop**: Drag any card from the deck and drop it into a target slot. You can also drag cards between slots to swap them.
   - **On Touchscreens / Mobile**: Tap a card to highlight it, then tap an empty slot (or an existing card) to place or swap.
4. **Submit & Review**: Click **Check Order**. If correct, you will earn points and streak bonuses! If incorrect, the app reveals the true sequence so you can learn from mistakes.

### Keyboard Shortcuts
- `Enter` or `C`: Check current card order
- `N`: Next question (Test mode)
- `S`: Skip question
- `R`: Reset current cards back to tray

### Tips for Parents & Educators
- For younger kids, start with **3 Cards**, **Whole Numbers**, and **Ascending** order.
- To build advanced fraction intuition, select only **Simple & Complex Fractions**; this teaches kids to compare fractions with different denominators by finding equivalent benchmarks like `1/2`.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
order-number/
├── index.html                 # Clean setup form, card trays, and target slots
├── order-number.css           # Styling for draggable cards, active slot rings, and drop zones
├── order-number.js            # Drag/touch interaction engine, sort comparator, and validation
├── number-order-trail.html    # Backward-compatible redirect for legacy URLs
└── README.md                  # This documentation
```

### Drag & Drop / Tap Interaction Architecture
`order-number.js` implements a dual-input model supporting both HTML5 Drag & Drop and mobile touch events:
- **Card State Machine**:
  Each card holds metadata `{ id, rawValue, text, html }`.
  Slots array tracks assigned card IDs: `slots = [cardId1, cardId2, ...]`.
- **Drag & Drop Handlers**:
  - `dragstart`: Stores card ID in `e.dataTransfer.setData('text/plain', cardId)`.
  - `dragover`: Prevents default to allow dropping and applies `.drag-over` highlighting.
  - `drop`: Reads incoming ID, handles slot vacancy, and executes swap if slot is already occupied.
- **Touch / Click Fallback**:
  - Clicking an unassigned card sets `selectedCardId`.
  - Clicking a slot moves or swaps `selectedCardId` into that slot without requiring native touch-drag support.
- **Validation Engine**:
  ```js
  function checkOrder(placedCards, direction) {
    for (let i = 0; i < placedCards.length - 1; i++) {
      const a = placedCards[i].rawValue;
      const b = placedCards[i + 1].rawValue;
      if (direction === 'asc' && a > b) return false;
      if (direction === 'desc' && a < b) return false;
    }
    return true;
  }
  ```

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('order-number')` and `KZ.mountFooter()`.
- **Sound Effects**: Powered by `KZAudio` synthesized sound singleton.
- **Confetti**: Calls `KZ.confetti()` when a full quiz round is completed successfully.

### Customization Guide
- **Adding 6-Card Mode**: Adjust the card count selector in `index.html` and update CSS flex-wrap limits in `order-number.css`.
- **Card Color Styles**: Card styles inherit color schemes from `common/common.css`. Modify `.order-card` classes to customize borders and elevation shadows.
