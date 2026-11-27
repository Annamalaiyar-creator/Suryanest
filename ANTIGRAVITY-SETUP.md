# Suryanest — Antigravity local setup

This export contains every tracked file from the original project, unchanged.
Original commit: eedc7bf552db3570200f9cb65b177e5a371b8db2

## Open and run
1. Extract the ZIP and open the `Suryanest` folder in Antigravity IDE.
2. Install Node.js 22.13.0 or newer (the project package.json requirement).
3. In Antigravity's terminal, from the Suryanest folder, run:

```sh
npm run install:ci
npm run dev
```

Open the local URL printed in the terminal (normally http://localhost:5173).
The project uses React/TypeScript, Tailwind CSS, and Vinext/Vite with Cloudflare Worker support. Keep all included scripts and configuration files.

## Local enquiry form database
The public pages can be edited locally. To test successful enquiry submissions, initialise a separate local D1 database:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_zippy_gauntlet.sql
npm start
```

Apply that migration once to a fresh local database. These commands use local storage. See README.md and README-SURYANEST.md for the original project documentation.

## Files and export scope
- All original tracked source, components, routes, CSS, assets, configuration files, migrations, package.json, package-lock.json and vendored licenses are included.
- node_modules and generated build output are recreated by installation/build commands.
- Live enquiry records, uploaded support photographs, hosted secrets and Git credentials are not part of the source export.
- No site source was changed, pushed or redeployed during this export.
- The project was not installed or launched in this export environment; the local commands are taken from the original project scripts and documentation.
