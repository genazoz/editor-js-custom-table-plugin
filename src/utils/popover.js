import * as $ from './dom';

/**
 * @typedef {object} PopoverItem
 * @property {string} label - button text
 * @property {string} icon - button icon
 * @property {boolean} confirmationRequired - if true, a confirmation state will be applied on the first click
 * @property {function} hideIf - if provided, item will be hid, if this method returns true
 * @property {function} activeIf - if provided, item will be active, if this method returns true
 * @property {function} onClick - click callback
 */

/**
 * This cass provides a popover rendering
 */
export default class Popover {
  /**
   * @param {object} options - constructor options
   * @param {PopoverItem[]} options.items - constructor options
   */
  constructor({items}) {
    this.items = items;
    this.extraItems = [];
    this.wrapper = undefined;
    this.itemEls = [];
  }

  /**
   * Set of CSS classnames used in popover
   *
   * @returns {object}
   */
  static get CSS() {
    return {
      popover: 'tc-popover',
      popoverOpened: 'tc-popover--opened',
      item: 'tc-popover__item',
      itemHidden: 'tc-popover__item--hidden',
      itemActive: 'tc-popover__item--active',
      itemConfirmState: 'tc-popover__item--confirm',
      itemIcon: 'tc-popover__item-icon',
      itemLabel: 'tc-popover__item-label'
    };
  }

  itemsRender() {
    this.wrapper.innerHTML = ''

    const items = [...this.items, ...this.extraItems]

    this.itemEls = []

    items.forEach((item, index) => {
      const itemEl = $.make('div', Popover.CSS.item);
      const icon = item.icon
          ? $.make('div', Popover.CSS.itemIcon, {
            innerHTML: item.icon
          })
          : undefined
      const label = $.make('div', Popover.CSS.itemLabel, {
        textContent: item.label
      });

      itemEl.dataset.index = index;

      if(icon) {
        itemEl.appendChild(icon);
      }

      itemEl.appendChild(label);

      this.wrapper.appendChild(itemEl);
      this.itemEls.push(itemEl);
    });
  }

  /**
   * Returns the popover element
   *
   * @returns {Element}
   */
  render() {
    this.wrapper = $.make('div', Popover.CSS.popover);

    this.itemsRender()

    /**
     * Delegate click
     */
    this.wrapper.addEventListener('click', (event) => {
      this.popoverClicked(event);
    });

    return this.wrapper;
  }

  /**
   * Popover wrapper click listener
   * Used to delegate clicks in items
   *
   * @returns {void}
   */
  popoverClicked(event) {
    const clickedItem = event.target.closest(`.${Popover.CSS.item}`);

    /**
     * Clicks outside or between item
     */
    if (!clickedItem) {
      return;
    }

    const clickedItemIndex = clickedItem.dataset.index;
    const item = [...this.items, ...this.extraItems][clickedItemIndex];

    if (item?.confirmationRequired && !this.hasConfirmationState(clickedItem)) {
      this.setConfirmationState(clickedItem);

      return;
    }

    item.onClick();
  }

  /**
   * Enable the confirmation state on passed item
   *
   * @returns {void}
   */
  setConfirmationState(itemEl) {
    itemEl.classList.add(Popover.CSS.itemConfirmState);
  }

  /**
   * Disable the confirmation state on passed item
   *
   * @returns {void}
   */
  clearConfirmationState(itemEl) {
    itemEl.classList.remove(Popover.CSS.itemConfirmState);
  }

  /**
   * Check if passed item has the confirmation state
   *
   * @returns {boolean}
   */
  hasConfirmationState(itemEl) {
    return itemEl.classList.contains(Popover.CSS.itemConfirmState);
  }

  /**
   * Return an opening state
   *
   * @returns {boolean}
   */
  get opened() {
    return this.wrapper.classList.contains(Popover.CSS.popoverOpened);
  }

  /**
   * Opens the popover
   *
   * @returns {void}
   */
  open() {
    const items = [...this.items, ...this.extraItems]

    this.itemsRender()

    /**
     * If item provides 'hideIf()' method that returns true, hide item
     */
    items.forEach(async (item, index) => {
      if (typeof item.hideIf === 'function') {
        const result = await item.hideIf();
        this.itemEls[index].classList.toggle(Popover.CSS.itemHidden, result);
      }
    });

    items.forEach(async (item, index) => {
      if (typeof item.activeIf === 'function') {
        const result = await item.activeIf()

        if(result) {
          if(!this.itemEls[index].classList.contains(Popover.CSS.itemActive)) {
            this.itemEls[index].classList.add(Popover.CSS.itemActive);
          }
        } else {
          this.itemEls[index].classList.remove(Popover.CSS.itemActive);
        }
      }
    });

    this.wrapper.classList.add(Popover.CSS.popoverOpened);
  }

  /**
   * Closes the popover
   *
   * @returns {void}
   */
  close() {
    this.wrapper.classList.remove(Popover.CSS.popoverOpened);
    this.itemEls.forEach(el => {
      this.clearConfirmationState(el);
    });
  }
}
