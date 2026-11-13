# Type Rush

A polished, responsive typing-speed tester built with React and Vite. Type a short passage in a 60-second sprint and track your typing speed, accuracy, and progress in real time.

## Features

- 60-second countdown starts with your first keystroke.
- Live words-per-minute (WPM), accuracy, and passage progress.
- Character-by-character feedback for correct and incorrect typing.
- Multiple passages and a one-click restart.
- Personal-best score for the current browser session.
- Responsive layout with a glass-inspired visual design.
- Reduced-motion support and keyboard-accessible controls.

## Getting started

### Requirements

- Node.js 20.19+ or 22.12+
- npm

### Install and run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite to use the app.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run ESLint. |

## How to play

1. Start typing the displayed passage to begin the timer.
2. Match the passage as accurately as you can; correct and incorrect characters are highlighted as you type.
3. Follow your live WPM, accuracy, and progress.
4. Finish the passage or use **New passage** to start a fresh sprint.

The personal best is kept in React state for the current session; scores are not persisted between page reloads.

## Project structure

```text
src/
  App.jsx       Typing-test UI and interaction logic
  App.css       Component styles and responsive layout
  index.css     Global styles and typography
  main.jsx      React application entry point
```

## Technology

- React
- Vite
- Plain CSS

Typography uses DM Sans and DM Mono from Google Fonts when a network connection is available, with system-font fallbacks.
