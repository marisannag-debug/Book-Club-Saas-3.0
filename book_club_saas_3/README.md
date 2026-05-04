# BookClub Pro — Local setup

Development steps (local):

```powershell
npm install
npm run dev
```

Run unit tests (if dev deps installed):

```powershell
npm run test
```

Environment variables: see `.env.example` (create from `.env.example` if needed).

Troubleshooting / Windows notes:

- If you see permission errors like `EPERM` when installing, stop any running Node processes and remove `node_modules`, then reinstall:

```powershell
cd book_club_saas_3
# stop running node processes (use with care)
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm install
```

- If you encounter peer-dependency resolution errors, try:

```powershell
npm install --legacy-peer-deps
```

- If Next/Turbopack complains about workspace root ("inferred your workspace root"), a project-local `next.config.js` is included to set the turbopack root. Ensure you run `npm run dev` from the `book_club_saas_3` folder.

Run the dev server and open http://localhost:3000

