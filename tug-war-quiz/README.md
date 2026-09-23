# Seesaw Battle Quiz Arena ⚖️🧒👧

A head-to-head educational Seesaw Battle game designed for Kids Zone. Two teams compete on a playground seesaw by answering quiz questions from science, space, nature, geography, riddles, or custom teacher/parent-uploaded CSV quizzes! The seesaw dynamically tilts up and down based on each team's score.

## 🌟 Game Highlights

- **⚖️ Seesaw Dynamic Physics:** An authentic playground seesaw with a fulcrum stand, tilting plank, rider handles, and cheer jumps. Answering questions correctly tips your side of the seesaw down!
- **⚔️ Dual Battle Modes:**
  - **Side-by-Side Dual (Race Mode):** Both teams race simultaneously on screen. Fast, competitive showdown with dual keyboards (`1-4` / `A-D` for Team 1, `7-0` / `J-;` for Team 2) and touch controls!
  - **Pass & Play Turns:** Alternating turns. One team answers to tilt the seesaw, then passes to the other team.
- **🔢 Smart Question Count Selection:**
  - Dynamic descending question count dropdown based on available quiz questions:
    - *Example (19 questions available):*
      - `18 questions (9/team)`
      - `16 questions (8/team)`
      - `14 questions (7/team)`
      - `12 questions (6/team)`
      - `10 questions (5/team)`
- **Even Question Distribution:** Randomizes questions from the chosen quiz pack and divides them evenly between Team 1 and Team 2 (`Total / 2` questions per team).
- **Kid-Safe No-Negative Scoring:** Incorrect answers buzz and shake with instant visual feedback, but never deduct points. Players can rethink or choose to Skip.
- **No Automatic Skip on Wrong Answers:** When an incorrect answer is picked, it buzzes and remains on screen so kids can try again or deliberately press "Skip Question".
- **Match Review & Answer Breakdown:** Shows both teams' complete question log, what was selected, and the verified correct answer.
- **Custom Quiz Upload (CSV):** Parents, teachers, and kids can upload their own custom quizzes with custom titles and multiple-choice answers.

## 📄 CSV Format for Custom Quizzes

When uploading a custom quiz, use the following CSV columns:

```csv
Question,Option 1,Option 2,Option 3,Option 4,Correct Option (1-4 or Answer Text)
What planet is closest to the Sun?,Venus,Mercury,Mars,Jupiter,2
How many legs does an octopus have?,6,8,10,12,8
What is the largest mammal on Earth?,African Elephant,Blue Whale,Giraffe,Hippopotamus,Blue Whale
Which gas do plants release for us to breathe?,Carbon Dioxide,Nitrogen,Oxygen,Helium,3
```

You can upload a `.csv` file directly or paste CSV text in the game setup screen.

## 🎮 How to Win

1. **Perfect Sweep:** If a team answers all of their assigned questions correctly first, they win immediately!
2. **End of Turns:** When both teams complete their questions, whichever team answered more correctly (tilting the seesaw in their favor) wins the match! If tied, an honorable draw is declared.
