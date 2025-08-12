## MyMomentum – personlig aktivitetsdashbord

En enkel nettside som viser vær og lar deg logge turene dine (løp, sykkel, fjelltur). Alt lagres i nettleseren – ingen konto, ingen server.

### Hva kan du gjøre?

- Se vær for Bergen (neste 8 timer): ikon, temperatur og vind.
- Logge aktiviteter via et lett skjema: start/slutt, distanse, dato, sted og notat.
- Automatisk varighet (beregnes fra start/slutt) og vær knyttet til valgt tidspunkt.
- Bla til «Activities»-siden for å se kort med alle økter.
- Merk favoritter (stjerne) og slett aktiviteter.
- Filtrer på aktivitetstype og vær, sorter på dato/varighet/distanse, eller vis bare favoritter.
- «Reset Activities» tilbakestiller alt til eksemplene.

### Slik bruker du

1. Åpne `index.html` i nettleseren (evt. via GitHub Pages).
2. Klikk Bike/Run/Hike eller «Get started» for å åpne skjemaet.
3. Fyll inn feltene. Dato velges med kalender; varighet regnes automatisk.
4. Lagre. Aktiviteten dukker opp på «Activities»-siden.
5. På «Activities»: bruk filter/sortering, stjernemarkering (favoritt) og søppelbøtte (slett). «Reset Activities» sletter alt lagret og gjenoppretter demo-data.

### Teknologi

- Ren HTML/CSS/JavaScript (ES-moduler).
- Værdata fra Open‑Meteo.
- Font Awesome 7 for ikoner + egne SVG-er for vær.
- Flatpickr for datovelger.
- `localStorage` er eneste datalager (nøkkel: `userActivities`).

### Mappestruktur (kort)

- `index.html` – forsiden (vær + logger)
- `script.js` – vær, modal, lagring, hjelpefunksjoner
- `workouts.js` – eksempelaktiviteter (seed)
- `activites/activites.html|.js|.css` – aktivitetsliste, filter, favoritt, slett
- `weathercodes.js` – mapping av værkode → ikon
- `icons/` og `img/` – grafikk

### Kjør lokalt

Prosjektet trenger ingen build. Åpne filene direkte, eller kjør via en enkel statisk server (f.eks. VS Code «Live Server») for å unngå nettleser-restriksjoner rundt ES‑moduler.

### Personvern

Alt lagres lokalt i din nettleser. Ingen sporing eller eksterne databaser. «Reset Activities» fjerner `userActivities` fra `localStorage`.

### Krediteringer

- Vær: Open‑Meteo
- Ikoner: Font Awesome + egne SVG-er
- Bilder: Unsplash (se `img/`)
