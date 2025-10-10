/**
 * Event Tracker Block
 * Fetches data from a JSON file (Excel export) and displays selected columns in a table
 *
 * USAGE EXAMPLE:
 * Create a table in your Word document with the block name "event-tracker":
 *
 * | Event Tracker |                                                          |
 * |---------------|----------------------------------------------------------|
 * | Source        | /aem-event-tracker-form.json                             |
 * | Columns       | Name, Customer Name, Event Name (if applicable)         |
 * | Filter Past Events | true                                                |
 * | Date Column   | Event End Date                                          |
 * | Time Column   | Event End Time                                          |
 *
 * This will:
 * - Fetch data from the JSON file
 * - Display only the specified columns
 * - Hide past events automatically
 * - Use custom date/time column names
 *
 * Usage in Word document:
 * Create a table with the block name "event-tracker" and configuration:
 *
 * | Event Tracker |                                    |
 * |---------------|------------------------------------|
 * | Source        | /path-to-excel-file.json           |
 * | Columns       | Column1, Column2, Column3          |
 *
 * Or simply:
 * | Event Tracker |
 * |---------------|
 * | /path-to-excel-file.json |
 *
 * If no columns are specified, all columns will be displayed.
 */

import { readBlockConfig } from '../../scripts/aem.js';

/**
 * Converts Excel serial date number to a readable date string
 * @param {string|number} serialDate - Excel serial date number
 * @returns {string} Formatted date string (MM/DD/YYYY)
 */
function formatExcelDate(serialDate) {
  // Excel's epoch starts from 1900-01-01, but with a leap year bug
  // So we need to adjust by subtracting 2 days
  const excelEpoch = new Date(1900, 0, 1);
  const days = parseFloat(serialDate) - 2;
  const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);

  // Format as MM/DD/YYYY
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Checks if a value looks like an Excel serial date
 * @param {string} value - The value to check
 * @returns {boolean} True if it looks like a serial date
 */
function isExcelSerialDate(value) {
  // First check if the value is purely numeric (no letters, special chars except decimal point)
  if (!/^\d+(\.\d+)?$/.test(value.trim())) {
    return false;
  }

  // Check if it's a number between reasonable Excel date range
  const num = parseFloat(value);
  // Excel dates typically range from 1 (1900-01-01) to ~100000 (2173-10-14)
  // We check for integers or numbers with decimal parts (time components)
  return !Number.isNaN(num) && num >= 1 && num < 100000;
}

/**
 * Formats a cell value based on its content
 * @param {string} value - The cell value
 * @returns {string} Formatted value
 */
function formatCellValue(value) {
  if (!value) return '';

  // Check if it's an Excel serial date
  if (isExcelSerialDate(value)) {
    return formatExcelDate(value);
  }

  return value;
}

/**
 * Formats Excel serial date with time
 * @param {string|number} dateValue - Excel serial date
 * @param {string} timeValue - Time string (e.g., "03:00")
 * @returns {string} Formatted date and time string
 */
function formatDateTimeValue(dateValue, timeValue) {
  if (!dateValue) return '';

  const formattedDate = isExcelSerialDate(dateValue) ? formatExcelDate(dateValue) : dateValue;

  if (timeValue && timeValue.trim()) {
    return `${formattedDate} ${timeValue}`;
  }

  return formattedDate;
}

/**
 * Gets the corresponding time column name for a date column
 * @param {string} dateColumn - Date column name
 * @param {Array} allColumns - All available columns
 * @returns {string|null} Time column name or null
 */
function getTimeColumnForDate(dateColumn, allColumns) {
  // If column ends with "Date", look for corresponding "Time" column
  if (dateColumn.endsWith('Date')) {
    const timeColumn = dateColumn.replace(/Date$/, 'Time');
    if (allColumns.includes(timeColumn)) {
      return timeColumn;
    }
  }
  return null;
}

/**
 * Creates a Date object from Excel serial date and time
 * @param {string|number} serialDate - Excel serial date
 * @param {string} timeString - Time string (e.g., "03:00")
 * @returns {Date} JavaScript Date object
 */
