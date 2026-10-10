import { Breed, BreedGroup, DogImage } from '../types';

export function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

export function isBreed(data: unknown): data is Breed {
  if (!isObject(data)) return false;
  if (data.type !== 'breed' || typeof data.id !== 'string') return false;
  if (!isObject(data.attributes)) return false;
  return typeof data.attributes.name === 'string';
}

export function isBreedGroup(data: unknown): data is BreedGroup {
  if (!isObject(data)) return false;
  if (data.type !== 'group' || typeof data.id !== 'string') return false;
  if (!isObject(data.attributes)) return false;
  return typeof data.attributes.name === 'string';
}

export function isDogImage(data: unknown): data is DogImage {
  if (!isObject(data)) return false;
  return typeof data.id === 'string' && typeof data.url === 'string';
}
