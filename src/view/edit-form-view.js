import AbstractView from '../framework/view/abstract-view.js';
import { POINT_TYPES } from '../const.js';
import { humanizeDate, capitalizeFirstLetter } from '../utils.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function createTypeListTemplate(currentType, pointId) {
  return POINT_TYPES.map((type) => `
    <div class="event__type-item">
      <input
        id="event-type-${type}-${pointId}"
        class="event__type-input visually-hidden"
        type="radio"
        name="event-type"
        value="${type}"
        ${type === currentType ? 'checked' : ''}
      >
      <label class="event__type-label event__type-label--${type}" for="event-type-${type}-${pointId}">${capitalizeFirstLetter(type)}</label>
    </div>
  `).join('');
}

function createDestinationListTemplate(destinations) {
  return destinations.map((destination) => `
    <option value="${destination.name}"></option>
  `).join('');
}

function createOffersTemplate(offers, selectedOffers, pointId) {
  if (!offers || offers.length === 0) {
    return '';
  }

  const offersMarkup = offers.map((offer) => {
    const isChecked = selectedOffers.includes(offer.id);
    const offerSlug = offer.title.toLowerCase().replace(/\s+/g, '-');

    return `
      <div class="event__offer-selector">
        <input
          class="event__offer-checkbox visually-hidden"
          id="event-offer-${offerSlug}-${pointId}"
          type="checkbox"
          name="event-offer-${offerSlug}"
          ${isChecked ? 'checked' : ''}
          data-offer-id="${offer.id}"
        >
        <label class="event__offer-label" for="event-offer-${offerSlug}-${pointId}">
          <span class="event__offer-title">${offer.title}</span>
          &plus;&euro;&nbsp;
          <span class="event__offer-price">${offer.price}</span>
        </label>
      </div>
    `;
  }).join('');

  return `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${offersMarkup}
      </div>
    </section>
  `;
}

function createDestinationTemplate(destination) {
  if (!destination || (!destination.description && (!destination.pictures || destination.pictures.length === 0))) {
    return '';
  }

  const photosTemplate = destination.pictures && destination.pictures.length > 0
    ? `
      <div class="event__photos-container">
        <div class="event__photos-tape">
          ${destination.pictures.map((picture) => `
            <img class="event__photo" src="${picture.src}" alt="${picture.description}">
          `).join('')}
        </div>
      </div>
    `
    : '';

  return `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      ${destination.description ? `<p class="event__destination-description">${destination.description}</p>` : ''}
      ${photosTemplate}
    </section>
  `;
}

