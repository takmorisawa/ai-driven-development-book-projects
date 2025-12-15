import { json } from '@sveltejs/kit';
import { listTerrains } from '$lib/server/listTerrains';

export async function GET({ url }) {
  const regionId = url.searchParams.get('regionId');
  const id = regionId ? parseInt(regionId, 10) : undefined;

  if (regionId && isNaN(parseInt(regionId, 10))) {
    return json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const terrains = await listTerrains(id);
  return json(terrains, { status: 200 });
}

