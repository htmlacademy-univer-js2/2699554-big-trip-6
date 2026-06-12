import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

const RANDOM_INTEGER_OFFSET = 1;
const FIRST_ARRAY_INDEX = 0;
const DATE_COMPONENT_PAD_LENGTH = 2;

function getRandomInteger(min, max) {
  const lower = Math.ceil(Math.min(min, max));
  const upper = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (upper - lower + RANDOM_INTEGER_OFFSET) + lower);
}

function getRandomArrayElement(items) {
  return items[getRandomInteger(FIRST_ARRAY_INDEX, items.length - RANDOM_INTEGER_OFFSET)];
}

function generateId() {
  return crypto.randomUUID();
}

/**
 * Форматирует дату в указанный формат.
 * @param {string} date - ISO-строка даты
 * @param {string} format - формат dayjs (например, 'MMM D', 'HH:mm', 'd/m/y H:i')
 * @returns {string} отформатированная дата или пустая строка, если date не задана
 */

function humanizeDate(date, format) {
  return date ? dayjs(date).format(format) : '';
}

/**
 * Вычисляет и форматирует продолжительность между двумя датами согласно ТЗ.
 * @param {string} dateFrom - ISO-строка начала
 * @param {string} dateTo - ISO-строка окончания
 * @returns {string} например, '23M', '02H 44M', '12H 00M', '07D 00H 00M'
 */

function formatDuration(dateFrom, dateTo) {
  const diff = dayjs(dateTo).diff(dayjs(dateFrom));
  const durationObj = dayjs.duration(diff);

  const days = Math.floor(durationObj.asDays());
  const hours = durationObj.hours();
  const minutes = durationObj.minutes();

  if (days > 0) {
    return `${String(days).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}D ${String(hours).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}H ${String(minutes).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}M`;
  }

  if (hours > 0) {
    return `${String(hours).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}H ${String(minutes).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}M`;
  }

  return `${String(minutes).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}M`;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Проверяет, является ли нажатая клавиша Escape.
 * @param {KeyboardEvent} evt - событие клавиатуры
 * @returns {boolean}
 */

function isEscapeKey(evt) {
  return evt.key === 'Escape' || evt.key === 'Esc';
}

export {
  getRandomInteger,
  getRandomArrayElement,
  generateId,
  humanizeDate,
  formatDuration,
  capitalizeFirstLetter,
  isEscapeKey
};
