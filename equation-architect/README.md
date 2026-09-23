# 🏗️ Equation Architect

A reverse-math logic puzzle where learners construct valid mathematical equations from number and operator blocks to hit a target number.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Equation Architect turns traditional arithmetic worksheets upside down. Instead of being handed an equation and asked for the answer, learners are given a **Target Number** and a collection of number and operator blocks. By combining all blocks into a valid equation, children develop algebraic reasoning, inverse thinking, and mental math fluency.

### Difficulty Tiers
| Tier | Recommended Age | Operations Allowed | Number Blocks | Target Range |
| :--- | :---: | :---: | :---: | :---: |
| **Apprentice** | Ages 6–8 | `+` , `−` | 3 numbers | 10 – 25 |
| **Builder** | Ages 9–10 | `+` , `−` , `×` | 4 numbers | 20 – 60 |
| **Master** | Ages 11–12 | `+` , `−` , `×` , `÷` | 5 numbers | 30 – 100 |

### How to Play
1. **Choose Your Tier**: Select Apprentice, Builder, or Master on the setup screen.
2. **Observe Your Target**: Look at the large target result displayed in the Blueprint header.
3. **Build the Blueprint**:
   - Tap an available **Number Block** to place it in the equation.
   - Tap an **Operator Block** (`+`, `−`, `×`, `÷`) to connect your numbers.
   - The blocks must alternate: Number → Operator → Number → Operator → Number.
   - You must use **every single number block** provided in your tray.
4. **Live Calculation Preview**: As you place blocks, the **Live Result** box calculates the current running total in real time, letting you test hypotheses immediately.
5. **Clear or Undo**: Tap any placed block to remove it, or click **Clear Blueprint** to start fresh.
6. **Submit or Skip**: When your equation equals the target, click **Submit Blueprint** to celebrate! If a puzzle is too challenging, click **Skip** to see the correct solution.

### Linear Chain Math Rule
To make mental calculations intuitive and accessible for elementary children, equations evaluate **strictly left-to-right** (chain math) without confusing order-of-operation brackets:
- Example: `3 + 4 × 2` evaluates as `(3 + 4) = 7`, then `7 × 2 = 14`.

### Tips for Parents & Educators
- Encourage learners to work backwards: "If my target is 24, what number multiplied by something gives 24, or what number plus 4 gives 24?"
- Every single puzzle generated has at least one guaranteed whole-number solution.

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
equation-architect/
├── index.html                 # Clean setup and construction blueprint markup
├── equation-architect.css     # Styles for number blocks, operator tokens, and live preview
├── equation-architect.js      # Solvable puzzle generator, linear math evaluator, and game flow
├── equation-architect.html    # Backward-compatible redirect for legacy URLs
├── readme.md                  # Synced lowercase documentation
└── README.md                  # This documentation
```

### Guaranteed Solvability Generator
In `equation-architect.js`, puzzles are generated forward to guarantee integer solutions:
1. **Forward Construction**:
   - Randomly picks `N` numbers within the tier's range.
   - Randomly picks `N - 1` valid operators.
   - For division (`÷`), checks that the accumulator divided by the next number yields an integer without remainder (`acc % next === 0`). If not, substitutes with addition or multiplication.
2. **Target Computation**:
   - Evaluates the expression left-to-right to establish the `targetValue`.
3. **Player Shuffle**:
   - The original number list is randomly shuffled before presenting to the player, while the target and available operator set are locked.

### Linear Evaluator Engine
```js
function evalChain(tokens) {
  if (tokens.length === 0) return 0;
  let acc = tokens[0].value;
  for (let i = 1; i < tokens.length; i += 2) {
    const op = tokens[i].value;
    const next = tokens[i + 1]?.value;
    if (next === undefined) break;
    if (op === '+') acc += next;
    else if (op === '-') acc -= next;
    else if (op === '*') acc *= next;
    else if (op === '/') acc = next !== 0 ? acc / next : NaN;
  }
  return acc;
}
```

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('equation-architect')` and `KZ.mountFooter()`.
- **Sound Effects**: Integrates with `KZAudio` for tile clicks, blueprint completion fanfare, and error alerts.
- **Theming**: Block aesthetics and drop target highlights seamlessly adapt to all 6 Kids Zone color themes.

### Customization Guide
- **Adding Custom Tiers**: Add a new tier configuration object to `TIERS` in `equation-architect.js` defining `numCount`, `ops`, and `targetMin`/`targetMax`.
- **Enabling Standard PEMDAS**: Replace `evalChain()` with an Abstract Syntax Tree (AST) or shunting-yard evaluator if standard mathematical order of operations is preferred.
