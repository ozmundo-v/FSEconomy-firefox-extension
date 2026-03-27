(function () {
  const form = document.getElementById('fse-options-form');
  const airlineInput = document.getElementById('airline');
  const fltnumInput = document.getElementById('fltnum');
  const statusEl = document.getElementById('status');

  function restore() {
    browser.storage.local.get({ airline: '', fltnum: '' }).then((stored) => {
      airlineInput.value = stored.airline;
      fltnumInput.value = stored.fltnum;
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusEl.textContent = '';
    const airline = airlineInput.value.trim();
    const fltnum = fltnumInput.value.trim();
    browser.storage.local.set({ airline, fltnum }).then(() => {
      statusEl.textContent = 'Saved.';
      setTimeout(() => {
        statusEl.textContent = '';
      }, 2000);
    });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', restore);
  } else {
    restore();
  }
})();
