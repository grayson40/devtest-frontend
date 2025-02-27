# DevTest

A developer-focused test management platform that streamlines test automation, execution, and integration with your development workflow.

## Overview

DevTest helps development teams:
- Manage and organize automated test cases
- Create test sequences for complex workflows
- Integrate with Jira for requirement traceability
- Monitor test execution in real-time
- Import tests directly from Scribe recordings

## Stack

- Next.js 14 with TypeScript
- Chakra UI for components
- TanStack Query for data management
- Framer Motion for animations

## Quick Start

```bash
# Clone repository
git clone https://github.com/grayson40/devtest-frontend
cd devtest-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

## Configuration

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Available Scripts

```bash
npm run dev     # Development mode
npm run build   # Production build
npm run start   # Production server
npm run lint    # Code linting
```

## Structure

```
src/
├── app/        # Next.js pages and routing
├── components/ # Reusable UI components
├── api/        # API integrations
└── types/      # TypeScript definitions
```

## Documentation

For more information about the technologies used:
- [Next.js](https://nextjs.org/docs)
- [Chakra UI](https://chakra-ui.com/docs)
- [TanStack Query](https://tanstack.com/query)

