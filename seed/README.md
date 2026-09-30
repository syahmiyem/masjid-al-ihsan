# Sample content ("CONTOH")

Fictional kuliah, activities, services, org chart and a notice for the UAT demo (docs/plan.md, Phase 1, D-09).
Every document ID starts with `contoh-` and every title or name says "CONTOH".

The script lives in `apps/studio/scripts/` so that it can use the Sanity CLI's login:

```sh
pnpm contoh:isi                                 # load into production (the UAT site)
SANITY_STUDIO_DATASET=latihan pnpm contoh:isi   # load into the practice dataset
pnpm contoh:buang                               # remove all CONTOH documents (Phase 5)
```

Loading into `production` triggers the Sanity → Cloudflare webhook, so turn the webhook off while loading and
on again afterwards (one rebuild is enough).
