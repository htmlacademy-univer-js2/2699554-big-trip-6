import { POINT_TYPES } from '../const.js';
import { generateId, getRandomInteger } from '../utils.js';

const OFFER_TITLES = {
  'taxi': [
    { title: 'Order Uber', price: 20 },
    { title: 'Choose radio station', price: 5 }
  ],

  'bus': [
    { title: 'Choose seats', price: 5 },
    { title: 'Add luggage', price: 30 }
  ],

  'train': [
    { title: 'Book a restaurant car', price: 40 },
    { title: 'Add meal', price: 15 },
    { title: 'Choose seats', price: 5 }
  ],

  'ship': [
    { title: 'Add luggage', price: 35 },
    { title: 'Book a cabin', price: 150 }
  ],

  'drive': [
    { title: 'Rent a car', price: 200 },
    { title: 'Add insurance', price: 50 }
  ],

  'flight': [
    { title: 'Add luggage', price: 30 },
    { title: 'Switch to comfort class', price: 100 },
    { title: 'Add meal', price: 15 },
    { title: 'Choose seats', price: 5 },
    { title: 'Travel by train', price: 40 }
  ],

  'check-in': [
    { title: 'Add breakfast', price: 50 },
    { title: 'Add spa', price: 80 }
  ],

  'sightseeing': [
    { title: 'Book a guide', price: 100 },
    { title: 'Add audio guide', price: 20 }
  ],

  'restaurant': [
    { title: 'Reserve a table', price: 10 },
    { title: 'Order wine', price: 50 }
  ]
};

function generateOffers() {
  return POINT_TYPES.map((type) => {
    const typeOffers = OFFER_TITLES[type] || [];
    return {
      type,
      offers: typeOffers.map((offer) => ({
        id: generateId(),
        title: offer.title,
        price: offer.price
      }))
    };
  });
}

const mockOffers = generateOffers();

export { mockOffers };
