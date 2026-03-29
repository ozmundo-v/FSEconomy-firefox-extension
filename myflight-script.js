// SimBrief dispatch prefill from My Flight "Ready to depart" assignments.
// Navigraph SimBrief "Using the API" documents orig/dest (and more) for the hosted JS+PHP
// integration; extensions cannot run that PHP. SimBrief's dispatch page accepts
// orig/dest/reg/pax (and similar) as URL query parameters where supported.
(function () {
  const SIMBRIEF_DISPATCH = 'https://www.simbrief.com/system/dispatch.php';
  const METAR_BASE = 'https://metar-taf.com/metar/';
  const NAVIGRAPH_BASE = 'https://charts.navigraph.com/airport/';
  const NAVIGRAPH_QUERY =
    '?informationSection=General&procedureSection=Approaches&section=Proc&chartCategory=ARR&weatherSection=METAR&networksSection=Gates&ATISSection=Real';

  function findReadyTable() {
    const block = document.querySelector('.myflight-assignments--ready');
    return block ? block.querySelector('table.assignmentTable') : null;
  }

  function icaoFromCell(td) {
    if (!td) return '';
    const a = td.querySelector('a[href*="icao="]');
    if (a) {
      const href = a.getAttribute('href') || '';
      const m = href.match(/[?&]icao=([A-Z0-9]{3,4})\b/i);
      if (m) return m[1].toUpperCase();
    }
    const text = td.textContent.replace(/\s+/g, ' ').trim();
    const m = text.match(/\b([A-Z]{3,4})\b/);
    return m ? m[1] : '';
  }

  function getTargetRow(table) {
    const tbody = table.tBodies[0];
    if (!tbody) return null;
    const checked = tbody.querySelector('input.chkbox:checked');
    if (checked) {
      const tr = checked.closest('tr');
      if (tr && tr.cells.length > 4) return tr;
    }
    const rows = tbody.rows;
    for (let i = 0; i < rows.length; i++) {
      const tr = rows[i];
      if (tr.cells.length > 4) return tr;
    }
    return null;
  }

  /** Aircraft registration from My Flight aircraft panel (link text), e.g. aircraftlog.jsp?id=… */
  function registrationFromPage() {
    const scope = document.querySelector('.myflight-aircraft') || document;
    const a = scope.querySelector('a[href*="aircraftlog.jsp"]');
    if (!a) return '';
    const reg = a.textContent.replace(/\s+/g, ' ').trim();
    return reg;
  }

  /**
   * Pax count from Payload Chart → Current Load row (first Pax column is headcount).
   * Table layout: Fuel (3 cols), Pax (count + weight kg), Cargo, Total.
   */
  function passengersFromPayloadChart() {
    const tables = document.querySelectorAll('table');
    for (let i = 0; i < tables.length; i++) {
      const firstTh = tables[i].querySelector('thead tr th');
      if (!firstTh || !/payload\s*chart/i.test(firstTh.textContent)) continue;
      const rows = tables[i].querySelectorAll('tbody tr');
      for (let r = 0; r < rows.length; r++) {
        const tr = rows[r];
        const label = tr.cells[0];
        if (!label || !label.classList.contains('current')) continue;
        if (!/current\s*load/i.test(label.textContent)) continue;
        const paxCell = tr.cells[4];
        if (!paxCell) return '';
        const n = parseInt(paxCell.textContent.replace(/,/g, '').trim(), 10);
        if (!isNaN(n) && n >= 0) return String(n);
        return '';
      }
    }
    return '';
  }

  function openSimBrief(orig, dest, reg, pax, airline, fltnum) {
    const u = new URL(SIMBRIEF_DISPATCH);
    u.searchParams.set('orig', orig);
    u.searchParams.set('dest', dest);
    if (reg) u.searchParams.set('reg', reg);
    if (pax !== '') u.searchParams.set('pax', pax);
    if (airline) u.searchParams.set('airline', airline);
    if (fltnum) u.searchParams.set('fltnum', fltnum);
    window.open(u.toString(), '_blank', 'noopener,noreferrer');
  }

  function openDestMetar(dest) {
    const u = new URL(encodeURIComponent(dest), METAR_BASE);
    window.open(u.toString(), '_blank', 'noopener,noreferrer');
  }

  function addSimBriefControl() {
    const table = findReadyTable();
    if (!table || document.getElementById('fse-simbrief-open') || document.getElementById('fse-dest-metar-open')) return;

    const caption = table.querySelector('caption');
    if (!caption) return;

    const btn = document.createElement('button');
    btn.id = 'fse-simbrief-open';
    btn.type = 'button';
    btn.className = 'btn btn-primary btn-sm';
    btn.style.marginLeft = '12px';
    btn.style.verticalAlign = 'middle';
    btn.style.minWidth = '130px';
    btn.style.fontWeight = '700';
    btn.style.textAlign = 'center';
    btn.textContent = 'SimBrief dispatch';
    btn.title =
      'Open SimBrief with Location → Dest. Uses the checked assignment if one is selected; otherwise the first row.';

    btn.addEventListener('click', function () {
      const row = getTargetRow(table);
      if (!row) {
        window.alert('No ready-to-depart assignments found.');
        return;
      }
      const orig = icaoFromCell(row.cells[2]);
      const dest = icaoFromCell(row.cells[4]);
      if (!orig || !dest) {
        window.alert('Could not read Location or Dest airport codes for this assignment.');
        return;
      }
      const reg = registrationFromPage();
      const pax = passengersFromPayloadChart();
      browser.storage.local.get({ airline: '', fltnum: '' }).then((cfg) => {
        openSimBrief(orig, dest, reg, pax, cfg.airline, cfg.fltnum);
      });
    });

    caption.appendChild(btn);

    const navBtn = document.createElement('button');
    navBtn.id = 'fse-navigraph-open';
    navBtn.type = 'button';
    navBtn.className = 'btn btn-sm';
    navBtn.style.marginLeft = '8px';
    navBtn.style.verticalAlign = 'middle';
    navBtn.style.minWidth = '130px';
    navBtn.style.fontWeight = '700';
    navBtn.style.textAlign = 'center';
    navBtn.textContent = 'Navigraph';
    navBtn.title = 'Open Navigraph Charts in a new tab.';

    navBtn.addEventListener('click', function () {
      const row = getTargetRow(table);
      if (!row) {
        window.alert('No ready-to-depart assignments found.');
        return;
      }
      const dest = icaoFromCell(row.cells[4]);
      if (!dest) {
        window.alert('Could not read destination airport code for this assignment.');
        return;
      }
      const url = `${NAVIGRAPH_BASE}${encodeURIComponent(dest)}${NAVIGRAPH_QUERY}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });

    caption.appendChild(navBtn);

    const metarBtn = document.createElement('button');
    metarBtn.id = 'fse-dest-metar-open';
    metarBtn.type = 'button';
    metarBtn.className = 'btn btn-sm';
    metarBtn.style.marginLeft = '8px';
    metarBtn.style.verticalAlign = 'middle';
    metarBtn.style.minWidth = '130px';
    metarBtn.style.fontWeight = '700';
    metarBtn.style.textAlign = 'center';
    metarBtn.style.color = '#111';
    metarBtn.style.borderColor = '#c56a00';
    metarBtn.style.backgroundImage =
      'repeating-linear-gradient(90deg, #f7941e 0, #f7941e 10px, #ffffff 10px, #ffffff 20px)';
    metarBtn.textContent = 'METAR';
    metarBtn.title =
      'Open destination METAR (metar-taf.com) for the checked assignment destination, or the first row.';

    function refreshMetarButtonLabel() {
      const row = getTargetRow(table);
      const dest = row ? icaoFromCell(row.cells[4]) : '';
      metarBtn.textContent = dest ? `${dest} METAR` : 'METAR';
    }

    metarBtn.addEventListener('click', function () {
      const row = getTargetRow(table);
      if (!row) {
        window.alert('No ready-to-depart assignments found.');
        return;
      }
      const dest = icaoFromCell(row.cells[4]);
      if (!dest) {
        window.alert('Could not read destination airport code for this assignment.');
        return;
      }
      openDestMetar(dest);
    });

    table.addEventListener('change', refreshMetarButtonLabel);
    table.addEventListener('input', refreshMetarButtonLabel);
    table.addEventListener('click', refreshMetarButtonLabel);
    refreshMetarButtonLabel();

    caption.appendChild(metarBtn);
  }

  function tryInit() {
    addSimBriefControl();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }

  const observer = new MutationObserver(addSimBriefControl);
  observer.observe(document.body, { childList: true, subtree: true });
})();
