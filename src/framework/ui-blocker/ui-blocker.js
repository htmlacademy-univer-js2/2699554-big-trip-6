import './ui-blocker.css';

export default class UiBlocker {
  #lowerLimit;
  #upperLimit;
  #element;
  #startTime;
  #endTime;
  #timerId;

  constructor({lowerLimit, upperLimit}) {
    this.#lowerLimit = lowerLimit;
    this.#upperLimit = upperLimit;

    this.#element = document.createElement('div');
    this.#element.classList.add('ui-blocker');
    document.body.append(this.#element);
  }

  block() {
    this.#startTime = Date.now();
    this.#timerId = setTimeout(() => {
      this.#activateBlocking();
    }, this.#lowerLimit);
  }

  unblock() {
    this.#endTime = Date.now();
    const duration = this.#endTime - this.#startTime;

    if (duration < this.#lowerLimit) {
      clearTimeout(this.#timerId);
      return;
    }

    if (duration >= this.#upperLimit) {
      this.#disactivateBlocking();
      return;
    }

    setTimeout(this.#disactivateBlocking, this.#upperLimit - duration);
  }

  #activateBlocking = () => {
    this.#element.classList.add('ui-blocker--on');
    document.addEventListener('keydown', this.#documentKeydownHandler);
  };

  #disactivateBlocking = () => {
    this.#element.classList.remove('ui-blocker--on');
    document.removeEventListener('keydown', this.#documentKeydownHandler);
  };

  #documentKeydownHandler = (evt) => {
    evt.preventDefault();
  };
}
