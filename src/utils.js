import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration.js';

dayjs.extend(duration);

const DATE_COMPONENT_PAD_LENGTH = 2;

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
  const durationObject = dayjs.duration(diff);

  const days = Math.floor(durationObject.asDays());
  const hours = durationObject.hours();
  const minutes = durationObject.minutes();

  if (days > 0) {
    return `${String(days).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}D ${String(hours).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}H ${String(minutes).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}M`;
  }

  if (hours > 0) {
    return `${String(hours).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}H ${String(minutes).padStart(DATE_COMPONENT_PAD_LENGTH, '0')}M`;
  }

  return `${minutes}M`;
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
  humanizeDate,
  formatDuration,
  capitalizeFirstLetter,
  isEscapeKey
};
