import TripModel from './model/trip-model.js';
import BoardPresenter from './presenter/board-presenter.js';
import { render } from './framework/render.js';
import NewPointButtonView from './view/new-point-button-view/new-point-button-view.js';
import FilterView from './view/filter-view/filter-view.js';


const pageHeaderElement = document.querySelector('.page-header');
const tripMainElement = pageHeaderElement.querySelector('.trip-main');
const tripControlsFiltersElement = pageHeaderElement.querySelector(
  '.trip-controls__filters'
);

const pageMainElement = document.querySelector('.page-main');
const pageBodyContainerElement = pageMainElement.querySelector(
  '.page-body__container'
);

const tripModel = new TripModel();

const boardPresenter = new BoardPresenter({
  boardContainer: pageBodyContainerElement,
  tripModel,
});

render(new NewPointButtonView(), tripMainElement);
render(new FilterView(), tripControlsFiltersElement);

boardPresenter.init();
