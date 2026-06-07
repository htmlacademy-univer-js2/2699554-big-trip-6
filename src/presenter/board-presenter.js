import EditFormView from '../view/edit-form-view.js';
import EmptyListView from '../view/empty-list-view.js';
import ErrorView from '../view/error-view.js';
import FiltersView from '../view/filters-view.js';
import ListView from '../view/list-view.js';
import LoadingView from '../view/loading-view.js';
import SortView from '../view/sort-view.js';
import PointPresenter from './point-presenter.js';
import TripInfoPresenter from './trip-info-presenter.js';
import { render, replace, remove, RenderPosition } from '../framework/render.js';
import { FilterType, SortType } from '../const.js';
import { generateId } from '../utils.js';
import dayjs from 'dayjs';
import UiBlocker from '../framework/ui-blocker/ui-blocker.js';

const TimeLimit = {
  LOWER_LIMIT: 350,
  UPPER_LIMIT: 1000,
};

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

  #pointPresenters = new Map();
  #currentEditForm = null; // форма создания новой точки
  #tripInfoPresenter = null;

  #uiBlocker = new UiBlocker(TimeLimit);

  constructor({ siteHeaderElement, tripEventsElement, pointsModel, newEventButton }) {
    this.#siteHeaderElement = siteHeaderElement;
    this.#tripEventsElement = tripEventsElement;
    this.#pointsModel = pointsModel;
    this.#newEventButton = newEventButton;

    const tripInfoContainer = this.#siteHeaderElement.querySelector('.trip-main__trip-info');
    this.#tripInfoPresenter = new TripInfoPresenter({
      container: tripInfoContainer,
      pointsModel: this.#pointsModel
    });
  }

  init() {
    this.#pointsModel.addObserver(this.#handleModelEvent);
    this.#newEventButton.addEventListener('click', this.#handleNewEventClick);

    this.#tripInfoPresenter.init();

    // Если данные ещё не загружены, показываем лоадер или ошибку
    if (this.#pointsModel.isLoading || this.#pointsModel.isError) {
      this.#renderBoard();
    }
  }

  #renderBoard() {
    // Состояния загрузки/ошибки
    if (this.#pointsModel.isLoading) {
      this.#renderLoadingMessage();
      return;
    }

    if (this.#pointsModel.isError) {
      this.#renderErrorMessage();
      return;
    }

    const filteredPoints = this.#getFilteredPoints();
    const sortedPoints = this.#getSortedPoints(filteredPoints);

    this.#clearBoard();

    this.#renderFilters();

    if (sortedPoints.length === 0) {
      this.#renderEmptyList();
      return;
    }

    this.#renderSort();
    render(this.#listComponent, this.#tripEventsElement);

    sortedPoints.forEach((point) => this.#renderPoint(point));
  }

  #clearBoard() {
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    this.#closeCurrentEditForm();
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
    const pointPresenter = new PointPresenter({
      listElement: this.#listComponent.element,
      pointsModel: this.#pointsModel,
      onModeChange: this.#handleViewModeChange
    });

    pointPresenter.init(point);
    this.#pointPresenters.set(point.id, pointPresenter);
  }

  #handleViewModeChange = () => {
    // Закрываем все формы редактирования точек
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#closeCurrentEditForm();
  };

  #handleNewEventClick = () => {
    // Сброс фильтров и сортировки, если нужно
    if (this.#currentFilter !== FilterType.EVERYTHING || this.#currentSort !== SortType.DAY) {
      this.#currentFilter = FilterType.EVERYTHING;
      this.#currentSort = SortType.DAY;
      this.#renderBoard();
    }

    this.#closeCurrentEditForm();
    this.#pointPresenters.forEach((presenter) => presenter.resetView());

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
      onSubmit: this.#handleCreateFormSubmit,
      onDeleteClick: () => {
        // Отмена создания (кнопка Cancel)
        this.#closeCurrentEditForm();
        this.#newEventButton.disabled = false;
      },
      getOffersForType: (type) => this.#pointsModel.getOffersByType(type)
    });

    render(createFormComponent, this.#listComponent.element, RenderPosition.AFTERBEGIN);
    this.#currentEditForm = createFormComponent;
    this.#newEventButton.disabled = true;

    document.addEventListener('keydown', this.#escKeyDownHandler);
  };

  #handleCreateFormSubmit = async (pointData) => {
    this.#uiBlocker.block();
    try {
      await this.#pointsModel.addPoint(pointData);
      this.#closeCurrentEditForm();
      this.#newEventButton.disabled = false;
    } catch {
      if (this.#currentEditForm) {
        this.#currentEditForm.shake();
      }
    } finally {
      if (this.#currentEditForm) {
        this.#currentEditForm.resetButtons(); // возвращаем "Save"/"Cancel"
      }
      this.#uiBlocker.unblock();
    }
  };

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

  // Обработчик изменений модели – полная перерисовка доски
  #handleModelEvent = (event) => {
    if (event === 'INIT' || event === 'UPDATE' || event === 'ADD' || event === 'DELETE') {
      this.#renderBoard();
    }
  };
}
