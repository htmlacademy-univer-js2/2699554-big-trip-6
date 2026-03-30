import {render, RenderPosition} from '../render.js';
import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import ListView from '../view/list-view.js';
import RoutePointView from '../view/route-point-view.js';
import EditFormView from '../view/edit-form-view.js';

export default class BoardPresenter {
  constructor(pointsModel) {
    this.pointsModel = pointsModel;
    this.filtersContainer = document.querySelector('.trip-controls__filters');
    this.tripEventsContainer = document.querySelector('.trip-events');
  }

  init() {
    render(new FiltersView(), this.filtersContainer, RenderPosition.BEFOREEND);
    render(new SortView(), this.tripEventsContainer, RenderPosition.BEFOREEND);

    const listView = new ListView();
    render(listView, this.tripEventsContainer, RenderPosition.BEFOREEND);

    const listElement = listView.getElement();

    const firstPoint = this.pointsModel.points[0];
    render(new EditFormView(firstPoint), listElement, RenderPosition.AFTERBEGIN);

    for (const point of this.pointsModel.points) {
      const destination = this.pointsModel.getDestinationById(point.destinationId);
      const offers = this.pointsModel.getOffersByType(point.type)
        .filter((o) => point.offersIds.includes(o.id));

      render(new RoutePointView({point, destination, offers}), listElement, RenderPosition.BEFOREEND);
    }
  }
}
