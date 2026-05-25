import AbstractView from '../../framework/view/abstract-view.js';
import createNewPointButtonTemplate from './new-point-button-view-template.js';


export default class NewPointButtonView extends AbstractView {
  get template() {
    return createNewPointButtonTemplate();
  }
}
