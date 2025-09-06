# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `yarn dev` - Start development server on port 8888
- `yarn build` - Build production application
- `yarn start` - Start production server on port 8888
- `yarn lint` - Run ESLint for code quality checks

### Analysis & Performance
- `yarn analyze` - Build with bundle analyzer enabled
- `yarn build:analyze` - Alias for analyze command
- `yarn perf:audit` - Run complete performance audit (build + start + lighthouse)
- `yarn perf:test` - Run performance tests using scripts/performance-test.js
- `yarn lighthouse` - Run Lighthouse analysis on running server

### Development Tools
- `yarn code:prompt` - Run code merger tool (ts-node ./bin/codeMerger.ts)

## Architecture Overview

This is a Next.js 15 application for Autobox, a simulation management platform. The application follows a modern React architecture with TypeScript, Tailwind CSS, and shadcn/ui components.

### Key Directory Structure

- `/src/app/` - Next.js App Router pages and API routes
- `/src/components/` - Reusable React components
- `/src/hooks/` - Custom React hooks for state management and side effects
- `/src/schemas/` - Zod schemas for data validation
- `/src/lib/` - Utility functions and services
- `/src/types/` - TypeScript type definitions
- `/src/styles/` - Global CSS and Tailwind configuration

### Core Entities

The application manages three main entities:
1. **Organizations** - Top-level organizational structure
2. **Projects** - Containers for simulations within organizations
3. **Simulations** - Individual simulation instances with runs and metrics

### API Structure

API routes follow REST conventions under `/src/app/api/`:
- `/api/organizations/` - Organization management
- `/api/projects/` - Project CRUD operations
- `/api/simulations/` - Simulation management
- `/api/runs/` - Simulation run lifecycle
- `/api/templates/metrics/` - Metric template management

### Performance Optimizations

The application includes several performance-focused features:
- **Polling System**: `useRunPolling` hook with request deduplication for real-time updates
- **Optimized Images**: Custom `OptimizedImage` component with lazy loading
- **Virtualization**: `VirtualizedList` for large datasets
- **Bundle Splitting**: Custom webpack configuration for optimal code splitting
- **Caching**: HTTP caching headers and revalidation strategies

### Component Architecture

- **UI Components**: shadcn/ui components built on Radix UI primitives in `/src/components/ui/`
- **Domain Components**: Business logic components in `/src/components/`
- **Form Handling**: Zod schemas for validation with form components
- **State Management**: React hooks pattern, no external state management library

### UI Library (shadcn/ui)

The project uses shadcn/ui, a component library built on top of Radix UI primitives. Key aspects:
- **Component Location**: All shadcn/ui components are in `/src/components/ui/`
- **Styling**: Uses Tailwind CSS with CSS variables for theming
- **Customization**: Components are copied into the project and can be freely modified
- **Configuration**: `components.json` contains shadcn/ui configuration
- **Available Components**: Includes button, card, dialog, dropdown-menu, input, select, table, toast, and many more

### Styling

- **CSS Framework**: Tailwind CSS with custom configuration
- **Theme**: Dark theme as default with system font stack
- **Component Styling**: Class-based styling with `clsx` for conditional classes
- **Icons**: Lucide React icons and Radix UI icons
- **shadcn/ui Integration**: Uses CSS variables and Tailwind classes for consistent theming

### TypeScript Configuration

- **Strict Mode**: Enabled with `noImplicitAny: true`
- **Path Aliases**: `@/*` maps to `./src/*`
- **Module Resolution**: Bundler mode for Next.js compatibility

### Development Notes

- Uses Yarn as package manager (modern Yarn with PnP support)
- Environment variables: `API_URL` and `ORG_ID` for backend configuration
- Development server runs on port 8888 (both dev and production)
- PWA capabilities with service worker registration
- Performance monitoring with console timing and custom hooks

### Key Patterns

1. **Server Components**: Extensive use of Next.js server components for data fetching
2. **Error Boundaries**: Proper error handling with try-catch patterns
3. **Loading States**: Dedicated loading pages and components
4. **Real-time Updates**: Polling-based updates for simulation runs
5. **Performance Monitoring**: Built-in timing and performance measurement

## Code Style Guidelines

### Comments and Documentation

1. **Avoid Redundant Comments**: 
   - Don't add comments that simply restate what the code does
   - Remove obvious comments like `// Import React` or `// Define interface`
   - Don't comment closing braces like `} // end if`

2. **Write Self-Documenting Code**:
   - Use descriptive variable and function names that explain their purpose
   - Prefer clear, readable code over comments
   - Extract complex logic into well-named functions

3. **When Comments Are Valuable**:
   - Explain WHY something is done, not WHAT is being done
   - Document complex business logic or algorithms
   - Add warnings about non-obvious behavior or gotchas
   - Include references to external documentation or requirements

4. **Examples**:
   ```typescript
   // ❌ Bad: Redundant comment
   // Increment counter by 1
   counter++;
   
   // ❌ Bad: Obvious comment
   // Check if user is logged in
   if (user.isLoggedIn) {
   
   // ✅ Good: Explains why
   // We need to delay by 100ms to avoid race condition with animation
   setTimeout(() => updateUI(), 100);
   
   // ✅ Good: Documents business logic
   // Price threshold based on Q4 2024 market analysis
   const PREMIUM_THRESHOLD = 150;
   ```

5. **Function Documentation**:
   - Only add JSDoc comments for complex functions with non-obvious behavior
   - Avoid documenting simple getters, setters, or straightforward functions
   - Focus on documenting edge cases, side effects, and complex return values