import EditFormView from '../view/edit-form-view.js';
import EmptyListView from '../view/empty-list-view.js';
import ErrorView from '../view/error-view.js';
import FiltersView from '../view/filters-view.js';
import ListView from '../view/list-view.js';
import LoadingView from '../view/loading-view.js';
import RoutePointView from '../view/route-point-view.js';
import SortView from '../view/sort-view.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';
import { FilterType, SortType } from '../const.js';
import { generateId } from '../utils.js';
import dayjs from 'dayjs';

export default class BoardPresenter {
  #siteHeaderElement = null;
  #tripEventsElement = null;
  #pointsModel = null;
  #newEventButton = null;

  #currentFilter = FilterType.EVERYTHING;
  #currentSort = SortType.DAY;

  #listComponent = new ListView();
  #sortComponent = null;
  #filtersComponent = null;
  #emptyComponent = null;
  #loadingComponent = null;
  #errorComponent = null;

  #isLoading = false;
  #isError = false;

  #currentEditForm = null;

  constructor({ siteHeaderElement, tripEventsElement, pointsModel, newEventButton }) {
    this.#siteHeaderElement = siteHeaderElement;
    this.#tripEventsElement = tripEventsElement;
    this.#pointsModel = pointsModel;
    this.#newEventButton = newEventButton;
  }

  init() {
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#renderBoard();
    this.#newEventButton.addEventListener('click', this.#handleNewEventClick);
  }

  #renderBoard() {
    const filteredPoints = this.#getFilteredPoints();
    const sortedPoints = this.#getSortedPoints(filteredPoints);

    this.#tripEventsElement.innerHTML = '';

    this.#renderFilters();

    if (this.#isLoading) {
      this.#renderLoadingMessage();
      return;
    }

    if (this.#isError) {
      this.#renderErrorMessage();
      return;
    }

    if (sortedPoints.length === 0) {
      this.#renderEmptyList();
      return;
    }

    this.#renderSort();
    render(this.#listComponent, this.#tripEventsElement);

    for (const point of sortedPoints) {
      this.#renderPoint(point);
    }
  }

  #getFilteredPoints() {
    const points = this.#pointsModel.points;
    const now = new Date();

