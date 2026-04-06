import { loadDestinations, loadOffers, loadPoints } from '../mock/mock.js';


export default class TripModel {
  #points = loadPoints();
  #destinations = loadDestinations();
  #offers = loadOffers();

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }
}
