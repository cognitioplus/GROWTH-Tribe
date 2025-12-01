GROWTH Tribe

A dynamic Progressive Web App (PWA) designed as a "Support, Knowledge, and Practice Hub" for personal growth.

Core Features

Community Hub: Users can post updates, thoughts, images, and engage with others via likes and comments.

Gamification System:

Growth Points (GP): Earned through engagement (Posting = 10GP, Liking = 1GP).

Wallet: Converts GP to PHP (100 GP = 1 PHP).

Badges: Unlocked at specific point thresholds (Seedling, Sprout, Bloom, Harmony).

User Profiles: Tracks points, badges, and personal settings.

Tech Stack

Frontend: React (Single File Component structure).

Styling: Tailwind CSS + Inline Styles for specific Fonts/Themes.

Backend: Firebase (Auth & Firestore).

Icons: Lucide-React.

Deployment Notes

The app uses firebase/firestore with specific path rules to ensure data isolation and security in the demo environment.

Public data (posts, profiles) is stored in /artifacts/{appId}/public/data.

Complex queries (orderBy) are handled client-side to adhere to Firestore index limitations in this environment.
