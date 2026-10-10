import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../../App';

jest.mock('../api/client', () => ({
  fetchAllBreeds: jest.fn(() => Promise.resolve([])),
  fetchBreedGroups: jest.fn(() => Promise.resolve([])),
  fetchBreedById: jest.fn(() => Promise.resolve({})),
  fetchWithRetry: jest.fn(() => Promise.resolve({})),
}));

describe('App Root', () => {
  it('renders without crashing', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(<App />);
      await Promise.resolve();
    });
    expect(renderer).toBeDefined();
  });
});
