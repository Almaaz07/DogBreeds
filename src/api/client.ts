import { Breed, BreedGroup } from '../types';
import { isBreed, isBreedGroup } from '../utils/typeGuards';

const BASE_URL = 'https://dogapi.dog/api/v2';
const DEFAULT_TIMEOUT_MS = 10000;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 600;

interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
}

export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, retries = MAX_RETRIES } = options;

  let attempt = 0;
  let lastError: Error | null = null;

  while (attempt <= retries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const rawData: unknown = await response.json();
      return rawData as T;
    } catch (err) {
      clearTimeout(timer);
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === retries) {
        break;
      }

      const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      await new Promise<void>(resolve => setTimeout(() => resolve(), backoffTime));
      attempt += 1;
    }
  }

  throw lastError ?? new Error(`Failed to fetch from ${url}`);
}

interface PaginatedApiResponse<T> {
  data: T[];
  meta?: {
    pagination?: {
      current?: number;
      next?: number;
      last?: number;
      records?: number;
    };
  };
  links?: {
    next?: string;
    last?: string;
  };
}

export interface BreedsPageResult {
  breeds: Breed[];
  currentPage: number;
  lastPage: number;
  totalRecords: number;
}

export async function fetchBreedsPage(pageNumber: number = 1): Promise<BreedsPageResult> {
  const response = await fetchWithRetry<PaginatedApiResponse<unknown>>(
    `${BASE_URL}/breeds?page[number]=${pageNumber}`
  );

  const breeds: Breed[] = [];
  if (Array.isArray(response.data)) {
    for (const item of response.data) {
      if (isBreed(item)) {
        breeds.push(item);
      }
    }
  }

  const pagination = response.meta?.pagination;
  const currentPage = pagination?.current ?? pageNumber;
  const lastPage = pagination?.last ?? 1;
  const totalRecords = pagination?.records ?? breeds.length;

  return {
    breeds,
    currentPage,
    lastPage,
    totalRecords,
  };
}

export async function fetchBreedGroups(): Promise<BreedGroup[]> {
  const response = await fetchWithRetry<PaginatedApiResponse<unknown>>(
    `${BASE_URL}/groups`
  );

  const groups: BreedGroup[] = [];
  if (Array.isArray(response.data)) {
    for (const item of response.data) {
      if (isBreedGroup(item)) {
        groups.push(item);
      }
    }
  }

  return groups;
}

export async function fetchBreedById(id: string): Promise<Breed> {
  const response = await fetchWithRetry<{ data: unknown }>(
    `${BASE_URL}/breeds/${id}`
  );

  if (isBreed(response.data)) {
    return response.data;
  }

  throw new Error(`Invalid breed payload received for id: ${id}`);
}
