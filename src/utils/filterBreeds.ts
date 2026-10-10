import { Breed, CoatLength, FilterState, SizeBand } from '../types';

export function deriveSizeBand(breed: Breed): SizeBand {
  const maleMax = breed.attributes.male_weight?.max ?? 0;
  const femaleMax = breed.attributes.female_weight?.max ?? 0;
  const maleMin = breed.attributes.male_weight?.min ?? 0;
  const femaleMin = breed.attributes.female_weight?.min ?? 0;

  const maxWeight = Math.max(maleMax, femaleMax, maleMin, femaleMin);

  if (maxWeight <= 0) {
    const height = Math.max(
      breed.attributes.male_height?.max ?? 0,
      breed.attributes.female_height?.max ?? 0
    );
    if (height > 0 && height < 35) return 'small';
    if (height >= 35 && height < 55) return 'medium';
    if (height >= 55 && height < 70) return 'large';
    if (height >= 70) return 'giant';
    return 'medium';
  }

  if (maxWeight < 10) return 'small';
  if (maxWeight <= 25) return 'medium';
  if (maxWeight <= 45) return 'large';
  return 'giant';
}

export function filterBreeds(breeds: Breed[], filters: FilterState): Breed[] {
  const query = filters.searchQuery.trim().toLowerCase();

  return breeds.filter(breed => {
    if (query.length > 0) {
      const nameMatch = breed.attributes.name.toLowerCase().includes(query);
      const otherNamesMatch = Array.isArray(breed.attributes.other_names)
        ? breed.attributes.other_names.some(name =>
            name.toLowerCase().includes(query)
          )
        : false;

      if (!nameMatch && !otherNamesMatch) {
        return false;
      }
    }

    if (filters.selectedGroupIds.length > 0) {
      const groupId = breed.relationships?.group?.data?.id;
      if (!groupId || !filters.selectedGroupIds.includes(groupId)) {
        return false;
      }
    }

    if (filters.selectedSizeBands.length > 0) {
      const size = deriveSizeBand(breed);
      if (!filters.selectedSizeBands.includes(size)) {
        return false;
      }
    }

    if (filters.selectedCoatLengths.length > 0) {
      const coatLength = (
        breed.attributes.coat?.length ||
        breed.attributes.coat?.type ||
        ''
      ).toLowerCase() as CoatLength;

      const hasMatch = filters.selectedCoatLengths.some(l =>
        coatLength.includes(l.toLowerCase())
      );
      if (!hasMatch) {
        return false;
      }
    }

    if (filters.hypoallergenicOnly !== null) {
      if (breed.attributes.hypoallergenic !== filters.hypoallergenicOnly) {
        return false;
      }
    }

    const { traitThresholds } = filters;
    const traits = breed.attributes.traits;

    if (traits) {
      if (
        traitThresholds.good_with_children !== undefined &&
        traits.good_with_children < traitThresholds.good_with_children
      ) {
        return false;
      }

      if (
        traitThresholds.good_with_dogs !== undefined &&
        traits.good_with_dogs < traitThresholds.good_with_dogs
      ) {
        return false;
      }

      if (
        traitThresholds.good_with_strangers !== undefined &&
        traits.good_with_strangers < traitThresholds.good_with_strangers
      ) {
        return false;
      }

      if (
        traitThresholds.energy !== undefined &&
        traits.energy < traitThresholds.energy
      ) {
        return false;
      }

      if (
        traitThresholds.trainability !== undefined &&
        traits.trainability < traitThresholds.trainability
      ) {
        return false;
      }

      if (
        traitThresholds.apartment_friendly !== undefined &&
        traits.apartment_friendly < traitThresholds.apartment_friendly
      ) {
        return false;
      }
    }

    return true;
  });
}
