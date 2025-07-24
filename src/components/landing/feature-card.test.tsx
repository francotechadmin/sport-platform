import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FeatureCard } from './feature-card';
import { User } from 'lucide-react';

describe('FeatureCard', () => {
  const defaultProps = {
    icon: User,
    title: 'Test Feature',
    description: 'This is a test feature description',
  };

  it('renders with icon, title, and description', () => {
    render(<FeatureCard {...defaultProps} />);
    
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
    expect(screen.getByText('This is a test feature description')).toBeInTheDocument();
  });

  it('applies highlight styling when highlight prop is true', () => {
    render(<FeatureCard {...defaultProps} highlight={true} />);
    
    const card = screen.getByText('Test Feature').closest('[class*="border-primary"]');
    expect(card).toBeInTheDocument();
  });

  it('has touch-friendly interactions', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const card = screen.getByText('Test Feature').closest('[class*="touch-manipulation"]');
    expect(card).toBeInTheDocument();
  });

  it('has hover and active states for better UX', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const card = screen.getByText('Test Feature').closest('[class*="hover:shadow-lg"]');
    expect(card).toBeInTheDocument();
    
    const activeCard = screen.getByText('Test Feature').closest('[class*="active:scale"]');
    expect(activeCard).toBeInTheDocument();
  });
});