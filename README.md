# FSEconomy Extension

**Repository:** [github.com/ozmundo-v/FSEconomy-firefox-extension](https://github.com/ozmundo-v/FSEconomy-firefox-extension)

Firefox add-on that adds a few quality-of-life tools on [FSEconomy](https://server.fseconomy.net). It only runs on that site and does not request broad permissions.

## Features

### Airport assignments (`airport.jsp`)

- **Destination filter** — Adds a text field that filters the jobs table by destination (in sync with DataTables where present).
- **Filtered pay total** — Shows a running total of pay for rows that are still visible after filtering.

### My Flight (`myflight.jsp`)

- **SimBrief dispatch** — A *SimBrief dispatch* button on the *Ready to depart* table caption opens [SimBrief](https://www.simbrief.com/system/dispatch.php) in a new tab with fields prefilled from the page:
  - **orig** / **dest** — From the selected ready-to-depart row (if one assignment is checked) or otherwise the first row; ICAO codes come from the Location and Dest columns.
  - **reg** — From the aircraft registration link (`aircraftlog.jsp?id=…`) in the aircraft panel.
  - **pax** — Passenger count from the Payload Chart, *Current Load* row (when the table is present).

This integration uses SimBrief’s dispatch URL query parameters, which align with the same field names described in the [SimBrief API documentation](https://developers.navigraph.com/docs/simbrief/using-the-api) (`orig`, `dest`, `reg`, `pax`, etc.).

## Development

1. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
2. Choose **Load Temporary Add-on…**.
3. Select this project’s `manifest.json`.

After changing scripts, use **Reload** on the extension card or load the manifest again.

### Project layout

| Path | Role |
|------|------|
| `manifest.json` | Extension manifest (Manifest V2) |
| `content-script.js` | Airport page behavior |
| `myflight-script.js` | My Flight page + SimBrief button |
| `background.js` | Optional background script |
| `icons/` | Toolbar icons (`icon-16.png`, `icon-48.png`, `icon-128.png`) — required for a signed build |

## Packaging for AMO

Ship a **zip** that contains only what the browser loads: `manifest.json`, the JS files, and the `icons/` directory. Omit dev-only tooling or local configs if you keep any alongside the project.

Ensure the three icon paths in `manifest.json` exist before upload or validation will fail.
