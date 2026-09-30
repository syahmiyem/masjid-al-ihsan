# Masjid Al-Ihsan website

Website for Masjid Al-Ihsan, Felda Sg Panching Selatan, Kuantan. Malay-language, mobile-first, built for
older visitors.

**The project plan and single source of truth is [docs/plan.md](docs/plan.md).** Update its Decision
Register (Section 12) before changing anything it covers.

| Part                                                     | Tech                        | Where it runs                                                 |
| -------------------------------------------------------- | --------------------------- | ------------------------------------------------------------- |
| Public site (`apps/web`)                                 | Astro, static output        | Cloudflare Workers static assets, built by **Workers Builds** |
| Admin / CMS (`apps/studio`)                              | Sanity Studio               | `<host>.sanity.studio`                                        |
| Prayer times (`scripts/waktu-solat`, `data/waktu-solat`) | Node script + JAKIM e-Solat | Run locally, committed; checked on every build                |
| Donation details (`config/derma`)                        | JSON + QR image in Git      | Two-person review via `CODEOWNERS`                            |

**No GitHub Actions** (plan D-76). Checks run locally before every push (`.githooks/pre-push`) and again in
Cloudflare Workers Builds before every deploy.

## Requirements

- Node 22.18+ (see `.nvmrc`); pnpm 11 (`corepack enable` or `brew install pnpm`)
- Keep the repo on an APFS/ext4 disk. **exFAT drives break pnpm** (no symlinks).

## Everyday commands

```sh
pnpm install             # also turns on the pre-push hook
pnpm dev                 # site at http://localhost:4321
pnpm studio              # Studio at http://localhost:3333
pnpm studio:deploy       # deploy hosted Studio (not `pnpm --filter studio deploy`, a pnpm built-in)
pnpm check               # type-check scripts, site and Studio
pnpm test                # unit tests (prayer-time parsing/validation)
pnpm format              # Prettier
pnpm build               # build the site into apps/web/dist
pnpm --filter web preview    # serve dist/ locally with Wrangler (same as Cloudflare)
pnpm waktu-solat:sync    # fetch/validate prayer times into data/waktu-solat/
pnpm ci:build            # everything Workers Builds runs before deploying
```

Copy `.env.example` to `apps/web/.env` and `apps/studio/.env` for local settings.

## Environments (plan 9.6)

|                     | Address                                                      | Mode                                                                                |
| ------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| UAT (until go-live) | `https://masjid-al-ihsan.<subdomain>.workers.dev`            | `UAT_MODE` unset/`true`: "Laman Percubaan" banner, `noindex`, `robots.txt` Disallow |
| Branch preview      | preview URL shown in the Cloudflare build log / GitHub check | same as UAT                                                                         |
| Production          | custom domain                                                | `UAT_MODE=false`                                                                    |

`UAT_MODE` defaults to **true**. It is only turned off at go-live.

## One-time setup

### 1. Cloudflare: connect the repo (Workers Builds)

Log in to the mosque's Cloudflare account (you can use your own login once it's invited as Administrator).

1. **Workers & Pages** → **Create application** → **Import a repository** → connect GitHub and allow the
   Cloudflare app access to `syahmiyem/masjid-al-ihsan` only.
2. Settings:

   | Setting                              | Value                                                                                                                 |
   | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
   | Project / Worker name                | `masjid-al-ihsan` (must match `apps/web/wrangler.jsonc`)                                                              |
   | Production branch                    | `main`                                                                                                                |
   | Root directory                       | `/` (repo root)                                                                                                       |
   | Build command                        | `pnpm install --frozen-lockfile && pnpm ci:build`                                                                     |
   | Deploy command                       | `pnpm ci:deploy`                                                                                                      |
   | Non-production branch deploy command | `pnpm ci:preview`                                                                                                     |
   | Build variables                      | `NODE_VERSION` = `22.23.1`, `PNPM_VERSION` = `11.1.2`, `SITE_URL` = `https://masjid-al-ihsan.<subdomain>.workers.dev` |

   Do **not** set `UAT_MODE` until go-live. Enable builds for non-production branches so branches and PRs get
   preview URLs.

3. After the first build, open the `workers.dev` URL and check that the yellow "Laman Percubaan" banner shows.
   Then fill in the real subdomain in `SITE_URL` and retry the build.
4. **Settings → Builds → Deploy hooks:** create a hook for `main` named `sanity-publish`. Keep the URL secret:
   anyone who has it can trigger a build.

### 2. Sanity: project, datasets, Studio

1. At [sanity.io/manage](https://www.sanity.io/manage) (mosque email): create project **Masjid Al-Ihsan**
   with dataset `production` (public). Then add a second dataset, `latihan`.
2. **Members:** invite your own login as Administrator.
3. Project ID **`1xd617ey`** is already the default in `apps/studio/sanity.config.ts` and
   `sanity.cli.ts`. It isn't secret. Use `apps/studio/.env` only to override it, e.g. `SANITY_STUDIO_DATASET=latihan`.

4. Run `pnpm studio`, open http://localhost:3333, sign in, and accept the CORS prompt for `localhost:3333`.
5. Deploy the hosted Studio: `pnpm --filter studio exec sanity login`, then `pnpm studio:deploy`.
   It will be at `https://masjid-al-ihsan.sanity.studio`. Paste the `appId` it prints into
   `apps/studio/sanity.cli.ts` (`deployment.appId`).
6. **API → Webhooks** (once there is content, Phase 1–2): `POST` to the Cloudflare deploy hook URL, dataset
   `production`, triggered on create/update/delete. No GitHub token is needed.

### 3. GitHub repository settings

- Ruleset on `main`: pull request required (0 approvals), **review from Code Owners required**, no
  bypass. Code owners get an automatic review request (email) for any PR touching `config/derma/`.
- Code owners (Bendahari, Pengerusi) should **Watch** the repo, so they are also notified of merges.

## Changing donation details (plan 4.9)

1. The Bendahari checks the new details against a bank letter in the mosque's name.
2. Open a pull request changing `config/derma/derma.json` and `config/derma/duitnow-qr.png`.
3. A second code owner reviews and approves it; then merge.
4. After deploy, two people scan the live QR with two different banking apps and confirm the recipient name.

## Prayer times (plan 4.8)

Source: JAKIM e-Solat, zone set in `config/site.json` (`PHG02`). The site reads only the committed files in
`data/waktu-solat/`. It never calls e-Solat at runtime.

- Every build re-validates the current year's file and **fails** if it is missing or invalid. A failed build
  leaves the previous deploy live.
- **Every December:** run `pnpm waktu-solat:sync` once JAKIM publishes next year's data, and merge the PR.
  Builds in December print a warning until the file exists.

## Scheduled jobs (Phase 2, not built yet)

A small Cloudflare Worker with cron triggers (`workers/jadual`) will replace the scheduled GitHub workflows:

- nightly rebuild at 00:05 MYT (calls the deploy hook)
- weekly e-Solat check (alerts if JAKIM's data differs from the committed data)
- weekly Sanity export to a private R2 bucket
