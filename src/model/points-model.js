import Observable from '../framework/observable.js';
import { mockPoints } from '../mock/points.js';
import { mockDestinations } from '../mock/destinations.js';
import { mockOffers } from '../mock/offers.js';

export default class PointsModel extends Observable {
  #points = mockPoints;
  #destinations = mockDestinations;
  #offers = mockOffers;

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  getDestinationById(id) {
    return this.#destinations.find((destination) => destination.id === id);
  }

  getOffersByType(type) {
    const typeOffers = this.#offers.find((offer) => offer.type === type);
    return typeOffers ? typeOffers.offers : [];
  }

  getSelectedOffers(type, offerIds) {
    const typeOffers = this.getOffersByType(type);
    return typeOffers.filter((offer) => offerIds.includes(offer.id));
  }

  updatePoint(update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      return false;
    }

    this.#points = [
      ...this.#points.slice(0, index),
      update,
      ...this.#points.slice(index + 1)
    ];

    this._notify('UPDATE', update);
    return true;
  }

  addPoint(point) {
    this.#points = [point, ...this.#points];
    this._notify('ADD', point);
  }

  deletePoint(id) {
    const index = this.#points.findIndex((point) => point.id === id);
    if (index === -1) {
      return false;
    }

    this.#points = [
      ...this.#points.slice(0, index),
      ...this.#points.slice(index + 1)
    ];

    this._notify('DELETE', id);
    return true;
  }
}
