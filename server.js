import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Friendly route aliases for all 11 activities
const games = [
  {
    id: 'time-table',
    title: 'Times Table Trail',
    subtitle: 'Multiplication Practice',
    category: 'Math & Arithmetic',
    icon: '🧮',
    color: '#059669',
    badge: 'Ages 6-12',
    description: 'Master multiplication tables 1–30 with custom ranges, practice & timed test modes, visual arrays, streaks, and badges.',
    path: '/time-table/index.html',
    readme: '/time-table/README.md'
  },
  {
    id: 'add-sub',
    title: 'Add & Sub Trail',
    subtitle: 'Addition & Subtraction',
    category: 'Math & Arithmetic',
    icon: '➕➖',
    color: '#2563eb',
    badge: 'Ages 5-11',
    description: 'Custom difficulty addition and subtraction with 1–4 digits, plus optional "No carry / No borrow / No negatives" modes.',
    path: '/add-sub/index.html',
    readme: '/add-sub/README.md'
  },
  {
    id: 'deci-frac',
    title: 'Deci-Frac Trail',
    subtitle: 'Decimals & Fractions',
    category: 'Math & Arithmetic',
    icon: '➗➕',
    color: '#7c3aed',
    badge: 'Ages 8-13',
    description: 'Decimal and fraction addition & subtraction with vertical layouts, stacked fraction visuals, and practice/test modes.',
    path: '/deci-frac/index.html',
    readme: '/deci-frac/README.md'
  },
  {
    id: 'perimeter',
    title: 'Perimeter Trail',
    subtitle: 'Geometry & Shapes',
    category: 'Geometry',
    icon: '📐',
    color: '#0ea5e9',
    badge: 'Ages 7-12',
    description: 'Interactive geometry practice with dynamic shapes (square, rectangle, triangle, pentagon), side labels, and formula hints.',
    path: '/perimeter/index.html',
    readme: '/perimeter/README.md'
  },
  {
    id: 'compare-number',
    title: 'Number Nature Trail',
    subtitle: 'Comparison Practice',
    category: 'Number Sense',
    icon: '⚖️',
    color: '#f59e0b',
    badge: 'Ages 6-11',
    description: 'Compare whole numbers, decimals, and stacked fractions by picking <, =, or > with instant visual feedback.',
    path: '/compare-number/index.html',
    readme: '/compare-number/README.md'
  },
  {
    id: 'order-number',
    title: 'Number Order Trail',
    subtitle: 'Ascending & Descending',
    category: 'Number Sense',
    icon: '🔢',
    color: '#10b981',
    badge: 'Ages 6-11',
    description: 'Arrange 3–5 number cards in ascending or descending sequence across mixed whole numbers, decimals, and fractions.',
    path: '/order-number/index.html',
    readme: '/order-number/README.md'
  },
  {
    id: 'memory',
    title: 'Memory Trail',
    subtitle: 'Brain & Focus Match',
    category: 'Brain & Memory',
    icon: '🧠',
    color: '#ec4899',
    badge: 'All Ages',
    description: 'Fun card matching game with numbers, symbols, mixed sets, adjustable grid difficulty, themes, and global timers.',
    path: '/memory/index.html',
    readme: '/memory/README.md'
  },
  {
    id: 'equation-architect',
    title: 'Equation Architect',
    subtitle: 'Math Equation Puzzle',
    category: 'Logic & Puzzles',
    icon: '🏗️',
    color: '#d97706',
    badge: 'Ages 7-12',
    description: 'Build valid mathematical equations using number and operator tiles to reach the target number. Guaranteed solvable!',
    path: '/equation-architect/index.html',
    readme: '/equation-architect/README.md'
  },
  {
    id: 'klotski',
    title: 'KLOTSKI Trail',
    subtitle: 'Classic Sliding Tile Puzzle',
    category: 'Logic & Puzzles',
    icon: '🧩',
    color: '#c49a3c',
    badge: 'Ages 6-99',
    description: 'Classic wooden sliding tile puzzle. Arrange all tiles 1 to N in order with the empty space at bottom-right.',
    path: '/klotski/index.html',
    readme: '/klotski/README.md'
  },
  {
    id: 'abacus',
    title: 'Abacus Trail',
    subtitle: 'Interactive Place Value',
    category: 'Math & Arithmetic',
    icon: '🧮',
    color: '#059669',
    badge: 'Ages 5-11',
    description: 'Master the vertical abacus with smooth animated bead physics, exploring place value from units to ten thousands.',
    path: '/abacus/index.html',
    readme: '/abacus/README.md'
  },
  {
    id: 'magic-sort',
    title: 'Magic Sort',
    subtitle: 'Color Liquid Sorting Puzzle',
    category: 'Logic & Puzzles',
    icon: '🧪',
    color: '#6366f1',
    badge: 'All Ages',
    description: 'Sort colorful potions across test tubes until each tube holds only one color. Relaxing and engaging brain teaser.',
    path: '/magic-sort/index.html',
    readme: '/magic-sort/README.md'
  }
];

// Provide API endpoint
app.get('/api/games', (req, res) => {
  res.json(games);
});

// Route for Progress Dashboard
app.get(['/progress', '/progress/'], (req, res) => {
  res.sendFile(path.join(__dirname, 'progress.html'));
});

// Configure route shortcuts so /time-table or /time-table/ opens index.html
for (const game of games) {
  app.get([`/${game.id}`, `/${game.id}/`], (req, res) => {
    res.sendFile(path.join(__dirname, game.path));
  });
}

// Serve all static files from root
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Route fallback: deliver index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Kids Zone server running on http://${HOST}:${PORT}`);
});
