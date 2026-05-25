import { CITIES, DESCRIPTIONS } from '../const.js';
import { getRandomInteger, getRandomArrayElement, generateId } from '../utils.js';

function generatePhotos() {
  const photosCount = getRandomInteger(1, 5);
  return Array.from({ length: photosCount }, () => ({
    src: `https://loremflickr.com/248/152?random=${getRandomInteger(1, 1000)}`,
    description: getRandomArrayElement(DESCRIPTIONS)
  }));
}

function generateDescription() {
  const sentencesCount = getRandomInteger(1, 5);
  const shuffled = [...DESCRIPTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, sentencesCount).join(' ');
}

function generateDestinations() {
  return CITIES.map((city) => ({
    id: generateId(),
    name: city,
    description: generateDescription(),
    pictures: generatePhotos()
  }));
}

const mockDestinations = generateDestinations();

export { mockDestinations };
