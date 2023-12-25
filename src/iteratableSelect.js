import Popover from "./utils/popover";
import * as $ from "./utils/dom";
import { IconPlus } from "@codexteam/icons";
/**
 * IteratableSelect is a menu for manipulation of rows/cols
 *
 * It contains toggler and Popover:
 *   <toolbox>
 *     <toolbox-toggler />
 *     <popover />
 *   <toolbox>
 */
export default class IteratableSelect {
  /**
   * Creates toolbox buttons and toolbox menus
   *
   * @param {object} api - Editor.js api
   * @param {PopoverItem[]} items - Editor.js api
   * @param {function} onOpen - callback fired when the Popover is opening
   * @param {function} onClose - callback fired when the Popover is closing
   */
  constructor({ api, items, onOpen, onClose, hasExtraItems }) {
    this.api = api;

    this.items = items;
    this.extraItems = [];
    this.onOpen = onOpen;
    this.hasExtraItems = hasExtraItems;
    this.onClose = onClose;

    this.popover = null;
    this.wrapper = this.createIteratableSelect();
  }

  /**
   * Style classes
   */
  static get CSS() {
    return {
      toolbox: "tc-iteratable-select",
      showed: "tc-iteratable-select--showed",
      active: "tc-iteratable-select--active",
      toggler: "tc-iteratable-select__toggler",
    };
  }

  /**
   * Returns rendered IteratableSelect element
   */
  get element() {
    return this.wrapper;
  }

  /**
   * Creating a toolbox to open menu for a manipulating columns
   *
   * @returns {Element}
   */
  createIteratableSelect() {
    const wrapper = $.make("div", [
      IteratableSelect.CSS.toolbox,
    ]);

    wrapper.dataset.mutationFree = "true";
    const popover = this.createPopover();
    const toggler = this.createToggler();

    wrapper.appendChild(popover);
    wrapper.appendChild(toggler);

    return wrapper;
  }

  /**
   * Creates the Toggler
   *
   * @returns {Element}
   */
  createToggler() {
    const toggler = $.make("div", IteratableSelect.CSS.toggler, {
      innerHTML: IconPlus,
    });

    toggler.addEventListener("click", () => {
      this.togglerClicked();
    });

    return toggler;
  }

  /**
   * Creates the Popover instance and render it
   *
   * @returns {Element}
   */
  createPopover() {
    this.popover = new Popover({
      items: this.items,
    });

    return this.popover.render();
  }

  /**
   * Toggler click handler. Opens/Closes the popover
   *
   * @returns {void}
   */
  togglerClicked() {
    if (this.popover.opened) {
      this.popover.close();
      this.onClose();
    } else {
      this.popover.extraItems = [];

      if(this.hasExtraItems()){
        this.popover.extraItems = this.extraItems;
      }
      this.popover.open();
      this.onOpen();
    }
  }

  /**
   * Shows the IteratableSelect
   *
   * @param {function} computePositionMethod - method that returns the position coordinate
   * @returns {void}
   */
  show(computePositionMethod) {
    const position = computePositionMethod();

    /**
     * Set 'top' or 'left' style
     */
    Object.entries(position).forEach(([prop, value]) => {
      this.wrapper.style[prop] = value;
    });

    this.wrapper.classList.add(IteratableSelect.CSS.showed);
  }

  /**
   * Hides the IteratableSelect
   *
   * @returns {void}
   */
  hide() {
    this.popover.close();
    this.wrapper.classList.remove(IteratableSelect.CSS.showed);
  }
}
