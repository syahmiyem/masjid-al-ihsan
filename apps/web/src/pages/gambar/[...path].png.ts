// /gambar/**.png — share images generated at build time (plan 4.4, D-30 option A).
import type { APIRoute, GetStaticPaths } from 'astro';
import { catalogue, type Poster } from '../../poster/catalogue';
import { renderPng } from '../../poster/render';

export const getStaticPaths: GetStaticPaths = async () => {
  const unique = new Map<string, Poster>();
  for (const p of await catalogue()) unique.set(p.path, p);
  return [...unique.values()].map((p) => ({
    params: { path: p.path.replace(/^\/gambar\//, '').replace(/\.png$/, '') },
    props: { poster: p },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { node, format } = props.poster as Poster;
  const png = await renderPng(node, format);
  return new Response(png, { headers: { 'Content-Type': 'image/png' } });
};
