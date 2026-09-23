# 📐 Perimeter Trail

An interactive geometry exploration game that challenges learners to calculate the perimeters of 2D shapes with dynamic canvas drawings.

---

## 👤 For End Users (Kids, Parents & Educators)

### Overview & Educational Value
Perimeter Trail helps students master the geometric concept of perimeter — the total distance around the outside of a 2D shape. Rather than relying purely on static textbook diagrams, every shape is dynamically rendered with labeled side lengths and clear formula aids.

### Supported Shapes & Formulas
- **Square**: `Perimeter = 4 × side`
- **Rectangle**: `Perimeter = 2 × (Length + Width)`
- **Equilateral Triangle**: `Perimeter = 3 × side`
- **Regular Pentagon**: `Perimeter = 5 × side`

### How to Play
1. **Choose Shapes**: Check any combination of Square, Rectangle, Triangle, or Pentagon.
2. **Select Difficulty**:
   - **1-digit dimensions**: Side lengths between 1 cm and 9 cm (ideal for mental arithmetic).
   - **2-digit dimensions**: Side lengths between 10 cm and 30 cm (encourages multi-digit addition).
3. **Optional Formula Hints**: Toggle the hint display to view the shape's formula beneath the active problem.
4. **Choose Mode**:
   - **Practice Mode**: Untimed, friendly practice where learners can retry until they find the correct answer.
   - **Test Mode**: Timed assessment with per-question or total-time countdowns.
5. **Answer & Print**: Select the correct perimeter in centimeters. At the end, inspect your badges, accuracy streak, and print the report.

### Keyboard Shortcuts
- `1` to `6`: Select answer option
- `Enter` or `N`: Next question (Test mode)
- `S`: Skip question
- `R`: Read problem aloud

### Tips for Parents & Educators
- Remind students of the real-world definition of perimeter: "walking all the way around the outside fence."
- Highlight the common trap in rectangles: forgetting to add both lengths and both widths (adding only 2 sides instead of 4).

---

## 🛠️ For Editors & Developers

### Directory & File Structure
```text
perimeter/
├── index.html                 # Clean setup and quiz markup with Canvas element
├── perimeter.css              # Styling for shape canvas, formula hint boxes, and buttons
├── perimeter.js               # Canvas polygon drawing routines, math engine, and quiz flow
├── perimeter-trail.html       # Backward-compatible forwarder
└── README.md                  # This documentation
```

### Canvas Rendering Pipeline
In `perimeter.js`, shapes are drawn dynamically inside an HTML5 `<canvas>` element:
- **Geometry Coordinates**:
  - `drawSquare(ctx, s)`: Centered rectangle with equal width and height.
  - `drawRectangle(ctx, w, h)`: Aspect ratio preserved with labeled width and height.
  - `drawTriangle(ctx, s)`: Equilateral triangle using trigonometric vertices (`cos(θ)`, `sin(θ)`).
  - `drawPentagon(ctx, s)`: 5-vertex regular polygon calculated via 72-degree increments (`2π / 5`).
- **Side Dimension Placement**:
  - Labels are positioned with offset math along the outer normal vectors of each edge to prevent text clipping.
- **Smart Distractor Generation**:
  Plausible incorrect options test specific conceptual misunderstandings:
  - Area instead of perimeter (e.g., `L × W` for rectangles or `s × s` for squares).
  - Half-perimeter error (`L + W` instead of `2(L + W)`).
  - Adding wrong number of sides (e.g., 4 sides for pentagon instead of 5).

### Common Engine Integration
- **Header & Footer**: Auto-mounted via `KZ.mountHeader('perimeter')` and `KZ.mountFooter()`.
- **Sound & Confetti**: Integrates with `KZAudio` sound synthesis and `KZ.confetti()`.
- **Theme Variables**: Canvas colors and UI cards inherit CSS variables (`--primary`, `--accent`) defined in `../common/common.css`.

### Customization Guide
- **Adding Regular Hexagons**: Add a `'hexagon'` option to `cfg.shapes`, write a `drawHexagon()` routine using 60-degree vertex increments (`2π / 6`), and define its formula as `6 × side`.
- **Custom Units**: Replace `'cm'` with `'m'`, `'inches'`, or `'units'` in the label generation logic inside `perimeter.js`.
