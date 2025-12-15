import { json } from '@sveltejs/kit';
import { addTerrain } from '$lib/server/addTerrain';
import { updateTerrain } from '$lib/server/updateTerrain';

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const regionId = formData.get('regionId');
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const description = formData.get('description') as string | null;
  const imageFile = formData.get('image') as File | null;

  if (!name || !regionId || !latitude || !longitude) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const rId = parseInt(regionId as string, 10);
  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);

  if (isNaN(rId) || isNaN(lat) || isNaN(lng)) {
    return json({ error: 'Invalid region ID, latitude or longitude' }, { status: 400 });
  }

  const terrain = await addTerrain(
    name,
    rId,
    lat,
    lng,
    description || undefined,
    imageFile && imageFile.size > 0 ? imageFile : undefined
  );
  return json(terrain, { status: 201 });
};

export const PUT = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');
  const name = formData.get('name') as string;
  const regionId = formData.get('regionId');
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const description = formData.get('description') as string | null;
  const imageFile = formData.get('image') as File | null;

  if (!id || !name || !regionId || !latitude || !longitude) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const terrainId = parseInt(id as string, 10);
  const rId = parseInt(regionId as string, 10);
  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);

  if (isNaN(terrainId) || isNaN(rId) || isNaN(lat) || isNaN(lng)) {
    return json({ error: 'Invalid ID, region ID, latitude or longitude' }, { status: 400 });
  }

  const terrain = await updateTerrain(
    terrainId,
    name,
    rId,
    lat,
    lng,
    description || undefined,
    imageFile && imageFile.size > 0 ? imageFile : undefined
  );
  return json(terrain, { status: 200 });
};

