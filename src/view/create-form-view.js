import BasicView from './basic-view.js';


function createFormViewTemplate() {
  return `
    <form class="event event--edit" action="#" method="post">
      <header class="event__header">
        <h3 style="margin: 0;">Create new event (stub)</h3>
      </header>
    </form>
  `;
}

export default class CreateFormView extends BasicView {
  get template() {
    return createFormViewTemplate();
  }
}