function createEditFormTemplate(point, destination, offers, allDestinations, isNewPoint = false) {
  const { id, type, dateFrom, dateTo, basePrice, offers: selectedOffers } = point;
  const pointId = id || 'new';

  const startTime = dateFrom ? humanizeDate(dateFrom, 'd/m/y H:i') : '';
  const endTime = dateTo ? humanizeDate(dateTo, 'd/m/y H:i') : '';
  const destinationName = destination ? destination.name : '';

  const hasOffers = offers && offers.length > 0;
  const hasDestination = destination && (destination.description || (destination.pictures && destination.pictures.length > 0));
  const hasDetails = hasOffers || hasDestination;

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-${pointId}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-${pointId}" type="checkbox">

            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${createTypeListTemplate(type, pointId)}
              </fieldset>
            </div>
          </div>

          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-${pointId}">
              ${capitalizeFirstLetter(type)}
            </label>
            <input
              class="event__input event__input--destination"
              id="event-destination-${pointId}"
              type="text"
              name="event-destination"
              value="${destinationName}"
              list="destination-list-${pointId}"
              autocomplete="off"
            >
            <datalist id="destination-list-${pointId}">
              ${createDestinationListTemplate(allDestinations)}
            </datalist>
          </div>

          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${pointId}">From</label>
            <input
              class="event__input event__input--time"
              id="event-start-time-${pointId}"
              type="text"
              name="event-start-time"
              value="${startTime}"
            >
            &mdash;
            <label class="visually-hidden" for="event-end-time-${pointId}">To</label>
            <input
              class="event__input event__input--time"
              id="event-end-time-${pointId}"
              type="text"
              name="event-end-time"
              value="${endTime}"
            >
          </div>

          <div class="event__field-group event__field-group--price">
            <label class="event__label" for="event-price-${pointId}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input
              class="event__input event__input--price"
              id="event-price-${pointId}"
              type="text"
              name="event-price"
              value="${basePrice}"
            >
          </div>

          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">${isNewPoint ? 'Cancel' : 'Delete'}</button>
          ${!isNewPoint ? `
            <button class="event__rollup-btn" type="button">
              <span class="visually-hidden">Open event</span>
            </button>
          ` : ''}
        </header>
        ${hasDetails ? `
          <section class="event__details">
            ${createOffersTemplate(offers, selectedOffers, pointId)}
            ${createDestinationTemplate(destination)}
          </section>
        ` : ''}
      </form>
    </li>
  `;
}

export default class EditFormView extends AbstractView {
  #point = null;
  #destination = null;
  #offers = null;
  #allDestinations = null;
  #isNewPoint = false;
  #handleSubmit = null;
  #handleRollupClick = null;
  #handleDeleteClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({ point = null, destination = null, offers = [], allDestinations = [], isNewPoint = false, onSubmit, onRollupClick, onDeleteClick } = {}) {
    super();
    this.#point = point || this.#getEmptyPoint();
    this.#destination = destination;
    this.#offers = offers;
    this.#allDestinations = allDestinations;
    this.#isNewPoint = isNewPoint;
    this.#handleSubmit = onSubmit;
    this.#handleRollupClick = onRollupClick;
    this.#handleDeleteClick = onDeleteClick;

    this.#initDatepickers();
    this.#addEventListeners();
  }

  #getEmptyPoint() {
    return {
      id: null,
      type: 'flight',
      destination: null,
      dateFrom: '',
      dateTo: '',
      basePrice: 0,
      offers: [],
      isFavorite: false
    };
  }

  get template() {
    return createEditFormTemplate(
      this.#point,
      this.#destination,
      this.#offers,
      this.#allDestinations,
      this.#isNewPoint
    );
  }

  #initDatepickers() {
    const startTimeInput = this.element.querySelector('[name="event-start-time"]');
    const endTimeInput = this.element.querySelector('[name="event-end-time"]');

    if (startTimeInput) {
      this.#datepickerFrom = flatpickr(startTimeInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
        onChange: ([selectedDate]) => {
          if (this.#datepickerTo && selectedDate) {
            this.#datepickerTo.set('minDate', selectedDate);
          }
        }
      });
    }

    if (endTimeInput) {
      this.#datepickerTo = flatpickr(endTimeInput, {
        enableTime: true,
        dateFormat: 'd/m/y H:i',
      });
    }
  }

  #addEventListeners() {
    const form = this.element.querySelector('form');
    const resetBtn = this.element.querySelector('.event__reset-btn');
    const rollupBtn = this.element.querySelector('.event__rollup-btn');

    if (form) {
      form.addEventListener('submit', this.#formSubmitHandler);
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', this.#deleteClickHandler);
    }

    if (rollupBtn && !this.#isNewPoint) {
      rollupBtn.addEventListener('click', this.#rollupClickHandler);
    }

    const typeInputs = this.element.querySelectorAll('.event__type-input');
    typeInputs.forEach((input) => {
      input.addEventListener('change', this.#typeChangeHandler);
    });

    const destinationInput = this.element.querySelector('.event__input--destination');
    if (destinationInput) {
      destinationInput.addEventListener('change', this.#destinationChangeHandler);
    }
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();

    const formData = new FormData(evt.target);
    const type = formData.get('event-type');
    const destinationName = formData.get('event-destination');
    const destination = this.#allDestinations.find((d) => d.name === destinationName);
    const startTimeStr = formData.get('event-start-time');
    const endTimeStr = formData.get('event-end-time');
    const price = parseInt(formData.get('event-price'), 10);

    const selectedOfferIds = [];
    this.element.querySelectorAll('.event__offer-checkbox:checked').forEach((checkbox) => {
      const offerId = checkbox.dataset.offerId;
      if (offerId) {
        selectedOfferIds.push(offerId);
      }
    });

    const updatedPoint = {
      id: this.#point.id,
      type,
      destination: destination ? destination.id : null,
      dateFrom: this.#parseDateTime(startTimeStr),
      dateTo: this.#parseDateTime(endTimeStr),
      basePrice: isNaN(price) ? 0 : price,
      offers: selectedOfferIds,
      isFavorite: this.#point.isFavorite
    };

    this.#handleSubmit(updatedPoint);
  };

  #parseDateTime(dateTimeStr) {
    if (!dateTimeStr) return '';
    const [day, month, year, hours, minutes] = dateTimeStr.split(/[\/\s:]/);
    const isoString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}:00`;
    return isoString;
  }

  #rollupClickHandler = (evt) => {
    evt.preventDefault();
    this.#handleRollupClick();
  };

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    if (this.#isNewPoint) {
      this.#handleDeleteClick();
    } else {
      this.#handleDeleteClick(this.#point.id);
    }
  };

  #typeChangeHandler = (evt) => {
    const newType = evt.target.value;
    this.#point.type = newType;
    this.updateElement({ type: newType });
  };

  #destinationChangeHandler = (evt) => {
    const destinationName = evt.target.value;
    const destination = this.#allDestinations.find((d) => d.name === destinationName);
    this.#destination = destination;
    this.updateElement({});
  };
}
