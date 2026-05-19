import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CyberGames from '../pages/CyberGames';

describe('CyberGames', () => {
  it('renders the page', () => {
    render(
      <MemoryRouter>
        <CyberGames />
      </MemoryRouter>
    );
    expect(screen.getByText('CyberGames Arena')).toBeInTheDocument();
  });
});