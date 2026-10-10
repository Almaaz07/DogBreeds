import { fetchBreedById, fetchBreedsPage, fetchWithRetry } from '../api/client';

describe('API Client', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('fetches breed detail by id successfully', async () => {
    const mockBreed = {
      data: {
        id: '123',
        type: 'breed',
        attributes: {
          name: 'Poodle',
          description: 'Intelligent water dog',
        },
      },
    };

    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockBreed),
      } as Response)
    );

    const result = await fetchBreedById('123');
    expect(result.id).toBe('123');
    expect(result.attributes.name).toBe('Poodle');
  });

  it('fetches paginated breeds page successfully', async () => {
    const mockPage = {
      data: [
        {
          id: 'b-1',
          type: 'breed',
          attributes: { name: 'Beagle' },
        },
      ],
      meta: {
        pagination: {
          current: 1,
          last: 6,
          records: 283,
        },
      },
    };

    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPage),
      } as Response)
    );

    const result = await fetchBreedsPage(1);
    expect(result.breeds).toHaveLength(1);
    expect(result.currentPage).toBe(1);
    expect(result.lastPage).toBe(6);
  });

  it('retries with exponential backoff on transient errors', async () => {
    let callCount = 0;
    globalThis.fetch = jest.fn(() => {
      callCount += 1;
      if (callCount === 1) {
        return Promise.reject(new Error('Network drop'));
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      } as Response);
    });

    const result = await fetchWithRetry<{ success: boolean }>(
      'https://example.com/test',
      { retries: 2, timeoutMs: 1000 }
    );

    expect(result.success).toBe(true);
    expect(callCount).toBe(2);
  });
});
