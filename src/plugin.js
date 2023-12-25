import Table from './table';
import * as $ from './utils/dom';

import { IconTable, IconTableWithHeadings, IconTableWithoutHeadings } from '@codexteam/icons';

/**
 * @typedef {object} TableConfig - configuration that the user can set for the table
 * @property {number} rows - number of rows in the table
 * @property {number} cols - number of columns in the table
 */
/**
 * @typedef {object} Tune - setting for the table
 * @property {string} name - tune name
 * @property {HTMLElement} icon - icon for the tune
 * @property {boolean} isActive - default state of the tune
 * @property {void} setTune - set tune state to the table data
 */
/**
 * @typedef {object} TableData - object with the data transferred to form a table
 * @property {boolean} withHeading - setting to use cells of the first row as headings
 * @property {string[][]} content - two-dimensional array which contains table content
 */

/**
 * Table block for Editor.js
 */
export default class TableBlock {
  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to press Enter inside the CodeTool textarea
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {TableData} data — previously saved data
   * @param {TableConfig} config - user config for Tool
   * @param {object} api - Editor.js API
   * @param {boolean} readOnly - read-only mode flag
   */
  constructor({data, config, api, readOnly}) {
    this.api = api;
    this.readOnly = readOnly;
    this.config = config;
    this.data = {
      iteratable: config?.contents?.iteratables
          ? Object.keys(config?.contents?.iteratables)[0]
          : undefined,
      withHeadings: this.getConfig('withHeadings', false, data),
      content: data && data.content ? data.content : []
    };
    this.table = null;
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: IconTable,
      title: 'Table'
    };
  }

  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement}
   */
  render() {
    /** creating table */
    this.table = new Table(this.readOnly, this.api, this.data, this.config);

    /** creating container around table */
    this.container = $.make('div', this.api.styles.block);
    this.container.appendChild(this.table.getWrapper());

    this.table.setHeadingsSetting(this.data.withHeadings);

    return this.container;
  }

  /**
   * Returns plugin settings
   *
   * @returns {Array}
   */
  renderSettings() {
    const settings = [
        {
          label: this.api.i18n.t('Headings'),
          icon: IconTableWithHeadings,
          isActive: this.data.withHeadings,
          closeOnActivate: true,
          toggle: true,
          onActivate: () => {
            this.data.withHeadings = !this.data.withHeadings;
            this.table.setHeadingsSetting(this.data.withHeadings);
          }
        },
    ]

    if(this.config?.contents?.iteratables) {
      Object.entries(this.config?.contents?.iteratables).forEach(([key]) => {
        settings.push({
          label: this.api.i18n.t(`Iterate ${key}`),
          icon: IconTableWithoutHeadings,
          isActive: this.data?.iteratable === key,
          closeOnActivate: true,
          onActivate: () => {
            this.data.iteratable = key;
            this.table.setIteratableSetting(this.data.iteratable)
          }
        })
      })
    }

    return settings;
  }
  /**
   * Extract table data from the view
   *
   * @returns {TableData} - saved data
   */
  save() {
    const tableContent = this.table.getData();

    const result = {
      withHeadings: this.data.withHeadings,
      content: tableContent
    };

    return result;
  }

  /**
   * Plugin destroyer
   *
   * @returns {void}
   */
  destroy() {
    this.table.destroy();
  }

  /**
   * A helper to get config value.
   *
   * @param {string} configName - the key to get from the config.
   * @param {any} defaultValue - default value if config doesn't have passed key
   * @param {object} savedData - previously saved data. If passed, the key will be got from there, otherwise from the config
   * @returns {any} - config value.
   */
  getConfig(configName, defaultValue = undefined, savedData = undefined) {
    const data = this.data || savedData;

    if (data) {
      return data[configName] ? data[configName] : defaultValue;
    }

    return this.config && this.config[configName] ? this.config[configName] : defaultValue;
  }

  /**
   * Table onPaste configuration
   *
   * @public
   */
  static get pasteConfig() {
    return { tags: ['TABLE', 'TR', 'TH', 'TD'] };
  }

  /**
   * On paste callback that is fired from Editor
   *
   * @param {PasteEvent} event - event with pasted data
   */
  onPaste(event) {
    const table = event.detail.data;

    /** Check if the first row is a header */
    const firstRowHeading = table.querySelector(':scope > thead, tr:first-of-type th');

    /** Get all rows from the table */
    const rows = Array.from(table.querySelectorAll('tr'));

    /** Generate a content matrix */
    const content = rows.map((row) => {
      /** Get cells from row */
      const cells = Array.from(row.querySelectorAll('th, td'))

      /** Return cells content */
      return cells.map((cell) => cell.innerHTML);
    });

    /** Update Tool's data */
    this.data = {
      withHeadings: firstRowHeading !== null,
      content
    };

    /** Update table block */
    if (this.table.wrapper) {
      this.table.wrapper.replaceWith(this.render());
    }
  }
}
