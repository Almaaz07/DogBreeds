import { isBreed, isBreedGroup, isDogImage } from '../utils/typeGuards';

describe('typeGuards', () => {
  it('identifies valid Breed objects', () => {
    const valid = {
      id: '123',
      type: 'breed',
      attributes: {
        name: 'Beagle',
      },
    };
    expect(isBreed(valid)).toBe(true);
    expect(isBreed(null)).toBe(false);
    expect(isBreed({})).toBe(false);
    expect(isBreed({ type: 'group' })).toBe(false);
  });

  it('identifies valid BreedGroup objects', () => {
    const group = {
      id: 'g1',
      type: 'group',
      attributes: {
        name: 'Hound Group',
      },
    };
    expect(isBreedGroup(group)).toBe(true);
    expect(isBreedGroup({ type: 'breed' })).toBe(false);
  });

  it('identifies valid DogImage objects', () => {
    const img = {
      id: 'img-1',
      url: 'https://images.dogapi.dog/test.jpg',
    };
    expect(isDogImage(img)).toBe(true);
    expect(isDogImage({ id: 123 })).toBe(false);
  });
});
