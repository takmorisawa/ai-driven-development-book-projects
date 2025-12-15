import { json } from '@sveltejs/kit';
import { getRegion } from '$lib/server/getRegion';

export async function GET({ params }) {
  const id = parseInt(params.id, 10);
  
  if (isNaN(id)) {
    return json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const region = await getRegion(id);
  
  if (!region) {
    return json({ error: 'Region not found' }, { status: 404 });
  }

  return json(region, { status: 200 });
}

