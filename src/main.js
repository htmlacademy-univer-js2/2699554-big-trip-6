import BoardPresenter from './presenter/board-presenter.js';
import CreateModel from './model/create-model.js';
import { destinations, offersByType, generatePoints } from './mock/mock.js';


const createModel = new CreateModel ({
  points: generatePoints(3),
  destinations,
  offersByType,
});
const boardPresenter = new BoardPresenter(createModel);

boardPresenter.init();
