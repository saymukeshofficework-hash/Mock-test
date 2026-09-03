import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';

describe('App Component Render', () => {
  it('renders App without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });
});