    switch (this.#currentFilter) {
      case FilterType.FUTURE:
        return points.filter((point) => new Date(point.dateFrom) > now);
      case FilterType.PRESENT:
        return points.filter((point) =>
          new Date(point.dateFrom) <= now && new Date(point.dateTo) >= now
        );
      case FilterType.PAST:
        return points.filter((point) => new Date(point.dateTo) < now);
      default:
        return points;
    }
  }

  #getSortedPoints(points) {
    switch (this.#currentSort) {
      case SortType.TIME:
        return points.slice().sort((a, b) => {
          const durA = dayjs(a.dateTo).diff(dayjs(a.dateFrom));
          const durB = dayjs(b.dateTo).diff(dayjs(b.dateFrom));
          return durB - durA;
        });
      case SortType.PRICE:
        return points.slice().sort((a, b) => b.basePrice - a.basePrice);
      default:
        return points.slice().sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    }
  }

  #renderFilters() {
    const filtersContainer = this.#siteHeaderElement.querySelector('.trip-controls__filters');
    const filters = this.#generateFilters();

    const newFiltersComponent = new FiltersView({
      filters,
      currentFilter: this.#currentFilter,
      onFilterChange: this.#handleFilterChange
    });

    if (this.#filtersComponent) {
      replace(newFiltersComponent, this.#filtersComponent);
    } else {
      render(newFiltersComponent, filtersContainer);
    }

    this.#filtersComponent = newFiltersComponent;
  }

  #generateFilters() {
    const points = this.#pointsModel.points;
    const now = new Date();

    return Object.values(FilterType).map((type) => {
      let count = 0;
      switch (type) {
        case FilterType.EVERYTHING:
          count = points.length;
          break;
        case FilterType.FUTURE:
          count = points.filter((p) => new Date(p.dateFrom) > now).length;
          break;
        case FilterType.PRESENT:
          count = points.filter((p) => new Date(p.dateFrom) <= now && new Date(p.dateTo) >= now).length;
          break;
        case FilterType.PAST:
          count = points.filter((p) => new Date(p.dateTo) < now).length;
          break;
      }
      return { type, count };
    });
  }

  #handleFilterChange = (filterType) => {
    if (this.#currentFilter === filterType) {
      return;
    }

    this.#closeCurrentEditForm();
    this.#currentFilter = filterType;
    this.#currentSort = SortType.DAY;
    this.#renderBoard();
  };

  #renderSort() {
    const newSortComponent = new SortView({
      currentSort: this.#currentSort,
      onSortChange: this.#handleSortChange
    });

    if (this.#sortComponent) {
      replace(newSortComponent, this.#sortComponent);
    } else {
      render(newSortComponent, this.#tripEventsElement);
    }

    this.#sortComponent = newSortComponent;
  }

  #handleSortChange = (sortType) => {
    if (this.#currentSort === sortType) {
      return;
    }

    this.#currentSort = sortType;
    this.#renderBoard();
  };

  #renderEmptyList() {
    this.#emptyComponent = new EmptyListView({ filterType: this.#currentFilter });
    render(this.#emptyComponent, this.#tripEventsElement);
  }

  #renderLoadingMessage() {
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#tripEventsElement);
  }

  #renderErrorMessage() {
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#tripEventsElement);
  }

  #renderPoint(point) {
    const destination = this.#pointsModel.getDestinationById(point.destination);
    const selectedOffers = this.#pointsModel.getSelectedOffers(point.type, point.offers);

    const pointComponent = new RoutePointView({
      point,
      destination,
      selectedOffers,
      onEditClick: () => {
        this.#closeCurrentEditForm();
        this.#renderEditForm(point, pointComponent);
      },
      onFavoriteClick: () => {
        const updatedPoint = { ...point, isFavorite: !point.isFavorite };
        this.#pointsModel.updatePoint(updatedPoint);
      }
    });

    render(pointComponent, this.#listComponent.element);
  }

  #renderEditForm(point, pointComponent) {
    const destination = this.#pointsModel.getDestinationById(point.destination);
    const typeOffers = this.#pointsModel.getOffersByType(point.type);
    const allDestinations = this.#pointsModel.destinations;

    const editFormComponent = new EditFormView({
      point,
      destination,
      offers: typeOffers,
      allDestinations,
      onSubmit: (updatedPoint) => {
        this.#pointsModel.updatePoint(updatedPoint);
        this.#closeCurrentEditForm();
      },
      onRollupClick: () => {
        this.#closeCurrentEditForm();
      },
      onDeleteClick: (pointId) => {
        this.#pointsModel.deletePoint(pointId);
        this.#closeCurrentEditForm();
      }
    });

    replace(editFormComponent, pointComponent);
    this.#currentEditForm = editFormComponent;

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #renderCreateForm() {
    if (this.#currentFilter !== FilterType.EVERYTHING || this.#currentSort !== SortType.DAY) {
      this.#currentFilter = FilterType.EVERYTHING;
      this.#currentSort = SortType.DAY;
      this.#renderBoard();
    }

    this.#closeCurrentEditForm();

    const allDestinations = this.#pointsModel.destinations;
    const defaultType = 'flight';
    const typeOffers = this.#pointsModel.getOffersByType(defaultType);

    const newPoint = {
      id: generateId(),
      type: defaultType,
      destination: null,
      dateFrom: dayjs().toISOString(),
      dateTo: dayjs().add(1, 'hour').toISOString(),
      basePrice: 0,
      offers: [],
      isFavorite: false
    };

    const createFormComponent = new EditFormView({
      point: newPoint,
      destination: null,
      offers: typeOffers,
      allDestinations,
      isNewPoint: true,
      onSubmit: (pointData) => {
        this.#pointsModel.addPoint(pointData);
        this.#closeCurrentEditForm();
        this.#newEventButton.disabled = false;
      },
      onDeleteClick: () => {
        this.#closeCurrentEditForm();
        this.#newEventButton.disabled = false;
      }
    });

    render(createFormComponent, this.#listComponent.element, RenderPosition.AFTERBEGIN);
    this.#currentEditForm = createFormComponent;
    this.#newEventButton.disabled = true;

    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #closeCurrentEditForm() {
    if (this.#currentEditForm) {
      remove(this.#currentEditForm);
      this.#currentEditForm = null;
    }
    document.removeEventListener('keydown', this.#escKeyDownHandler);
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#closeCurrentEditForm();
      if (this.#newEventButton) {
        this.#newEventButton.disabled = false;
      }
    }
  };

  #handleNewEventClick = () => {
    this.#renderCreateForm();
  };

  #handleModelEvent = (event, data) => {
    this.#renderBoard();
  };
}
