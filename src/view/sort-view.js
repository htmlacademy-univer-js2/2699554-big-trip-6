import AbstractView from '../framework/view/abstract-view.js';
import { SortType } from '../const.js';

function createSortItemTemplate(sortType, isChecked, isDisabled = false) {
  return `
    <div class="trip-sort__item trip-sort__item--${sortType}">
      <input
        id="sort-${sortType}"
        class="trip-sort__input visually-hidden"
        type="radio"
        name="trip-sort"
        value="sort-${sortType}"
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
      >
      <label class="trip-sort__btn" for="sort-${sortType}">${sortType.charAt(0).toUpperCase() + sortType.slice(1)}</label>
    </div>
  `;
}

function createSortTemplate(currentSort) {
  return `
    <form class="trip-events__trip-sort trip-sort" action="#" method="get">
      ${createSortItemTemplate(SortType.DAY, currentSort === SortType.DAY)}
      <div class="trip-sort__item trip-sort__item--event">
        <input id="sort-event" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-event" disabled>
        <label class="trip-sort__btn" for="sort-event">Event</label>
      </div>
      ${createSortItemTemplate(SortType.TIME, currentSort === SortType.TIME)}
      ${createSortItemTemplate(SortType.PRICE, currentSort === SortType.PRICE)}
      <div class="trip-sort__item trip-sort__item--offer">
        <input id="sort-offer" class="trip-sort__input visually-hidden" type="radio" name="trip-sort" value="sort-offer" disabled>
        <label class="trip-sort__btn" for="sort-offer">Offers</label>
      </div>
    </form>
  `;
}

export default class SortView extends AbstractView {
  #currentSort = null;
  #handleSortChange = null;

  constructor({ currentSort = SortType.DAY, onSortChange }) {
    super();
    this.#currentSort = currentSort;
    this.#handleSortChange = onSortChange;

    this.element.querySelectorAll('.trip-sort__input')
      .forEach((input) => {
        input.addEventListener('change', this.#sortChangeHandler);
      });
  }

  get template() {
    return createSortTemplate(this.#currentSort);
  }

  #sortChangeHandler = (evt) => {
    evt.preventDefault();
    const sortType = evt.target.value.replace('sort-', '');
    this.#handleSortChange(sortType);
  };
}
