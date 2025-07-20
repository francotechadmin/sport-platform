# Design Document

## Overview

This design implements a simplified navigation structure that prioritizes the chat functionality as the primary user interface while maintaining access to analytics and providing clear visual indicators for undeveloped features. The solution involves modifying the existing Next.js routing, updating navigation components, and implementing visual states for different feature maturity levels.

## Architecture

### Current State Analysis
- **Routing**: Next.js App Router with route groups `(auth)` and `(dashboard)`
- **Layout Structure**: Shared `DashboardLayout` with `Sidebar` and `TopNav` components
- **Authentication**: Hash-based auth with route guards protecting dashboard routes
- **Navigation**: Sidebar-based navigation with mobile responsive design

### Proposed Changes
- **Primary Route Redirect**: Modify root dashboard redirect to point to `/chat` instead of `/dashboard`
- **Navigation Hierarchy**: Restructure sidebar to prioritize Chat and Analytics as primary features
- **Visual States**: Implement disabled/grayed-out states for undeveloped features
- **URL Structure**: Maintain clean URLs while ensuring proper redirects

## Components and Interfaces

### 1. Route Configuration Updates

#### Modified Root Page Component
```typescript
// src/app/page.tsx
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/chat'); // Changed from '/dashboard'
      } else {
        router.push('/signin');
      }
    }
  }, [isAuthenticated, isLoading, router]);
}
```

#### Dashboard Route Redirect
```typescript
// src/app/(dashboard)/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/chat');
  }, [router]);
  
  return null;
}
```

### 2. Navigation Component Updates

#### Enhanced Sidebar Component
```typescript
interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType;
  isActive: boolean;
  isDisabled: boolean;
  tooltip?: string;
}

const navigationItems: NavigationItem[] = [
  {
    href: '/chat',
    label: 'Chat',
    icon: MessageSquareIcon,
    isActive: true,
    isDisabled: false
  },
  {
    href: '/analytics',
    label: 'Analytics', 
    icon: AnalyticsIcon,
    isActive: true,
    isDisabled: false
  },
  {
    href: '/performance',
    label: 'Performance',
    icon: PerformanceIcon,
    isActive: false,
    isDisabled: true,
    tooltip: 'Coming Soon'
  },
  {
    href: '/locker-room',
    label: 'Locker Room',
    icon: LockerRoomIcon,
    isActive: false,
    isDisabled: true,
    tooltip: 'Coming Soon'
  }
];
```

#### Navigation Item Styling
```typescript
const getNavigationItemClasses = (item: NavigationItem, isCurrentPath: boolean) => {
  const baseClasses = "flex items-center px-3 py-2 rounded-lg transition-all duration-200";
  
  if (item.isDisabled) {
    return `${baseClasses} opacity-50 cursor-not-allowed text-muted-foreground`;
  }
  
  if (isCurrentPath) {
    return `${baseClasses} bg-primary/90 text-primary-foreground shadow-sm`;
  }
  
  return `${baseClasses} hover:bg-muted/70`;
};
```

### 3. Tooltip Implementation

#### Disabled Item Tooltip
```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const NavigationItem = ({ item, isCurrentPath }: NavigationItemProps) => {
  const content = (
    <Link
      href={item.isDisabled ? '#' : item.href}
      className={getNavigationItemClasses(item, isCurrentPath)}
      onClick={item.isDisabled ? (e) => e.preventDefault() : undefined}
    >
      <item.icon className="h-5 w-5 mr-3" />
      {item.label}
    </Link>
  );

  if (item.isDisabled && item.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
};
```

## Data Models

### Navigation Configuration
```typescript
interface NavigationConfig {
  primaryItems: NavigationItem[];
  secondaryItems: NavigationItem[];
  defaultRoute: string;
  redirects: Record<string, string>;
}

interface NavigationItem {
  id: string;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isDisabled: boolean;
  tooltip?: string;
  badge?: {
    count: number;
    variant: 'primary' | 'secondary';
  };
}
```

### Route Configuration
```typescript
interface RouteConfig {
  path: string;
  redirect?: string;
  requiresAuth: boolean;
  component: React.ComponentType;
}

const routeConfig: RouteConfig[] = [
  {
    path: '/',
    redirect: '/chat',
    requiresAuth: true,
    component: HomePage
  },
  {
    path: '/dashboard',
    redirect: '/chat',
    requiresAuth: true,
    component: DashboardRedirect
  }
];
```

## Error Handling

### Navigation Error States
1. **Disabled Route Access**: Prevent navigation to disabled routes with user feedback
2. **Redirect Loops**: Implement safeguards against infinite redirects
3. **Authentication Failures**: Graceful handling of auth state changes during navigation

### Implementation
```typescript
const handleNavigationClick = (item: NavigationItem, e: React.MouseEvent) => {
  if (item.isDisabled) {
    e.preventDefault();
    // Optional: Show toast notification
    toast.info(item.tooltip || 'This feature is coming soon');
    return;
  }
  
  // Normal navigation continues
};
```

## Testing Strategy

### Unit Tests
1. **Navigation Component Tests**
   - Verify correct rendering of active/disabled states
   - Test click handlers for disabled items
   - Validate tooltip display logic

2. **Route Configuration Tests**
   - Test redirect logic for root and dashboard routes
   - Verify authentication requirements are maintained
   - Test URL structure preservation

### Integration Tests
1. **Navigation Flow Tests**
   - Test complete user journey from login to chat
   - Verify backward compatibility with existing bookmarks
   - Test mobile navigation behavior

2. **Authentication Integration**
   - Test navigation behavior with different auth states
   - Verify route guards still function correctly

### Visual Regression Tests
1. **Navigation States**
   - Active navigation item styling
   - Disabled item appearance
   - Tooltip positioning and content

2. **Responsive Design**
   - Mobile sidebar behavior
   - Desktop navigation layout
   - Transition animations

## Implementation Phases

### Phase 1: Core Routing Changes
- Update root page redirect logic
- Implement dashboard route redirect
- Test basic navigation flow

### Phase 2: Navigation UI Updates
- Update sidebar component with new item states
- Implement disabled styling and tooltips
- Update mobile navigation behavior

### Phase 3: Polish and Testing
- Add transition animations
- Implement comprehensive testing
- Performance optimization

## Migration Considerations

### Backward Compatibility
- Existing `/dashboard` URLs will redirect to `/chat`
- Bookmarks and direct links remain functional
- No breaking changes to authentication flow

### User Experience
- Clear visual indicators for feature availability
- Smooth transitions between navigation states
- Consistent behavior across devices

### Performance Impact
- Minimal performance overhead from additional redirect logic
- Tooltip components loaded on-demand
- Navigation state calculations optimized for re-renders