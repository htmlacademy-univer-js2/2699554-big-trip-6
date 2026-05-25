import { POINT_TYPES } from '../const.js';
import { getRandomInteger, getRandomArrayElement, generateId } from '../utils.js';
import { mockDestinations } from './destinations.js';
import { mockOffers } from './offers.js';
import dayjs from 'dayjs';

function generatePoint() {
  const type = getRandomArrayElement(POINT_TYPES);
  const destination = getRandomArrayElement(mockDestinations);

  const typeOffers = mockOffers.find((offer) => offer.type === type);
  const availableOffers = typeOffers ? typeOffers.offers : [];

  const selectedOffers = availableOffers
    .filter(() => Math.random() > 0.5)
    .map((offer) => offer.id);

  const daysOffset = getRandomInteger(-7, 7);
  const hoursOffset = getRandomInteger(0, 23);
  const minutesOffset = getRandomInteger(0, 59);

  const dateFrom = dayjs()
    .add(daysOffset, 'day')
    .hour(hoursOffset)
    .minute(minutesOffset)
    .second(0)
    .toISOString();

  const durationMinutes = getRandomInteger(30, 1440 * 3);
  const dateTo = dayjs(dateFrom).add(durationMinutes, 'minute').toISOString();

  return {
    id: generateId(),
    type,
    destination: destination.id,
    dateFrom,
    dateTo,
    basePrice: getRandomInteger(20, 2000),
    offers: selectedOffers,
    isFavorite: Math.random() > 0.5
  };
}

function generatePoints(count = 5) {
  return Array.from({ length: count }, generatePoint)
    .sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
}

const mockPoints = generatePoints(5);

export { mockPoints, generatePoint };
