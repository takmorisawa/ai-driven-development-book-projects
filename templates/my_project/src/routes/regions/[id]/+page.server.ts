import { error } from '@sveltejs/kit';
import { getRegion } from '$lib/server/getRegion';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    throw error(400, '無効な地域IDです');
  }

  const region = await getRegion(id);

  if (!region) {
    throw error(404, '地域が見つかりませんでした');
  }

  return {
    region,
  };
};

