# 🧮 Abacus Trail

An interactive, animated vertical abacus (Soroban style) designed to help kids visualize numbers and understand the mechanics of addition and subtraction. Part of the **Kids Zone** educational suite.

## 🚀 Features

- **Three Learning Modes**:
  - **Show Number**: Instant visualization of any number up to 9,999,999,999.
  - **Add Numbers**: Step-by-step animated addition showing the transition from initial value to sum.
  - **Subtract Numbers**: Visual subtraction logic with state transitions.
- **Authentic Abacus Logic**:
  - **Heaven Beads**: 1 bead per column, valued at 5 (slides down to activate).
  - **Earth Beads**: 4 beads per column, valued at 1 each (slide up to activate).
- **Customization & Accessibility**:
  - 6 Vibrant themes (Jungle, Space, Candy, etc.).
  - High Contrast mode for better visibility.
  - Audio feedback for interactions.
  - Responsive design for tablets and desktops.

## 🕹️ How to Use

1.  **Select a Trail**: Choose between "Show Number", "Add", or "Subtract".
2.  **Input Values**: Enter your numbers in the provided fields.
3.  **Start the Trail**: Click **"Let's Go! 🚀"** or press **Enter**.
4.  **Observe**: Watch the beads move! 
    - The top bead moves down to add 5.
    - The bottom beads move up to add 1, 2, 3, or 4.
5.  **Place Values**: Use the labels above the rods (Billions to Ones) to understand large number structures.

## 🛠️ Technical Details

- **Animation**: Uses CSS transitions with `cubic-bezier` timing to simulate the "snap" of physical abacus beads.
- **Logic Engine**: 
  - A 10-column system mapping to a 10-digit integer.
  - Dynamic class toggling handles bead stacking and "active" states.
- **Audio**: Web Audio API generates real-time oscillators for the "tick" and "success" sounds.
- **Graphics**: Lightweight SVG icons and pure CSS-drawn abacus frame/beads (no external images).

## 📂 Project Structure

```text
kids-zone/
│
├── abacus/
│   ├── abacus-trail.html
│   └── README.md        ← (this file)
│
└── ... other games ...
```