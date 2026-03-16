# 🧠 Memory Trail

**Memory Trail** is a single‑file, kid‑friendly game where learners practice **working memory** by matching pairs of **numbers** or **symbols** under a **global countdown**. It follows the Kids Zone “Trail” UX—**Practice/Test vibe**, streaks, badges, print‑ready summary, offline‑first—and now includes **themes in the header** plus a **High contrast** toggle for accessibility.

---

## ✨ Highlights

- **Sets:** Numbers, Symbols, or **Mixed** (both pools)  
- **Difficulties:** **Easy / Medium / Hard** (flip‑back speed, time penalty, and score tuned per mode)  
- **Levels:** Up to **5**; Level 1 starts at **8 cards** then **12, 16, 20, 24**  
- **Timer:** Global countdown (**120s** default; editable); optional **1‑second peek** at the start of each level  
- **Themes (Header):** Jungle, Ocean, Space, Candy, Mono — live palette swap  
- **High contrast:** Overrides colors for maximum readability (works over any theme)  
- **Progress:** Streaks, badges, local best/last; printable end summary  
- **Offline:** One HTML file, no tracking, no sign‑ins

---

## 🚀 Getting Started

1. Open the folder: `memory/`
2. Double‑click **`memory-trail.html`** to launch.  
3. In the **header**, set **Theme**, toggle **Sound/High contrast**, then on the setup choose **Set**, **Difficulty**, **Timer**, and options.  
4. Click **START TRAIL** and begin matching pairs.

> Works offline in Chrome, Edge, Firefox, and Safari.

---

## 🎮 How to Play

- Each level deals an **even number of tiles** (pairs). Flip **two** tiles:
  - **Match** → both stay open, **score increases**, streak goes up
  - **Mismatch** → both flip back after a short delay; on Medium/Hard the **global timer** is reduced
- Clear all pairs to **advance to the next level**. There are up to **5** levels.
- Use **👀 Peek** for a quick 1‑second look at all tiles (if enabled).

---

## 🧩 Difficulty Tuning

| Mode   | Flip‑back delay | Time penalty (per miss) | Score per match |
|:------:|:----------------|:------------------------|:----------------|
| Easy   | 850 ms          | 0 s                     | 10              |
| Medium | 700 ms          | 2 s                     | 12              |
| Hard   | 550 ms          | 5 s                     | 15              |

**Streak bonus:** consecutive matches add a small ramp (+1 extra per additional match in the streak).

---

## 🎨 Themes & Accessibility

- **Theme selector (Header):** Jungle (default), Ocean, Space, Candy, Mono — instantly updates **colors**, **borders**, and **tile faces**.
- **High contrast:** Adds a dedicated palette override across backgrounds, text, and tile fronts/backs for visibility.
- **Keyboard/Mouse:** Click tiles to flip. UI buttons are large and touch‑friendly.

---

## ⏱️ Timer & Scoring

- A **single global timer** counts down across all levels (default **120s**).  
- **Medium/Hard** apply a **time penalty** for each mismatch.  
- Final screen shows **Score**, **Time left**, **Badges**, and a **Level Summary** (timestamped matches/misses).

---

## 🛡️ Kids‑Safe & Privacy‑First

- **No ads**, **no analytics**, **no accounts**  
- Runs **offline**; only optional web fonts/effects if online  
- Saves progress **locally** (`localStorage`) and provides a **Reset Progress** button

---

## 👤 Author & Links

- **Author:** Kashyap Makadia  
- **LinkedIn:** https://www.linkedin.com/in/kashyapmakadia/  
- **GitHub Repo:** https://github.com/KashyapMak/kids-zone

---

## 📄 License

Released under the **MIT License**.

---

## 🗂️ Suggested Folder Layout

```text
kids-zone/
│
├── memory/
│   ├── memory-trail.html
│   └── README.md        ← (this file)
│
└── ... other games ...
```
