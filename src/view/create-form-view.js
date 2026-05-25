import EditFormView from './edit-form-view.js';

export default class CreateFormView extends EditFormView {
  constructor({ allDestinations = [], offers = [] } = {}) {
    super({
      point: null,
      destination: null,
      offers,
      allDestinations,
      isNewPoint: true
    });
  }
}
