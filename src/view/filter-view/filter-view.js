import AbstractView from '../../framework/view/abstract-view.js';
import createFilterTemplate from './filter-view-template.js';


export default class FilterView extends AbstractView {
  get template() {
    return createFilterTemplate();
  }
}