function createDateTimeFromExcel(serialDate, timeString) {
  // Convert Excel serial date to JavaScript Date
  const excelEpoch = new Date(1900, 0, 1);
  const days = parseFloat(serialDate) - 2;
  const date = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);

  // Parse time string (format: "HH:MM")
  if (timeString && timeString.match(/^\d{1,2}:\d{2}$/)) {
    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }

  return date;
}

/**
 * Checks if an event is in the past
 * @param {Object} row - Data row object
 * @param {string} dateColumn - Name of the date column
 * @param {string} timeColumn - Name of the time column
 * @returns {boolean} True if the event is in the past
 */
function isEventInPast(row, dateColumn, timeColumn) {
  const dateValue = row[dateColumn];
  const timeValue = row[timeColumn];

  if (!dateValue || !isExcelSerialDate(dateValue)) {
    return false; // If no valid date, don't filter out
  }

  const eventDateTime = createDateTimeFromExcel(dateValue, timeValue);
  const now = new Date();

  return eventDateTime < now;
}

/**
 * Filters out past events from the data
 * @param {Array} data - Array of data objects
 * @param {string} dateColumn - Name of the date column
 * @param {string} timeColumn - Name of the time column
 * @returns {Array} Filtered data array
 */
function filterPastEvents(data, dateColumn, timeColumn) {
  if (!dateColumn || !timeColumn) {
    return data; // If no date/time columns specified, return all data
  }

  return data.filter((row) => !isEventInPast(row, dateColumn, timeColumn));
}

/**
 * Fetches JSON data from the specified URL
 * @param {string} url - The URL to fetch data from
 * @returns {Promise<Object>} The JSON data
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error fetching data:', error);
    return null;
  }
}

// Removed unused function - column widths are now auto-calculated by CSS

/**
 * Determines the data type of a column for sorting
 * @param {Array} data - Array of data objects
 * @param {string} column - Column name
 * @returns {string} Data type: 'date', 'number', 'text'
 */
function getColumnDataType(data, column) {
  if (!data || data.length === 0) return 'text';

  // Check first few non-empty values
  const sampleValues = data
    .map((row) => row[column])
    .filter((value) => value !== null && value !== undefined && value !== '')
    .slice(0, 3);

  if (sampleValues.length === 0) return 'text';

  // Check if all values look like dates (MM/DD/YYYY format)
  const datePattern = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (sampleValues.every((value) => datePattern.test(String(value)))) {
    return 'date';
  }

  // Check if all values look like numbers
  const allNumbers = sampleValues.every((value) => {
    const num = parseFloat(value);
    return !Number.isNaN(num) && Number.isFinite(num);
  });
  if (allNumbers) {
    return 'number';
  }

  return 'text';
}

/**
 * Sorts data by column
 * @param {Array} data - Array of data objects
 * @param {string} column - Column name to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted data array
 */
function sortData(data, column, direction) {
  const dataType = getColumnDataType(data, column);

  return [...data].sort((a, b) => {
    const valueA = a[column] || '';
    const valueB = b[column] || '';

    // Handle empty values
    if (valueA === '' && valueB === '') return 0;
    if (valueA === '') return direction === 'asc' ? 1 : -1;
    if (valueB === '') return direction === 'asc' ? -1 : 1;

    let comparison = 0;

    switch (dataType) {
      case 'date': {
        // Parse dates (MM/DD/YYYY format)
        const dateA = new Date(valueA);
        const dateB = new Date(valueB);
        comparison = dateA - dateB;
        break;
      }

      case 'number':
        // Parse numbers
        comparison = parseFloat(valueA) - parseFloat(valueB);
        break;

      case 'text':
      default:
        // String comparison (case insensitive)
        comparison = String(valueA).toLowerCase().localeCompare(String(valueB).toLowerCase());
        break;
    }

    return direction === 'desc' ? -comparison : comparison;
  });
}

/**
 * Creates a sortable table header
 * @param {string} column - Column name
 * @returns {HTMLElement} The header element
 */
function createSortableHeader(column) {
  const th = document.createElement('th');
  th.textContent = column;
  th.style.cursor = 'pointer';
  th.style.userSelect = 'none';
  th.classList.add('sortable-header');

  // Add sort indicator
  const sortIndicator = document.createElement('span');
  sortIndicator.classList.add('sort-indicator');
  sortIndicator.textContent = ' ↕';
  sortIndicator.style.opacity = '0.5';
  th.appendChild(sortIndicator);

  return th;
}

