# Development Environment

This document describes the development environment setup for the Grammar Anatomy App frontend.

## Prerequisites

- Node.js 18+ 
- npm 9+
- Git

## Development Tools

### Code Quality

- **ESLint v8**: JavaScript/TypeScript linting with React and TypeScript support
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks
- **lint-staged**: Run linters on staged files

### Available Scripts

```bash
# Development
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests

# Code Quality
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint with auto-fix
npm run format     # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check # Run TypeScript type checking

# Git Hooks
# Pre-commit hook automatically runs lint-staged
```

### Git Hooks

The project uses Husky to manage Git hooks:

- **pre-commit**: Automatically runs lint-staged to check code quality before commits
- **lint-staged**: Runs ESLint and Prettier on staged files

### Configuration Files

- `.eslintrc.js`: ESLint configuration with TypeScript and React rules
- `.prettierrc`: Prettier formatting rules
- `tsconfig.json`: TypeScript configuration
- `tailwind.config.js`: Tailwind CSS configuration

### IDE Setup

#### VS Code Extensions (Recommended)

- ESLint
- Prettier - Code formatter
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

#### VS Code Settings

Add to your `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Code Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define proper types for props, state, and functions
- Avoid `any` type - use proper typing
- Use interfaces for object shapes
- Use enums for constants

### React

- Use functional components with hooks
- Use TypeScript for prop validation
- Follow React naming conventions
- Use proper event handling types

### CSS/Styling

- Use Tailwind CSS for styling
- Follow utility-first approach
- Use CSS modules for component-specific styles if needed
- Maintain consistent spacing and color usage

### File Organization

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── contexts/      # React contexts
└── data/          # Static data and constants
```

## Troubleshooting

### ESLint Issues

If you encounter ESLint configuration issues:

1. Check that all dependencies are installed: `npm install`
2. Verify ESLint version compatibility: `npm list eslint`
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Prettier Issues

If Prettier isn't formatting correctly:

1. Check Prettier configuration in `.prettierrc`
2. Ensure Prettier extension is installed in your IDE
3. Verify no conflicting formatters are active

### TypeScript Issues

If TypeScript shows errors:

1. Run `npm run type-check` to see all type errors
2. Check `tsconfig.json` configuration
3. Ensure all dependencies have proper type definitions

## Contributing

1. Create a feature branch from `main`
2. Make your changes following the code style guidelines
3. Run `npm run lint` and `npm run type-check` before committing
4. The pre-commit hook will automatically check code quality
5. Create a pull request with a clear description of changes 