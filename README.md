# Invoice Generator

A dynamic invoice generator built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Create and preview invoices
- Save buyer details locally and auto-suggest on input
- Print invoice preview as PDF (using `react-to-print`)
- Responsive and modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0 recommended)
- npm

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view in your browser.

### Build

```sh
npm run build
```

### Lint

```sh
npm run lint
```

### Print Invoice

- Fill out the invoice form.
- Click **Preview Invoice**.
- Click **Print Invoice** to print or save as PDF.

## Project Structure

```
invoice-generator/
├── public/
│   └── image.png
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── vite-env.d.ts
│   └── assets/
│       └── react.svg
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig*.json
├── eslint.config.js
└── README.md
```

## Dependencies

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-to-print](https://github.com/gregnb/react-to-print)
- [ESLint](https://eslint.org/)
