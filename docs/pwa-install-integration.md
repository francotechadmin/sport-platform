# PWA Install Integration Guide

This guide explains how PWA installation prompts are integrated into your authentication flow and other strategic moments in your app.

## Overview

The PWA install prompt is automatically managed by the `PWAManager` component and will show up:

1. **Automatically**: 3 seconds after the `beforeinstallprompt` event is fired (if not dismissed recently)
2. **After Authentication**: Automatically triggered 2 seconds after successful sign-in or sign-up
3. **After User Engagement**: Based on user interaction metrics using the `usePWAInstall` hook
4. **Manually**: By calling the `showInstallPrompt` function from the PWA context

## Basic Usage

### 1. Automatic Install Prompt

The install prompt will automatically appear for eligible users after a short delay. The PWAManager handles this automatically.

```tsx
import { PWAManager } from '@/components/pwa/pwa-manager';

function App() {
  return (
    <PWAManager>
      {/* Your app content */}
    </PWAManager>
  );
}
```

### 2. Post-Authentication Install Prompt

The install prompt is automatically triggered after successful authentication. No additional code is required - the PWAManager handles this automatically when users sign in or sign up.

```tsx
// No additional code needed! 
// The PWAManager automatically shows the install prompt 2 seconds after authentication

function AuthenticatedApp({ user }) {
  return (
    <div>
      {/* Your authenticated app content */}
      {/* Install prompt will automatically appear after sign-in */}
    </div>
  );
}
```

### 3. Manual Install Prompt Trigger

Use the `usePWA` hook to manually trigger the install prompt:

```tsx
import { usePWA } from '@/components/pwa/pwa-manager';

function WelcomeScreen() {
  const { showInstallPrompt, canInstall } = usePWA();

  const handleGetStarted = () => {
    // Show install prompt when user clicks "Get Started"
    if (canInstall()) {
      showInstallPrompt();
    }
  };

  return (
    <button onClick={handleGetStarted}>
      Get Started
    </button>
  );
}
```

### 4. Engagement-Based Install Prompt

Trigger the install prompt based on user engagement metrics:

```tsx
import { useEngagementBasedInstall } from '@/hooks/usePWAInstall';

function Dashboard({ userEngagementScore }) {
  // Show install prompt when user engagement reaches threshold
  useEngagementBasedInstall(userEngagementScore, 3);

  return (
    <div>
      {/* Dashboard content */}
    </div>
  );
}
```

## Advanced Usage

### Custom Install Prompt Timing

```tsx
import { usePWAInstall } from '@/hooks/usePWAInstall';

function CustomComponent() {
  const { triggerInstallAfterAuth, triggerInstallAfterEngagement } = usePWAInstall();

  useEffect(() => {
    // Custom logic for when to show install prompt
    const timer = setTimeout(() => {
      triggerInstallAfterEngagement();
    }, 10000); // Show after 10 seconds of engagement

    return () => clearTimeout(timer);
  }, []);

  return <div>Content</div>;
}
```

### Checking Install Availability

```tsx
import { usePWA } from '@/components/pwa/pwa-manager';

function InstallButton() {
  const { isInstallable, isIOS, isStandalone, promptInstall } = usePWA();

  if (isStandalone) {
    return <div>App is already installed!</div>;
  }

  if (!isInstallable && !isIOS) {
    return null; // Don't show install option
  }

  return (
    <button onClick={promptInstall}>
      {isIOS ? 'Get Install Instructions' : 'Install App'}
    </button>
  );
}
```

## Install Prompt Features

### For Android/Desktop (Chrome, Edge, etc.)
- Native browser install prompt
- One-click installation
- Automatic app icon creation

### For iOS (Safari)
- Step-by-step installation instructions
- Visual guide for "Add to Home Screen"
- Modal with clear instructions

### Smart Timing
- Respects user dismissals (7-day cooldown)
- Doesn't show if already installed
- Appears at strategic moments (post-auth, engagement)

## Best Practices

1. **Don't be too aggressive**: The system automatically respects user dismissals
2. **Time it right**: Show after users have engaged with your app
3. **Provide value**: Explain the benefits of installing (offline access, faster loading)
4. **Test on different devices**: iOS and Android have different installation flows

## Troubleshooting

### Install Prompt Not Showing

1. **Check PWA criteria**: Ensure your app meets PWA installation requirements
2. **Verify manifest**: Check that `site.webmanifest` is properly configured
3. **Service worker**: Ensure the service worker is registered and active
4. **HTTPS**: PWA installation requires HTTPS (or localhost for development)
5. **User dismissal**: Check if user has dismissed the prompt recently

### Testing Install Functionality

```tsx
// In development, you can force show the install prompt
import { usePWA } from '@/components/pwa/pwa-manager';

function DevTools() {
  const { showInstallPrompt } = usePWA();

  return (
    <button onClick={showInstallPrompt}>
      Force Show Install Prompt (Dev Only)
    </button>
  );
}
```

## Integration Examples

### Sign-in Page Integration

```tsx
import { usePostAuthInstall } from '@/hooks/usePWAInstall';

function SignInPage() {
  const [user, setUser] = useState(null);
  
  // Trigger install prompt after successful sign-in
  usePostAuthInstall(!!user);

  const handleSignIn = async (credentials) => {
    const user = await signIn(credentials);
    setUser(user);
    // Install prompt will automatically show after 2 seconds
  };

  return (
    <form onSubmit={handleSignIn}>
      {/* Sign-in form */}
    </form>
  );
}
```

### Dashboard Integration

```tsx
import { usePWAInstall } from '@/hooks/usePWAInstall';

function Dashboard() {
  const { canInstall, showInstallPrompt } = usePWAInstall();

  return (
    <div>
      <h1>Welcome to ProFormAi</h1>
      
      {canInstall() && (
        <div className="install-banner">
          <p>Get the full app experience!</p>
          <button onClick={showInstallPrompt}>
            Install App
          </button>
        </div>
      )}
      
      {/* Dashboard content */}
    </div>
  );
}
```

This integration ensures that users are prompted to install the PWA at the most appropriate moments, improving adoption rates while respecting user preferences.