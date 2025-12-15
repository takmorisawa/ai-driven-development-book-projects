import { json } from '@sveltejs/kit';
import { listRegions } from '$lib/server/listRegions';

export async function GET() {
  const regions = await listRegions();
  return json(regions, { status: 200 });
}

