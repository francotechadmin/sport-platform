import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeaturesSection } from './features-section';

describe('FeaturesSection', () => {
  it('renders the section title and description', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Everything you need to succeed')).toBeInTheDocument();
    expect(screen.getByText(/Discover the powerful features/)).toBeInTheDocument();
  });

  it('renders all feature cards', () => {
    render(<FeaturesSection />);
    
    expect(screen.getByText('Personalized AI Coaching')).toBeInTheDocument();
    expect(screen.getByText('Real-time Progress Tracking')).toBeInTheDocument();
    expect(screen.getByText('24/7 Availability')).toBeInTheDocument();
    expect(screen.getByText('Adaptive Learning')).toBeInTheDocument();
  });

  it('has responsive grid layout', () => {
    render(<FeaturesSection />);
    
    const gridContainer = screen.getByText('Personalized AI Coaching').closest('[class*="grid"]')?.parentElement;
    expect(gridContainer).toHaveClass('grid');
    expect(gridContainer).toHaveClass('grid-cols-1');
    expect(gridContainer).toHaveClass('sm:grid-cols-2');
    expect(gridContainer).toHaveClass('lg:grid-cols-4');
  });

  it('has proper spacing for mobile and desktop', () => {
    render(<FeaturesSection />);
    
    const gridContainer = screen.getByText('Personalized AI Coaching').closest('[class*="grid"]')?.parentElement;
    expect(gridContainer).toHaveClass('gap-6');
    expect(gridContainer).toHaveClass('sm:gap-8');
  });
});