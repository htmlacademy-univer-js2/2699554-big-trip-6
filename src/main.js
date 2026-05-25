import BoardPresenter from './presenter/board-presenter.js';
import PointsModel from './model/points-model.js';
import PointsApiService from './service/points-api-service.js';

const siteHeaderElement = document.querySelector('.page-header');
const tripEventsElement = document.querySelector('.trip-events');
const newEventButton = document.querySelector('.trip-main__event-add-btn');

const apiService = new PointsApiService();
const pointsModel = new PointsModel(apiService);

const boardPresenter = new BoardPresenter({
  siteHeaderElement,
  tripEventsElement,
  pointsModel,
  newEventButton
});

// Инициализируем модель (загрузка данных с сервера), затем — презентер
pointsModel.init().finally(() => {
  boardPresenter.init();
});
