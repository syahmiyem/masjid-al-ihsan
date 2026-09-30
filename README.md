# Masjid Al-Ihsan website

Website for Masjid Al-Ihsan, Felda Sg Panching Selatan, Kuantan. Malay-language, mobile-first, built for
older visitors.

**The project plan and single source of truth is [docs/plan.md](docs/plan.md).** Update its Decision
Register (Section 12) before changing anything it covers.

| Part                                                     | Tech                        | Where it runs                      |
| -------------------------------------------------------- | --------------------------- | ---------------------------------- |
| Public site (`apps/web`)                                 | Astro, static output        | Cloudflare Workers static assets   |
| Admin / CMS (`apps/studio`)                              | Sanity Studio               | `<host>.sanity.studio`             |
| Prayer times (`scripts/waktu-solat`, `data/waktu-solat`) | Node script + JAKIM e-Solat | GitHub Actions (weekly)            |
| Donation details (`config/derma`)                        | JSON + QR image in Git      | Two-person review via `CODEOWNERS` |

## Requirements

- Node 22.18+ (see `.nvmrc`); pnpm 11 (`corepack enable` or `brew install pnpm`)
- Keep the repo on an APFS/ext4 disk. **exFAT drives break pnpm** (no symlinks).

## Everyday commands

```sh
pnpm install
pnpm dev                 # site at http://localhost:4321
pnpm studio              # Studio at http://localhost:3333 (needs apps/studio/.env)
pnpm check               # type-check scripts, site and Studio
pnpm test                # unit tests (prayer-time parsing/validation)
pnpm format              # Prettier
pnpm build               # build the site into apps/web/dist
pnpm --filter web preview    # serve dist/ locally with Wrangler (same as Cloudflare)
pnpm waktu-solat:sync    # fetch/validate prayer times into data/waktu-solat/
```

Copy `.env.example` to `apps/web/.env` and `apps/studio/.env` for local settings.

## Environments (plan 9.6)

|                     | Address                                                  | Mode                                                                        |
| ------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------- |
| UAT (until go-live) | `https://masjid-al-ihsan.<subdomain>.workers.dev`        | `UAT_MODE=true`: "Laman Percubaan" banner, `noindex`, `robots.txt` Disallow |
| PR preview          | `https://pr-<n>-masjid-al-ihsan.<subdomain>.workers.dev` | same as UAT                                                                 |
| Production          | custom domain                                            | `UAT_MODE=false`                                                            |

`UAT_MODE` defaults to **true**. It is only turned off at go-live, by setting the repo variable.

## GitHub setup

### Secrets (Settings → Secrets and variables → Actions → Secrets)

| Name                    | Value                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`  | **Account-owned** API token on the mosque's Cloudflare account: _Workers Scripts: Edit_, _Account Settings: Read_, plus _Workers R2 Storage: Edit_ for backups |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID                                                                                                                                          |
| `SANITY_AUTH_TOKEN`     | Sanity **project** (robot) token, Editor role (Studio deploy, backups)                                                                                         |

### Variables (… → Variables)

| Name                 | Example                                           |
| -------------------- | ------------------------------------------------- |
| `SITE_URL`           | `https://masjid-al-ihsan.<subdomain>.workers.dev` |
| `UAT_MODE`           | _(leave unset until go-live, then `false`)_       |
| `SANITY_PROJECT_ID`  | from sanity.io/manage                             |
| `SANITY_STUDIO_HOST` | `masjid-al-ihsan`                                 |
| `DERMA_NOTIFY`       | `@bendahari-handle @pengerusi-handle`             |
| `BACKUP_BUCKET`      | `masjid-al-ihsan-backups` (private R2 bucket)     |

Workflows skip themselves with a notice until their secrets exist.

### Repository settings

- **Branch protection on `main`:** require a pull request (0 approvals), **require review from Code
  Owners**, and **do not allow bypassing** (include administrators). Required status checks are left off,
  so the Waktu Solat bot can merge data updates. CI still runs on every PR.
- **Actions → General → Workflow permissions:** allow GitHub Actions to create and approve pull requests
  (for the Waktu Solat bot).

## Workflows

| Workflow                 | When                                                                                              | What                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `ci.yml`                 | PRs, pushes to `main`                                                                             | format, type-check, tests, builds; PR preview URL                           |
| `deploy.yml`             | push to `main`, Sanity publish (`repository_dispatch: sanity-publish`), nightly 00:05 MYT, manual | build + `wrangler deploy`                                                   |
| `studio-deploy.yml`      | changes under `apps/studio`                                                                       | `sanity deploy`                                                             |
| `waktu-solat-sync.yml`   | Mondays 04:00 MYT, manual                                                                         | fetch JAKIM e-Solat → validate → bot PR → deploy; opens an issue on failure |
| `derma-change-alert.yml` | any change to `config/derma/`                                                                     | PR warning + issue to `DERMA_NOTIFY`                                        |
| `backup.yml`             | Sundays 03:00 MYT, manual                                                                         | Sanity export → private R2 bucket                                           |

### Sanity publish → rebuild

In sanity.io/manage → API → Webhooks, add a webhook that POSTs to
`https://api.github.com/repos/<owner>/<repo>/dispatches` with body `{"event_type":"sanity-publish"}` and
headers `Authorization: Bearer <fine-grained GitHub token with Contents: read & write on this repo>` and
`Accept: application/vnd.github+json`.

## Changing donation details (plan 4.9)

1. The Bendahari checks the new details against a bank letter in the mosque's name.
2. Open a pull request changing `config/derma/derma.json` and `config/derma/duitnow-qr.png`.
3. A second code owner reviews and approves it; then merge.
4. After deploy, two people scan the live QR with two different banking apps and confirm the recipient name.

## Prayer times (plan 4.8)

Source: JAKIM e-Solat, zone set in `config/site.json` (`PHG02`). The site reads only the committed files in
`data/waktu-solat/`. It never calls e-Solat at runtime. Next year's data appears once JAKIM publishes it,
usually late in the year.
