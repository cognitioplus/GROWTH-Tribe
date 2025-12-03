# Project Summary
The GROWTH Tribe project is a Progressive Web App (PWA) designed to foster a supportive community focused on personal growth, resilience, and well-being. It features a community forum where users can share experiences, post content, and interact with others, earning "Growth Points" for their engagement. These points can be converted into real monetary value, incentivizing participation and enhancing personal development. The application boasts a personalized user dashboard, improved navigation, and a visually appealing design to ensure an engaging user experience.

# Project Module Description
- **User Authentication**: Secure login and registration using Supabase, with enhanced error handling.
- **Community Forum**: Full CRUD functionality for posts and comments.
- **Reaction System**: Users can react to posts and comments using emojis.
- **Growth Points System**: Users earn points for engagement, tracked and rewarded in real-time.
- **Social Media Sharing**: Share posts directly to various platforms.
- **User Profiles**: Manage personal profiles and view engagement statistics.
- **Responsive Design**: Optimized for both mobile and desktop devices.
- **Integrated Header**: Displays user information and Growth Points.

# Directory Tree
```
shadcn-ui/
├── README.md               # Project overview and instructions
├── components.json         # Configuration for components
├── eslint.config.js        # ESLint configuration for code quality
├── index.html              # Main HTML file for the PWA
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration for styles
├── public/                 # Static assets
│   ├── favicon.svg         # Favicon for the app
│   ├── manifest.json       # PWA manifest file
│   ├── robots.txt          # Robots.txt for SEO
│   └── sw.js               # Service worker for offline capabilities
├── src/                    # Source files for the application
│   ├── App.css             # Global styles
│   ├── App.tsx             # Main application component
│   ├── components/         # UI components
│   ├── contexts/           # Context API for state management
│   ├── hooks/              # Custom hooks
│   ├── lib/                # Utility functions and Supabase client
│   ├── pages/              # Page components
│   ├── index.css           # Entry CSS file
│   └── main.tsx            # Entry point for the application
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── .env                    # Environment variables for Supabase
└── vite.config.ts          # Vite configuration for the build tool
```

# File Description Inventory
- **index.html**: The entry point for the application, includes PWA meta tags.
- **public/manifest.json**: Defines the PWA settings and icons.
- **public/sw.js**: Service worker for enabling offline functionality.
- **src/App.tsx**: Main component that manages routing and application layout.
- **src/components/**: Contains reusable UI components like buttons, cards, and forms.
- **src/contexts/AuthContext.tsx**: Manages authentication state and user sessions with improved error handling.
- **src/lib/supabase.ts**: Configures the Supabase client for database interactions and defines data types.
- **src/pages/**: Contains components for different pages in the application, including the updated `MainApp.tsx` with personalized features.
- **.env**: Contains environment variables for Supabase configuration.

# Technology Stack
- **React**: Frontend library for building user interfaces.
- **TypeScript**: Superset of JavaScript for type safety.
- **Vite**: Build tool for fast development and production builds.
- **Supabase**: Backend as a service for database and authentication.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **date-fns**: Library for date manipulation.
- **@tanstack/react-query**: Data-fetching library for managing server state.

# Usage
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Build the application:
   ```bash
   pnpm run build
   ```
3. Lint the code:
   ```bash
   pnpm run lint
   ```
4. Run the application (development server):
   ```bash
   pnpm run dev
   ```
