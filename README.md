# SportAI Chat

A platform for athletes and sports enthusiasts.

[![Website](https://img.shields.io/website?label=Visit%20Website&style=for-the-badge&url=https%3A%2F%2Fsport-platform.vercel.app%2F)](https://sport-platform.vercel.app/)
[![Documentation](https://img.shields.io/badge/Explore%20Code-View%20Code-blue?style=for-the-badge)](https://github.com/francotechadmin/sport-platform)

## Overview

[![SportAI Chat](/public/app-sc.png)](https://sport-platform.vercel.app/)

Sport AI is an application designed specifically for athletes and sports enthusiasts, providing personalized training advice, performance insights, and sports-related information.

## Features

- Real-time AI chat with GPT-4o and other models
- Responsive design for desktop and mobile devices
- Dark/light theme support
- Markdown rendering for rich text responses
- Smooth message scrolling and animations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: Custom components with Tailwind CSS
- **AI Integration**: AI SDK for React
- **Styling**: Tailwind CSS with typography plugin
- **Fonts**: Geist Sans and Geist Mono

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/sportai-chat.git
   cd sportai-chat
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - Reusable UI components
  - `/ui` - Basic UI components
  - `/layout` - Layout components like header
- `/public` - Static assets

## Deployment

This application can be deployed on Vercel, Netlify, or any other platform that supports Next.js.
