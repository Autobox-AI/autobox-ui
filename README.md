# Autobox UI

A sophisticated Next.js 15 application for managing multi-agent AI simulations. This frontend provides real-time monitoring, visualization, and control over complex AI agent orchestrations.

## 🚀 Quick Start

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

The application runs on port 8888 by default.

## 📋 Prerequisites

- Node.js 18+ 
- Yarn (modern version with PnP support)
- Running instance of autobox-api backend

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React + Radix UI icons
- **Validation**: Zod schemas
- **Performance**: Built-in monitoring and optimization

### Project Structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API route handlers
│   ├── organizations/     # Organization pages
│   ├── projects/          # Project management
│   └── simulations/       # Simulation control
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Domain-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and services
├── schemas/              # Zod validation schemas
├── styles/               # Global CSS and Tailwind config
└── types/                # TypeScript definitions
```

### Core Features

#### Data Hierarchy
```
Organizations
  └── Projects
      └── Simulations
          └── Runs
              ├── Agents
              ├── Traces
              └── Metrics
```

#### Real-time Monitoring
- Live simulation status updates via polling
- Request deduplication for performance
- Automatic retry with exponential backoff
- WebSocket-ready architecture

#### Performance Optimizations
- **Virtual Scrolling**: Large dataset handling
- **Lazy Loading**: On-demand component loading
- **Image Optimization**: Custom OptimizedImage component
- **Bundle Splitting**: Intelligent code splitting
- **HTTP Caching**: Smart cache headers and revalidation

## 🛠️ Development

### Available Scripts

```bash
# Core Development
yarn dev          # Start dev server with hot reload
yarn build        # Build production bundle
yarn start        # Run production server
yarn lint         # Run ESLint checks

# Performance Analysis
yarn analyze      # Bundle size analyzer
yarn perf:audit   # Complete performance audit
yarn lighthouse   # Lighthouse performance metrics
yarn perf:test    # Custom performance tests

# Tools
yarn code:prompt  # Run code merger utility
```

### Environment Variables

Create a `.env.local` file:

```env
API_URL=http://localhost:3000    # Backend API URL
ORG_ID=default-org               # Default organization ID
```

### API Routes

The application provides internal API routes that proxy to the backend:

- `/api/organizations/` - Organization management
- `/api/projects/` - Project CRUD operations  
- `/api/simulations/` - Simulation lifecycle
- `/api/runs/` - Run monitoring and control
- `/api/templates/metrics/` - Metric templates

## 🎨 UI Components

### shadcn/ui Integration

The project uses shadcn/ui for consistent, accessible components:

- **Location**: `/src/components/ui/`
- **Configuration**: `components.json`
- **Theming**: CSS variables with Tailwind
- **Customization**: All components are editable

### Available Components

- **Forms**: Input, Select, Checkbox, RadioGroup
- **Feedback**: Toast, Alert, Badge
- **Overlay**: Dialog, Sheet, Popover
- **Navigation**: Tabs, NavigationMenu
- **Display**: Card, Table, Avatar
- **Actions**: Button, DropdownMenu

## 🔄 State Management

### Patterns

- **Server Components**: Data fetching at component level
- **Custom Hooks**: Encapsulated state logic
- **Polling**: Real-time updates via `useRunPolling`
- **Error Boundaries**: Graceful error handling

### Key Hooks

- `useRunPolling` - Real-time run status updates
- `useSimulation` - Simulation state management
- `useMetrics` - Performance metrics tracking

## 📊 Performance Monitoring

### Built-in Tools

- Console timing for critical operations
- Custom performance hooks
- Lighthouse CI integration
- Bundle analyzer reports

### Optimization Strategies

1. **Code Splitting**: Dynamic imports for heavy components
2. **Memoization**: React.memo for expensive renders
3. **Virtualization**: Large list optimization
4. **Prefetching**: Strategic data preloading
5. **Caching**: HTTP and component-level caching

## 🧪 Testing

```bash
# Run all tests (when implemented)
yarn test

# Run performance tests
yarn perf:test

# Lighthouse audit
yarn lighthouse
```

## 🚢 Deployment

### Build Process

```bash
# 1. Install dependencies
yarn install

# 2. Build the application
yarn build

# 3. Start production server
yarn start
```

### Production Considerations

- Set appropriate environment variables
- Configure reverse proxy (nginx/Apache)
- Enable HTTPS with SSL certificates
- Set up monitoring and logging
- Configure CDN for static assets

### Docker Support

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 8888
CMD ["yarn", "start"]
```

## 🔧 Configuration

### TypeScript

- Strict mode enabled
- Path aliases: `@/*` → `./src/*`
- Module resolution: Bundler mode

### Tailwind CSS

- Dark theme default
- Custom color palette
- System font stack
- Responsive breakpoints

### Next.js

- App Router enabled
- Server Components default
- Image optimization
- Font optimization

## 📚 Related Projects

- **autobox-api** - Backend API server
- **autobox-mocks** - Mock data generator
- **autobox-mocks-api** - Mock API endpoints

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- ESLint configuration enforced
- Prettier formatting
- TypeScript strict mode
- Component naming conventions

## 📄 License

[License Type] - See LICENSE file for details

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Create new issue with reproduction steps
- Contact development team

## 🔗 Links

- [Documentation](docs-link)
- [API Reference](api-docs-link)
- [Component Storybook](storybook-link)
- [Performance Dashboard](metrics-link)
