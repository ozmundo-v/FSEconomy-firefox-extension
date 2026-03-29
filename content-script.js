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
    });
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
