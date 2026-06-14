import { humanizeDate } from '../utils.js';
import he from 'he';

const MAX_VISIBLE_DESTINATIONS = 3;

function getUniqueDestinationNames(destinations) {
  const names = [];

  destinations.forEach((destination) => {
    if (!names.includes(destination.name)) {
      names.push(destination.name);
    }
  });

  return names.map((name) => he.encode(name));
}

function getLatestDateTo(points) {
  return points.reduce((latestDate, point) => {
    if (!latestDate || new Date(point.dateTo) > new Date(latestDate)) {
      return point.dateTo;
    }
    return latestDate;
  }, points[0].dateTo);
}

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

    const sortedPoints = points.slice().sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
    const destinations = sortedPoints
      .map((point) => this.#pointsModel.getDestinationById(point.destination))
      .filter(Boolean);
    const names = getUniqueDestinationNames(destinations);

    let title = '';
    if (names.length <= MAX_VISIBLE_DESTINATIONS) {
      title = names.join(' &mdash; ');
    } else {
      title = `${names[0]} &mdash; ... &mdash; ${names[names.length - 1]}`;
    }

    const startDate = humanizeDate(sortedPoints[0].dateFrom, 'D MMM');
    const endDate = humanizeDate(getLatestDateTo(points), 'D MMM');
    const dates = `${startDate}&nbsp;&mdash;&nbsp;${endDate}`;

    const totalCost = points.reduce((sum, point) => {
      const selectedOffers = this.#pointsModel.getSelectedOffers(point.type, point.offers);
      const offersCost = selectedOffers.reduce((offerSum, offer) => offerSum + offer.price, 0);
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
