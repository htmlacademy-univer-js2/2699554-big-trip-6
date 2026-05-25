import AbstractView from '../framework/view/abstract-view.js';
import { humanizeDate, formatDuration, capitalizeFirstLetter } from '../utils.js';

function createOffersTemplate(offers) {
  if (!offers || offers.length === 0) {
    return '';
  }

  return offers.map((offer) => `
    <li class="event__offer">
      <span class="event__offer-title">${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class="event__offer-price">${offer.price}</span>
    </li>
  `).join('');
}

function createRoutePointTemplate(point, destination, selectedOffers) {
  const { type, dateFrom, dateTo, basePrice, isFavorite } = point;

  const dateFormatted = humanizeDate(dateFrom, 'MMM D');
  const dateTimeAttribute = humanizeDate(dateFrom, 'YYYY-MM-DD');
  const startTime = humanizeDate(dateFrom, 'HH:mm');
  const endTime = humanizeDate(dateTo, 'HH:mm');
  const startTimeAttribute = humanizeDate(dateFrom, 'YYYY-MM-DDTHH:mm');
  const endTimeAttribute = humanizeDate(dateTo, 'YYYY-MM-DDTHH:mm');
  const duration = formatDuration(dateFrom, dateTo);
  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';
  const destinationName = destination ? destination.name : '';

  return `
    <li class="trip-events__item">
      <div class="event">
        <time class="event__date" datetime="${dateTimeAttribute}">${dateFormatted.toUpperCase()}</time>
        <div class="event__type">
          <img class="event__type-icon" width="42" height="42" src="img/icons/${type}.png" alt="Event type icon">
        </div>
        <h3 class="event__title">${capitalizeFirstLetter(type)} ${destinationName}</h3>
        <div class="event__schedule">
          <p class="event__time">
            <time class="event__start-time" datetime="${startTimeAttribute}">${startTime}</time>
            &mdash;
            <time class="event__end-time" datetime="${endTimeAttribute}">${endTime}</time>
          </p>
          <p class="event__duration">${duration}</p>
        </div>
        <p class="event__price">
          &euro;&nbsp;<span class="event__price-value">${basePrice}</span>
        </p>
        <h4 class="visually-hidden">Offers:</h4>
        <ul class="event__selected-offers">
          ${createOffersTemplate(selectedOffers)}
        </ul>
        <button class="event__favorite-btn ${favoriteClass}" type="button">
          <span class="visually-hidden">Add to favorite</span>
          <svg class="event__favorite-icon" width="28" height="28" viewBox="0 0 28 28">
            <path d="M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.67376 9.8855 8.33688 14 0l4.1145 8.33688 9.2003 1.33688-6.6574 6.48934 1.5716 9.1631L14 21z"/>
          </svg>
        </button>
        <button class="event__rollup-btn" type="button">
          <span class="visually-hidden">Open event</span>
        </button>
      </div>
    </li>
  `;
}

export default class RoutePointView extends AbstractView {
  #point = null;
  #destination = null;
  #selectedOffers = null;
  #handleEditClick = null;
  #handleFavoriteClick = null;

  constructor({ point, destination, selectedOffers, onEditClick, onFavoriteClick }) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#selectedOffers = selectedOffers;
    this.#handleEditClick = onEditClick;
    this.#handleFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn')
      .addEventListener('click', this.#editClickHandler);

    this.element.querySelector('.event__favorite-btn')
      .addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createRoutePointTemplate(this.#point, this.#destination, this.#selectedOffers);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleFavoriteClick();
  };
}
