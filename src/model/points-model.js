import Observable from '../framework/observable.js';
import { adaptPointFromServer, adaptPointToServer } from '../utils/adapter.js';

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
      const [serverPoints, destinations, offers] = await Promise.all([
        this.#apiService.getPoints(),
        this.#apiService.getDestinations(),
        this.#apiService.getOffers()
      ]);

      // Преобразуем точки из серверного формата в клиентский
      this.#points = serverPoints.map(adaptPointFromServer);
      this.#destinations = destinations;   // структура не требует адаптации
      this.#offers = offers;               // структура не требует адаптации
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
    // update уже в клиентском формате, преобразуем для отправки
    const serverPoint = adaptPointToServer(update);

    try {
      const updatedServerPoint = await this.#apiService.updatePoint(serverPoint);
      const updatedClientPoint = adaptPointFromServer(updatedServerPoint);

      const index = this.#points.findIndex((point) => point.id === updatedClientPoint.id);
      if (index === -1) {
        throw new Error('Point not found');
      }

      this.#points = [
        ...this.#points.slice(0, index),
        updatedClientPoint,
        ...this.#points.slice(index + 1)
      ];

      this._notify('UPDATE', updatedClientPoint);
      return updatedClientPoint;
    } catch (err) {
      throw err;
    }
  }

  async addPoint(point) {
    const serverPoint = adaptPointToServer(point);

    try {
      const newServerPoint = await this.#apiService.addPoint(serverPoint);
      const newClientPoint = adaptPointFromServer(newServerPoint);

      this.#points = [newClientPoint, ...this.#points];
      this._notify('ADD', newClientPoint);
      return newClientPoint;
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
