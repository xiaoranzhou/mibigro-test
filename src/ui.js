
export function createTable(headers, rows, onFilter) {
  const table = document.createElement('table');
  table.className = 'table table-striped table-hover';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header.label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const searchRow = document.createElement('tr');
  headers.forEach(header => {
    const searchTh = document.createElement('th');
    if (header.searchable) {
      const searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = `Search ${header.label}`;
      searchInput.className = 'form-control form-control-sm';
      searchInput.addEventListener('input', debounce(e => {
        onFilter(header.key, e.target.value);
      }, 150));
      searchTh.appendChild(searchInput);
    } else {
        searchTh.innerHTML = '&nbsp;';
    }
    searchRow.appendChild(searchTh);
  });
  thead.appendChild(searchRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  rows.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.innerHTML = row[header.key];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  return table;
}

export function applyFilter(table, filters, headers) {
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  rows.forEach(row => {
    let visible = true;
    for (const key in filters) {
      const filterValue = filters[key].toLowerCase();
      if (filterValue) {
        const columnIndex = getColumnIndex(headers, key);
        if (columnIndex > -1) {
            const cell = row.querySelector(`td:nth-child(${columnIndex + 1})`);
            if (cell) {
                const cellValue = cell.textContent.toLowerCase();
                if (!cellValue.includes(filterValue)) {
                    visible = false;
                    break;
                }
            }
        }
      }
    }
    row.style.display = visible ? '' : 'none';
  });
}

function getColumnIndex(headers, key) {
  return headers.findIndex(h => h.key === key);
}


// Placeholder for search functionality
export function debounce(func, delay) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
}

// Placeholder for sort functionality
export function sortTable(table, column, asc = true) {
  // to be implemented
}
