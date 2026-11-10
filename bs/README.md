# Reden Pagal, RMEE: kei-truck portfolio

A scroll-driven 3D portfolio. A kei truck drives a road with five checkpoints (Garage, Workshop, Dev yard, Weighbridge, Depot). Each stop has a themed 3D room, and the page has a full 2D mode for small or low-power devices and reduced-motion users.

It is a plain static site: no framework, no bundler, no build step.

## Deploy on Vercel

**Option A: from GitHub (recommended)**
1. Push this folder to a new GitHub repository.
2. In Vercel choose **Add New > Project**, import the repository.
3. Framework preset: **Other**. Leave Build Command and Output Directory empty. Click **Deploy**.

**Option B: Vercel CLI**
```bash
npm i -g vercel
cd reden-portfolio
vercel          # preview deployment
vercel --prod   # production deployment
```

`vercel.json` already sets caching and basic security headers.

## Run locally

```bash
python3 -m http.server 3000      # or: npm start
# open http://localhost:3000
```
Open it through a local server, not by double-clicking `index.html`, so the relative asset paths load correctly.

## Structure

```
index.html          page markup and all copy (CV text, panels, 2D page)
css/styles.css      styles, themes (light and dark), playful panel look
js/main.js          3D scene, vehicles, rooms, entry sequences, 2D behaviour
assets/             certificate images
vendor/three.min.js three.js r128 (MIT, see vendor/LICENSE-three.txt)
vercel.json         headers and caching
```

## Common edits

- **Text and credentials:** edit `index.html`. Each stop has an outside panel (`.stop`), a 3D room panel (`.inside`), and a section in the 2D page (`#p2d`).
- **Contact email:** search `redenpagal@gmail.com` in `index.html` and `js/main.js` (the `MAIL` constant). Email links copy the address and open a Gmail compose window.
- **Certificates:** replace the images in `assets/` and update the `CERT` paths at the top of the bottom half of `js/main.js`.
- **Checkpoint positions:** `T=[.04,.28,.5,.72,.96]` in `index.html` (`data-t` on each `.stop`) and the building offsets in `js/main.js` (`BS`, `BH`, `BO`).
- **Vehicles and colors:** `BUILD`, `MAIN`, `SEC`, `CARS` in `js/main.js`. Visitors can click the truck to change car and color; the choice is saved in `localStorage`.

## Behaviour notes

- 3D is the default on capable desktops. It starts in 2D on low-end phones (4 cores or fewer, 4 GB memory or less, or narrow screens), when reduced motion is on, or if WebGL is unavailable. A button in the header switches modes.
- Fonts (Bricolage Grotesque, IBM Plex Sans) load from Google Fonts. The page falls back to system fonts if they are blocked.
- `Esc` closes pop-ups and exits a room.

## Credits

- three.js r128, MIT license.
- Built with Claude. Visual direction informed by Awwwards portfolio patterns and strike.uno.
