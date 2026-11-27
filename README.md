# Netradaan: Corneal Eye Donation Awareness and Donor Pledge Card Registry

**Course:** CSE326  
**Student:** _Your Name_ | **Roll No:** _Your Roll No_ | **Section:** _Your Section_

A responsive, interactive frontend web app that spreads awareness about corneal eye donation and lets people pledge their eyes and get an instant donor card.

## Features

1. **Myth-busting quiz** – 8 questions (e.g. "Does eye donation disfigure the face? No") with instant explanations and a final score.
2. **Online corneal donation pledge form** – Donor name, age, blood group, phone and two emergency family contacts, with full validation.
3. **Instant eye donor card** – Unique registration ID (`NDR-YYYY-XXXXXX`), printable card preview, copy-ID button, and a searchable pledge registry stored in the browser.
4. **24/7 eye bank hotline directory** – One-click `tel:` call buttons, a 6-hour collection countdown timer and first-response steps.

## Tech stack

- HTML5
- CSS3 (Flexbox, Grid, media queries, print styles)
- Vanilla JavaScript (DOM, `localStorage`, `setInterval`)

No frameworks, no build step, no backend.

## Project structure

```
index.html   page structure
style.css    styling, responsive layout, print rules
script.js    quiz, form validation, card generator, registry, hotline, timer
```

## Run locally

Open the folder in VS Code and either double-click `index.html`, or use the **Live Server** extension and click *Go Live*.

## Live demo (GitHub Pages)

Repo **Settings → Pages → Branch: `main` / root → Save**. The site appears at  
`https://<your-username>.github.io/<repo-name>/`

## Note on hotline numbers

Entries marked **Demo** in `script.js` (`HOTLINES` array) are placeholders. Replace them with verified local eye bank numbers before real use.

## Disclaimer

For awareness and academic purposes only. Not a medical service. Pledges are stored only in the user's own browser.
