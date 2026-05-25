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

    const destinations = points.map((point) => this.#pointsModel.getDestinationById(point.destination)).filter(Boolean);
    const names = destinations.map((d) => d.name);
    let title = '';
    if (names.length <= 3) {
      title = names.join(' &mdash; ');
    } else {
      title = `${names[0]} &mdash; ... &mdash; ${names[names.length - 1]}`;
    }

    const startDate = humanizeDate(points[0].dateFrom, 'MMM D');
    const endDate = humanizeDate(points[points.length - 1].dateTo, 'MMM D');
    const dates = `${startDate}&nbsp;&mdash;&nbsp;${endDate}`;

    const totalCost = points.reduce((sum, point) => {
      const offers = this.#pointsModel.getSelectedOffers(point.type, point.offers);
      const offersCost = offers.reduce((acc, offer) => acc + offer.price, 0);
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
