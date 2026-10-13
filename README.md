# PackingList

PackingList is a mobile-first progressive web app (PWA) for planning trips and
keeping track of what to pack. Create a list from scratch, start with a
destination-style template, browse seasonal suggestions, or use the offline
packing assistant to generate an editable list.

Lists are saved locally in the browser, so no account is required. Data stays
on the device and is not automatically synchronized between devices.

## Ownership

This project is owned and maintained by [RamonaTa](https://github.com/RamonaTa).

## Install on a mobile device

Deploy the app to an HTTPS host, such as Netlify, then open its URL on your
phone:

- **iPhone:** Open the URL in Safari, tap **Share**, then **Add to Home Screen**.
- **Android:** Open the URL in Chrome, open the menu, then choose **Install app**
  or **Add to Home screen**.

The installed app opens in a standalone window. The service worker caches the
app shell for offline use after the app has been loaded.

## Development

Install dependencies and start the local development server:

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200). The development server
reloads the app when source files change.

## Build

Create a production build:

```bash
npm run build
```

The static site output is written to `dist/packing-list/browser`.

## Tests

Run the unit tests once:

```bash
npm test -- --watch=false
```

## Deployment

Netlify can build the app directly from the connected GitHub repository with:

- **Build command:** `npm run build`
- **Publish directory:** `dist/packing-list/browser`

The `public/_redirects` file configures the fallback needed for direct visits
and page refreshes on Angular routes.
