
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CyberGames from '../pages/CyberGames';

describe('CyberGames', () => {
  it('renders the page', () => {
    render(<CyberGames />);
    expect(screen.getByText('Cyber Games')).toBeInTheDocument();
  });
});