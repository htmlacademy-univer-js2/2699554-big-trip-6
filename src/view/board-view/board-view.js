import AbstractView from '../../framework/view/abstract-view.js';
import createBoardTemplate from './board-view-template.js';


export default class BoardView extends AbstractView {
  get template() {
    return createBoardTemplate();
  }
}
