# Keyboard PDF Visualizer

A fast, keyboard-first PDF viewer desktop application built with Electron, React, Tailwind CSS, and PDF.js.

## Features

- **Directory Loading:** Quickly open a local directory and see a gallery of all PDF files inside.
- **Keyboard-Driven Navigation:** Designed to be used without a mouse.
- **Continuous Reading:** Smoothly move between pages with continuous scroll offsets.
- **Fast Rendering:** Canvas-based rendering via PDF.js for crisp performance.

## Keyboard Shortcuts

- `Arrow Keys (↑ ↓ ← →)`: Pan the document up, down, left, and right.
- `Ctrl + ↑`: Go to the previous page (starts at the bottom of the previous page for continuous reading).
- `Ctrl + ↓`: Go to the next page.
- `Space`: Go to the next page.
- `Ctrl + =` / `Ctrl + +`: Zoom in.
- `Ctrl + -`: Zoom out.
- `Alt + →`: Open the next PDF in the current directory.
- `Alt + ←`: Open the previous PDF in the current directory.
- `Esc`: Return to the gallery.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Project Setup

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
# For windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```
