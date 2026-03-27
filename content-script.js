// Inject search box and filter table
(function() {
  function addSearchBox() {
    const wrapper = document.getElementById('jobTable_wrapper');
    if (!wrapper) return;
    if (document.getElementById('fse-search-box')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'fse-search-box';
    input.placeholder = 'Filter Destination...';
    input.style.marginRight = '10px';
    input.style.display = 'inline-block';
    input.style.width = '250px';
    input.className = 'form-control input-sm';

    if (wrapper) {
      const addButton = document.querySelector('#addSelectedButton');
      const parentDiv = addButton ? addButton.parentElement : null;
      if (parentDiv) {
        parentDiv.insertBefore(input, addButton);
        const selectSpan = parentDiv.querySelector('span');
        if (selectSpan && selectSpan.innerHTML.includes('Select All') && selectSpan.innerHTML.includes('De-Select')) {
          const links = selectSpan.querySelectorAll('a');
          links.forEach(link => {
            link.classList.add('btn', 'btn-primary');
          });
          parentDiv.insertBefore(selectSpan, input.nextSibling);
        }
      }
    }

    // Helper to format as currency
    function formatCurrency(num) {
      return num.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    }

    // Insert filtered pay total after the (Filtered from X Total Entries) text
    function updateFilteredPayTotal() {
      const infoDiv = wrapper.querySelector('.dataTables_info');
      if (!infoDiv) return;

      // Remove any previous total
      let totalSpan = infoDiv.querySelector('.fse-pay-total');
      if (totalSpan) totalSpan.remove();

      // Find the table and visible rows
      const table = wrapper.querySelector('table');
      if (!table) return;
      const rows = Array.from(table.tBodies[0].rows).filter(row => row.style.display !== 'none');

      // Pay column is now the 2nd column (index 1)
      let total = 0;
      rows.forEach(row => {
        const cell = row.cells[1];
        if (cell) {
          // Remove non-numeric chars (like $ and ,)
          const val = parseFloat(cell.textContent.replace(/[^0-9.-]+/g, ''));
          
          if (!isNaN(val)) total += val;
        }
      });

      // Add the total after the info text
      totalSpan = document.createElement('span');
      totalSpan.className = 'fse-pay-total';
      totalSpan.style.marginLeft = '15px';
      totalSpan.style.fontWeight = 'bold';
      totalSpan.textContent = `Filtered Total Pay: ${formatCurrency(total)}`;
      infoDiv.appendChild(totalSpan);
    }

    input.addEventListener('input', function() {
      const filter = input.value.toLowerCase();
      const jobTableInput = document.querySelector('input[aria-controls="jobTable"]');
      if (jobTableInput) {
        jobTableInput.value = input.value;
        jobTableInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const table = wrapper.querySelector('table');
      if (!table) return;
      const rows = table.tBodies[0].rows;
      for (let row of rows) {
        const cell = row.cells[3];
        if (cell && cell.textContent.toLowerCase().includes(filter)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      }
      updateFilteredPayTotal();
    });

    // Also update pay total on load
    setTimeout(updateFilteredPayTotal, 500);
  }

  function tryInit() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      addSearchBox();
    } else {
      document.addEventListener('DOMContentLoaded', addSearchBox);
    }
  }

  // Also observe for dynamic table loading
  const observer = new MutationObserver(addSearchBox);
  observer.observe(document.body, { childList: true, subtree: true });

  tryInit();
})();
