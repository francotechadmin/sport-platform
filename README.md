# ProFormAi Chat

A platform for athletes and sports enthusiasts powered by AI.

[![Website](https://img.shields.io/website?label=Visit%20Website&style=for-the-badge&url=https%3A%2F%2Fproformai.vercel.app%2F)](https://proformai.vercel.app/)
[![Documentation](https://img.shields.io/badge/Explore%20Code-View%20Code-blue?style=for-the-badge)](https://github.com/francotechadmin/proformai)

## Overview

[![ProFormAi Chat](/public/app-sc.jpg)](https://proformai.vercel.app/)

ProForm Ai is an intelligent application designed specifically for athletes and sports enthusiasts, providing personalized training advice, performance insights, and sports-related information through advanced AI conversation.

## Features

- **AI-Powered Coaching**: Real-time AI chat with GPT-4o and other models for personalized training advice
- **Performance Analysis**: Get insights on your training routines and techniques
- **Sports Knowledge Base**: Access to wide-ranging sports information and best practices
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Accessibility**: Dark/light theme support for comfortable viewing in any environment
- **Rich Content**: Markdown rendering for structured, easy-to-read responses
- **Smooth UX**: Message scrolling and animations for a polished experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: Custom components with Tailwind CSS
- **AI Integration**: AI SDK for React
- **Styling**: Tailwind CSS with typography plugin
- **Fonts**: Geist Sans and Geist Mono
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/francotechadmin/sport-platform.git
   cd sport-platform
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file with your API keys:

   ```bash
   OPENAI_API_KEY=your_openai_api_key
   OPEN_AI_MODEL=your_openai_model # Optional, defaults to gpt-4o
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

## Contributing

We welcome contributions to ProFormAi Chat! Please check out our [Contributing Guide](CONTRIBUTING.md) for guidelines about how to proceed.

## Roadmap

- [x] Initial release with GPT-4o integration
- [x] Dark/light theme support
- [ ] User authentication and profile management
- [ ] Saved conversations history
- [ ] Custom training program generation
- [ ] Integration with fitness tracking APIs
- [ ] Mobile app version

## Troubleshooting and FAQ

### Common Issues

- **API Key Issues**: If you're experiencing authentication errors, verify your OpenAI API key in the `.env.local` file.
- **Model Availability**: Make sure you have access to the specified OpenAI model in your account.

## Contact

Have questions or suggestions? Reach out to us:

- GitHub Issues: [Submit an issue](https://github.com/francotechadmin/sport-platform/issues)