/**
 * Gets paginated data
 * @param {Array} data - Full data array
 * @param {number} page - Current page number
 * @param {number} itemsPerPage - Items per page
 * @returns {Array} Paginated data
 */
function getPaginatedData(data, page, itemsPerPage) {
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return data.slice(startIndex, endIndex);
}

/**
 * Checks if a date matches today's date
 * @param {string} dateValue - The date value to check
 * @returns {boolean} True if date is today
 */
function isToday(dateValue) {
  if (!dateValue || !isExcelSerialDate(dateValue)) {
    return false;
  }

  const formattedDate = formatExcelDate(dateValue);
  const today = new Date();
  const todayFormatted = `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`;

  return formattedDate === todayFormatted;
}

/**
 * Renders the table body with data
 * @param {HTMLElement} tbody - Table body element
 * @param {Array} data - Data to render
 * @param {Array} columns - Column names to display
 * @param {Array} allColumns - All available column names from data
 */
function renderTableBody(tbody, data, columns, allColumns = []) {
  tbody.innerHTML = '';
  data.forEach((row) => {
    const tr = document.createElement('tr');

    // Check if this row's Event Start Date is today
    const eventStartDateColumn = columns.find((col) => col.toLowerCase().includes('event start date')
      || col.toLowerCase() === 'event start date');

    if (eventStartDateColumn && isToday(row[eventStartDateColumn])) {
      tr.classList.add('today-event');
    }

    columns.forEach((column) => {
      const td = document.createElement('td');

      // Check if this is a date column with a corresponding time column
      const timeColumn = getTimeColumnForDate(column, allColumns);

      if (timeColumn) {
        // Combine date and time
        const dateValue = row[column] || '';
        const timeValue = row[timeColumn] || '';
        td.textContent = formatDateTimeValue(dateValue, timeValue);
      } else {
        // Regular column
        const rawValue = row[column] || '';
        td.textContent = formatCellValue(rawValue);
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

/**
 * Updates sort indicators on headers
 * @param {NodeList} headers - All header elements
 * @param {string} activeColumn - Currently sorted column
 * @param {string} direction - Sort direction
 */
function updateSortIndicators(headers, activeColumn, direction) {
  headers.forEach((header) => {
    const indicator = header.querySelector('.sort-indicator');
    const column = header.textContent.replace(' ↕', '').replace(' ↑', '').replace(' ↓', '');

    if (column === activeColumn) {
      indicator.textContent = direction === 'asc' ? ' ↑' : ' ↓';
      indicator.style.opacity = '1';
      header.classList.add('sorted');
    } else {
      indicator.textContent = ' ↕';
      indicator.style.opacity = '0.5';
      header.classList.remove('sorted');
    }
  });
}

/**
 * Updates pagination controls
 * @param {HTMLElement} container - Container element
 * @param {Object} state - Pagination state
 */
function updatePaginationControls(container, state) {
  const pageNav = container.querySelector('.page-navigation');
  if (!pageNav) return;

  pageNav.innerHTML = '';

  const totalPages = Math.ceil(state.currentData.length / state.itemsPerPage);

  // Previous button
  const prevButton = document.createElement('button');
  prevButton.textContent = '← Previous';
  prevButton.classList.add('pagination-button', 'prev-button');
  prevButton.disabled = state.currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage -= 1;
      const paginatedData = getPaginatedData(
        state.currentData,
        state.currentPage,
        state.itemsPerPage,
      );
      renderTableBody(state.tbody, paginatedData, state.columns, state.allColumns);
      updatePaginationControls(container, state);
    }
  });
  pageNav.appendChild(prevButton);

  // Page info
  const pageInfo = document.createElement('span');
  pageInfo.classList.add('page-info');
  pageInfo.textContent = `Page ${state.currentPage} of ${totalPages}`;
  pageNav.appendChild(pageInfo);

  // Next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next →';
  nextButton.classList.add('pagination-button', 'next-button');
  nextButton.disabled = state.currentPage >= totalPages;
  nextButton.addEventListener('click', () => {
    if (state.currentPage < totalPages) {
      state.currentPage += 1;
      const paginatedData = getPaginatedData(
        state.currentData,
        state.currentPage,
        state.itemsPerPage,
      );
      renderTableBody(state.tbody, paginatedData, state.columns, state.allColumns);
      updatePaginationControls(container, state);
    }
  });
  pageNav.appendChild(nextButton);
}

/**
 * Adds click handlers for sorting
 * @param {HTMLElement} table - Table element
 * @param {HTMLElement} thead - Table head element
 * @param {HTMLElement} tbody - Table body element
 * @param {Array} data - Original data
 * @param {Array} columns - Column names
 * @param {Object} paginationState - Pagination state object
 * @param {HTMLElement} container - Container for pagination controls
 */
function addSortHandlers(table, thead, tbody, data, columns, paginationState, container) {
  const headers = thead.querySelectorAll('.sortable-header');

  headers.forEach((header, index) => {
    header.addEventListener('click', () => {
      const column = columns[index];

      // Determine sort direction
      if (paginationState.sortColumn === column) {
        paginationState.sortDirection = paginationState.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        paginationState.sortDirection = 'asc';
      }
      paginationState.sortColumn = column;

      // Update sort indicators
      updateSortIndicators(headers, column, paginationState.sortDirection);

      // Sort data
      const sortedData = sortData(data, column, paginationState.sortDirection);
      paginationState.currentData = sortedData;
      paginationState.currentPage = 1; // Reset to first page after sorting

      // Render paginated sorted data
      const paginatedData = getPaginatedData(
        sortedData,
        paginationState.currentPage,
        paginationState.itemsPerPage,
      );
      renderTableBody(tbody, paginatedData, columns, paginationState.allColumns);

      // Update pagination controls
      if (container) {
        updatePaginationControls(container, paginationState);
      }
    });
  });
}

/**
 * Creates pagination controls
 * @param {HTMLElement} container - Container element
 * @param {Object} state - Pagination state
 * @param {Array} data - Full data array
 * @param {Array} columns - Column names
 * @param {HTMLElement} tbody - Table body element
 */
function createPaginationControls(container, state, data, columns, tbody) {
  const paginationDiv = document.createElement('div');
  paginationDiv.classList.add('pagination-controls');

  // Items per page selector
  const itemsPerPageDiv = document.createElement('div');
  itemsPerPageDiv.classList.add('items-per-page');

  const label = document.createElement('span');
  label.textContent = 'Items per page: ';
  itemsPerPageDiv.appendChild(label);

  const select = document.createElement('select');
  select.classList.add('items-per-page-select');
  [10, 25, 50, 100].forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    if (value === state.itemsPerPage) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  select.addEventListener('change', (e) => {
    state.itemsPerPage = parseInt(e.target.value, 10);
    state.currentPage = 1; // Reset to first page
    const paginatedData = getPaginatedData(
      state.currentData,
      state.currentPage,
      state.itemsPerPage,
    );
    renderTableBody(tbody, paginatedData, columns, state.allColumns);
    updatePaginationControls(container, state);
  });

  itemsPerPageDiv.appendChild(select);
  paginationDiv.appendChild(itemsPerPageDiv);

  // Page navigation
  const pageNav = document.createElement('div');
  pageNav.classList.add('page-navigation');
  paginationDiv.appendChild(pageNav);

  container.appendChild(paginationDiv);

  // Initial update
  updatePaginationControls(container, state);

  // Store references for updates
  state.tbody = tbody;
  state.columns = columns;
}

/**
 * Creates a table from the JSON data
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column names to display (optional)
 * @param {HTMLElement} container - Container element for pagination controls
 * @returns {HTMLTableElement} The table element
 */
function createTable(data, columns = null, container = null) {
  const table = document.createElement('table');
  table.classList.add('event-tracker-table');

  if (!data || data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.textContent = 'No data available';
    tr.appendChild(td);
    table.appendChild(tr);
    return table;
  }

  // Get all available columns from data
  const allColumns = Object.keys(data[0]);

  // Determine which columns to display
  let displayColumns = columns && columns.length > 0
    ? columns
    : allColumns;

  // Filter out Time columns that have corresponding Date columns
  displayColumns = displayColumns.filter((column) => {
    // If this is a Time column, check if there's a corresponding Date column
    if (column.endsWith('Time')) {
      const dateColumn = column.replace(/Time$/, 'Date');
      // Hide Time column if Date column exists in display columns
      return !displayColumns.includes(dateColumn);
    }
    return true;
  });

  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  displayColumns.forEach((column) => {
    const th = createSortableHeader(column);
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  tbody.classList.add('sortable-tbody');

  // Store original data on the table for sorting and pagination
  table.dataset.originalData = JSON.stringify(data);
  table.dataset.displayColumns = JSON.stringify(displayColumns);
  table.dataset.allColumns = JSON.stringify(allColumns);

  // Find "Event Start Date" column for default sorting
  const eventStartDateColumn = displayColumns.find((col) =>
    col.toLowerCase().includes('event start date') || col === 'Event Start Date');

  // Apply default sorting if Event Start Date column exists
  let sortedData = data;
  if (eventStartDateColumn) {
    sortedData = sortData(data, eventStartDateColumn, 'asc');
  }

  // Initialize pagination state
  const paginationState = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: data.length,
    currentData: sortedData,
    sortColumn: eventStartDateColumn || null,
    sortDirection: 'asc',
    allColumns,
  };

  // Render initial page
  const paginatedData = getPaginatedData(
    sortedData,
    paginationState.currentPage,
    paginationState.itemsPerPage,
  );
  renderTableBody(tbody, paginatedData, displayColumns, allColumns);
  table.appendChild(tbody);

  // Add click handlers for sorting (with pagination support)
  // Pass original data to sort handlers so re-sorting works correctly
  addSortHandlers(table, thead, tbody, data, displayColumns, paginationState, container);

  // Update sort indicators to show initial sort
  if (eventStartDateColumn) {
    const headers = thead.querySelectorAll('.sortable-header');
    updateSortIndicators(headers, eventStartDateColumn, 'asc');
  }

  // Create pagination controls if container is provided
  if (container) {
    createPaginationControls(container, paginationState, sortedData, displayColumns, tbody);
  }

  return table;
}

/**
 * Decorates the event tracker block
 * @param {Element} block - The block element
 */
export default async function decorate(block) {
  // Read block configuration
  const config = readBlockConfig(block);

  // Get source URL - can be from config or from first cell
  let sourceUrl = config.source;

  // If no source in config, try to get it from the block content (simple format)
  if (!sourceUrl) {
    // In simple format, the first div contains the URL
    const firstCell = block.querySelector(':scope > div > div');
    sourceUrl = firstCell ? firstCell.textContent.trim() : '';
  }

  // Get columns to display (comma-separated list)
  let columnsToDisplay = null;
  if (config.columns) {
    columnsToDisplay = config.columns
      .split(',')
      .map((col) => col.trim())
      .filter((col) => col);
  }

  // Get filtering configuration
  const shouldFilterPastEvents = config['filter-past-events'] !== 'false'; // Default to true
  const dateColumn = config['date-column'] || 'Event End Date';
  const timeColumn = config['time-column'] || 'Event End Time';

  // Clear the block
  block.innerHTML = '';

  // Validate source URL
  if (!sourceUrl) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('event-tracker-error');
    errorDiv.textContent = 'Error: No data source specified. Please provide a Source URL in the block configuration.';
    block.appendChild(errorDiv);
    return;
  }

  // Show loading state
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('event-tracker-loading');
  loadingDiv.textContent = `Loading data from: ${sourceUrl}`;
  block.appendChild(loadingDiv);

  // Fetch and display data
  const jsonData = await fetchData(sourceUrl);

  // Remove loading state
  block.removeChild(loadingDiv);

  if (!jsonData) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('event-tracker-error');
    errorDiv.textContent = `Error loading data from: ${sourceUrl}`;
    block.appendChild(errorDiv);
    return;
  }

  // Extract data array from JSON
  let data = jsonData.data || jsonData;

  if (!Array.isArray(data)) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('event-tracker-error');
    errorDiv.textContent = 'Invalid data format: expected an array';
    block.appendChild(errorDiv);
    return;
  }

  // Filter out past events if enabled
  if (shouldFilterPastEvents) {
    data = filterPastEvents(data, dateColumn, timeColumn);
  }

  // Create and append table with pagination
  const table = createTable(data, columnsToDisplay, block);
  block.appendChild(table);
}
