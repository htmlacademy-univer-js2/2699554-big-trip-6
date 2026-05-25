import AbstractView from '../framework/view/abstract-view.js';

function createFilterItemTemplate(filter, isChecked) {
  const { type, count } = filter;
  const isDisabled = count === 0;

  return `
    <div class="trip-filters__filter">
      <input
        id="filter-${type}"
        class="trip-filters__filter-input visually-hidden"
        type="radio"
        name="trip-filter"
        value="${type}"
        ${isChecked ? 'checked' : ''}
        ${isDisabled ? 'disabled' : ''}
      >
      <label class="trip-filters__filter-label" for="filter-${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</label>
    </div>
  `;
}

function createFiltersTemplate(filters, currentFilter) {
  const filterItemsTemplate = filters
    .map((filter) => createFilterItemTemplate(filter, filter.type === currentFilter))
    .join('');

  return `
    <form class="trip-filters" action="#" method="get">
      ${filterItemsTemplate}
      <button class="visually-hidden" type="submit">Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #filters = null;
  #currentFilter = null;
  #handleFilterChange = null;

  constructor({ filters, currentFilter, onFilterChange }) {
    super();
    this.#filters = filters;
    this.#currentFilter = currentFilter;
    this.#handleFilterChange = onFilterChange;

    this.element.querySelectorAll('.trip-filters__filter-input')
      .forEach((input) => {
        input.addEventListener('change', this.#filterChangeHandler);
      });
  }

  get template() {
    return createFiltersTemplate(this.#filters, this.#currentFilter);
  }

  #filterChangeHandler = (evt) => {
    evt.preventDefault();
    this.#handleFilterChange(evt.target.value);
  };
}
