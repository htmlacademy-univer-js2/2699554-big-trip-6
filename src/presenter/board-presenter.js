import NewFormView from '../view/create-form-view.js';
import NewEditFormView from '../view/edit-form-view.js';
import NewFiltersView from '../view/filters-view.js';
import NewRoutePointView from '../view/route-point-view.js';
import NewSortView from '../view/sort-view.js';
import NewListView from '../view/list-view.js';
import { render } from '../render.js';


export default class BoardPresenter {
  constructor({ siteHeaderElement, tripEventsElement }) {
    this.siteHeaderElement = siteHeaderElement;
    this.tripEventsElement = tripEventsElement;
  }

  init() {
    const filtersContainer = this.siteHeaderElement.querySelector('.trip-controls__filters');
    render(new NewFiltersView(), filtersContainer);
    render(new NewSortView(), this.tripEventsElement);

    const listComponent = new NewListView();
    render(listComponent, this.tripEventsElement);

    const eventsListElement = listComponent.getElement();

    render(new NewEditFormView(), eventsListElement);

    for (let i = 0; i < 3; i++) {
      render(new NewRoutePointView(), eventsListElement);
    }

    render(new NewFormView(), eventsListElement);
  }
}
