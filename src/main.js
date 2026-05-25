import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';

const siteHeaderElement = document.querySelector('.page-header');
const tripEventsElement = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const pointsModel = new PointsModel();

const boardPresenter = new BoardPresenter({
  siteHeaderElement,
  tripEventsElement,
  pointsModel,
  newEventButton
});

boardPresenter.init();
