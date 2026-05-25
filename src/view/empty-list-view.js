import AbstractView from '../framework/view/abstract-view.js';
import { FilterType } from '../const.js';

const EmptyListMessage = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now'
};

function createEmptyListTemplate(filterType) {
  const message = EmptyListMessage[filterType] || EmptyListMessage[FilterType.EVERYTHING];

  return `<p class="trip-events__msg">${message}</p>`;
}

export default class EmptyListView extends AbstractView {
  #filterType = null;

  constructor({ filterType = FilterType.EVERYTHING } = {}) {
    super();
    this.#filterType = filterType;
  }

  get template() {
    return createEmptyListTemplate(this.#filterType);
  }
}
