import RoutePointView from '../view/route-point-view.js';
import EditFormView from '../view/edit-form-view.js';
import { render, replace, remove } from '../framework/render.js';
import { isEscapeKey } from '../utils.js';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

const Mode = {
  DEFAULT: 'DEFAULT',
  EDITING: 'EDITING',
};

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

export default class PointPresenter {
  #listElement = null;
  #pointsModel = null;
  #handleModeChange = null;
  #point = null;

  #routePointComponent = null;
  #editFormComponent = null;
  #mode = Mode.DEFAULT;

  #uiBlocker = new UiBlocker(TimeLimit);

  constructor({ listElement, pointsModel, onModeChange }) {
    this.#listElement = listElement;
    this.#pointsModel = pointsModel;
    this.#handleModeChange = onModeChange;
  }

  init(point) {
    this.#point = point;
    this.#renderPoint();
  }

  #renderPoint() {
    const destination = this.#pointsModel.getDestinationById(this.#point.destination);
    const selectedOffers = this.#pointsModel.getSelectedOffers(this.#point.type, this.#point.offers);

    this.#routePointComponent = new RoutePointView({
      point: this.#point,
      destination,
      selectedOffers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    render(this.#routePointComponent, this.#listElement);
  }

  #renderEditForm() {
    const destination = this.#pointsModel.getDestinationById(this.#point.destination);
    const typeOffers = this.#pointsModel.getOffersByType(this.#point.type);
    const allDestinations = this.#pointsModel.destinations;

    this.#editFormComponent = new EditFormView({
      point: this.#point,
      destination,
      offers: typeOffers,
      allDestinations,
      onSubmit: this.#handleFormSubmit,
      onRollupClick: this.#handleRollupClick,
      onDeleteClick: this.#handleDeleteClick
    });

    replace(this.#editFormComponent, this.#routePointComponent);
    this.#mode = Mode.EDITING;
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #replaceFormToPoint() {
    replace(this.#routePointComponent, this.#editFormComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  }

  #handleEditClick = () => {
    this.#handleModeChange();
    this.#renderEditForm();
  };

  #handleRollupClick = () => {
    this.#replaceFormToPoint();
  };

  #handleFormSubmit = async (updatedPoint) => {
    this.#uiBlocker.block();
    try {
      await this.#pointsModel.updatePoint(updatedPoint);
      this.#replaceFormToPoint();
    } catch {
      this.#editFormComponent.shake();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleDeleteClick = async (pointId) => {
    this.#uiBlocker.block();
    try {
      await this.#pointsModel.deletePoint(pointId);
      // DOM обновится через перерисовку доски
    } catch {
      this.#editFormComponent.shake();
    } finally {
      this.#uiBlocker.unblock();
    }
  };

  #handleFavoriteClick = async () => {
    const updatedPoint = { ...this.#point, isFavorite: !this.#point.isFavorite };
    try {
      const response = await this.#pointsModel.updatePoint(updatedPoint);
      this.#point = response;
      this.#updatePointView();
    } catch {
      this.#routePointComponent.shake();
    }
  };

  #escKeyDownHandler = (evt) => {
    if (isEscapeKey(evt)) {
      evt.preventDefault();
      this.#replaceFormToPoint();
    }
  };

  resetView() {
    if (this.#mode === Mode.EDITING) {
      this.#replaceFormToPoint();
    }
  }

  destroy() {
    remove(this.#routePointComponent);
    if (this.#editFormComponent) {
      remove(this.#editFormComponent);
    }
  }

  #updatePointView() {
    const destination = this.#pointsModel.getDestinationById(this.#point.destination);
    const selectedOffers = this.#pointsModel.getSelectedOffers(this.#point.type, this.#point.offers);

    const newComponent = new RoutePointView({
      point: this.#point,
      destination,
      selectedOffers,
      onEditClick: this.#handleEditClick,
      onFavoriteClick: this.#handleFavoriteClick
    });

    if (this.#mode === Mode.DEFAULT) {
      replace(newComponent, this.#routePointComponent);
      this.#routePointComponent = newComponent;
    } else {
      // если форма открыта, сохраняем новое представление для последующей замены
      this.#routePointComponent = newComponent;
    }
  }
}
