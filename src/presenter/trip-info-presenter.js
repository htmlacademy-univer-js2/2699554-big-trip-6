import { humanizeDate } from '../utils.js';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
    this.#pointsModel.addObserver(this.#handleModelChange);
  }

  init() {
    this.#render();
  }

  #render() {
    const points = this.#pointsModel.points;
    if (!points.length) {
      this.#container.innerHTML = '';
      return;
    }

    // Собираем уникальные названия городов в порядке следования точек
    const sortedPoints = points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    const destinations = sortedPoints
      .map((point) => this.#pointsModel.getDestinationById(point.destination))
      .filter(Boolean);
    const names = destinations.map((d) => d.name);

    // Название маршрута
    let title = '';
    if (names.length <= 3) {
      title = names.join(' &mdash; ');
    } else {
      title = `${names[0]} &mdash; ... &mdash; ${names[names.length - 1]}`;
    }

    // Даты путешествия
    const startDate = humanizeDate(sortedPoints[0].dateFrom, 'D MMM');
    const endDate = humanizeDate(sortedPoints[sortedPoints.length - 1].dateTo, 'D MMM');
    const dates = `${startDate}&nbsp;&mdash;&nbsp;${endDate}`;

    // Общая стоимость (базовая цена + выбранные опции)
    const totalCost = points.reduce((sum, point) => {
      const selectedOffers = this.#pointsModel.getSelectedOffers(point.type, point.offers);
      const offersCost = selectedOffers.reduce((acc, offer) => acc + offer.price, 0);
      return sum + point.basePrice + offersCost;
    }, 0);

    this.#container.innerHTML = `
      <section class="trip-main__trip-info  trip-info">
        <div class="trip-info__main">
          <h1 class="trip-info__title">${title}</h1>
          <p class="trip-info__dates">${dates}</p>
        </div>
        <p class="trip-info__cost">
          Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span>
        </p>
      </section>
    `;
  }

  #handleModelChange = () => {
    this.#render();
  };
}
