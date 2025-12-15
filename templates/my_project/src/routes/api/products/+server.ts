import { json } from '@sveltejs/kit';
import { listProducts } from '$lib/server/listProducts';

export async function GET({ url }) {
  const regionId = url.searchParams.get('regionId');
  const id = regionId ? parseInt(regionId, 10) : undefined;

  if (regionId && isNaN(parseInt(regionId, 10))) {
    return json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const products = await listProducts(id);
  return json(products, { status: 200 });
}

