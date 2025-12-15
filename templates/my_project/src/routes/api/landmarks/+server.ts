import { json } from '@sveltejs/kit';
import { listLandmarks } from '$lib/server/listLandmarks';

export async function GET({ url }) {
  const regionId = url.searchParams.get('regionId');
  const id = regionId ? parseInt(regionId, 10) : undefined;

  if (regionId && isNaN(parseInt(regionId, 10))) {
    return json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const landmarks = await listLandmarks(id);
  return json(landmarks, { status: 200 });
}

