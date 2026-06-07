// Адаптер для преобразования данных от сервера в структуру приложения и обратно

// Сервер присылает точку в формате:
// {
//   "id": "string",
//   "base_price": number,
//   "date_from": "YYYY-MM-DDTHH:mm:ss.sssZ",
//   "date_to": "YYYY-MM-DDTHH:mm:ss.sssZ",
//   "destination": "string (id)",
//   "is_favorite": boolean,
//   "offers": ["offer-id", ...],
//   "type": "string"
// }
// Наше приложение использует поля: id, basePrice, dateFrom, dateTo, destination, isFavorite, offers, type.

// Пункт назначения: сервер возвращает { "id": "...", "name": "...", "description": "...", "pictures": [...] } – структура совпадает.

// Дополнительные опции: сервер возвращает { "type": "...", "offers": [ { "id", "title", "price" } ] } – структура совпадает.

// Поэтому адаптация для точек сводится к переименованию ключей base_price -> basePrice,
// date_from -> dateFrom, date_to -> dateTo, is_favorite -> isFavorite.
// Остальные сущности (destinations, offers) приходят в том же виде, что и в моках.

export const adaptPointFromServer = (serverPoint) => ({
  id: serverPoint.id,
  basePrice: serverPoint.base_price,
  dateFrom: serverPoint.date_from,
  dateTo: serverPoint.date_to,
  destination: serverPoint.destination,
  isFavorite: serverPoint.is_favorite,
  offers: serverPoint.offers,
  type: serverPoint.type,
});

export const adaptPointToServer = (clientPoint) => ({
  id: clientPoint.id,
  'base_price': clientPoint.basePrice,
  'date_from': clientPoint.dateFrom,
  'date_to': clientPoint.dateTo,
  destination: clientPoint.destination,
  'is_favorite': clientPoint.isFavorite,
  offers: clientPoint.offers,
  type: clientPoint.type,
});
