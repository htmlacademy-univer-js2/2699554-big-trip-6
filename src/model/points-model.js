import Observable from '../framework/observable.js';

export default class PointsModel extends Observable {
  #points = [];
  #destinations = [];
  #offers = [];
  #apiService = null;
  #isLoading = true;
  #isError = false;

  constructor(apiService) {
    super();
    this.#apiService = apiService;
  }

  get points() {
    return this.#points;
  }

  get destinations() {
    return this.#destinations;
  }

  get offers() {
    return this.#offers;
  }

  get isLoading() {
    return this.#isLoading;
  }

  get isError() {
    return this.#isError;
  }

  async init() {
    try {
      const [points, destinations, offers] = await Promise.all([
        this.#apiService.getPoints(),
        this.#apiService.getDestinations(),
        this.#apiService.getOffers()
      ]);

      this.#points = points;
      this.#destinations = destinations;
      this.#offers = offers;
      this.#isLoading = false;
    } catch {
      this.#isLoading = false;
      this.#isError = true;
    }

    this._notify('INIT');
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

  async updatePoint(update) {
    try {
      const updatedPoint = await this.#apiService.updatePoint(update);
      const index = this.#points.findIndex((point) => point.id === updatedPoint.id);
      if (index === -1) {
        throw new Error('Point not found');
      }

      this.#points = [
        ...this.#points.slice(0, index),
        updatedPoint,
        ...this.#points.slice(index + 1)
      ];

      this._notify('UPDATE', updatedPoint);
      return updatedPoint;
    } catch (err) {
      throw err;
    }
  }

  async addPoint(point) {
    try {
      const newPoint = await this.#apiService.addPoint(point);
      this.#points = [newPoint, ...this.#points];
      this._notify('ADD', newPoint);
      return newPoint;
    } catch (err) {
      throw err;
    }
  }

  async deletePoint(id) {
    try {
      await this.#apiService.deletePoint(id);
      this.#points = this.#points.filter((point) => point.id !== id);
      this._notify('DELETE', id);
    } catch (err) {
      throw err;
    }
  }
}
