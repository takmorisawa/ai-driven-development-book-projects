import { json } from '@sveltejs/kit';
import { addRegion } from '$lib/server/addRegion';
import { updateRegion } from '$lib/server/updateRegion';

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const prefectureCode = formData.get('prefectureCode') as string;
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const description = formData.get('description') as string | null;
  const imageFile = formData.get('image') as File | null;

  if (!name || !prefectureCode || !latitude || !longitude) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);

  if (isNaN(lat) || isNaN(lng)) {
    return json({ error: 'Invalid latitude or longitude' }, { status: 400 });
  }

  const region = await addRegion(
    name,
    prefectureCode,
    lat,
    lng,
    description || undefined,
    imageFile && imageFile.size > 0 ? imageFile : undefined
  );
  return json(region, { status: 201 });
};

export const PUT = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');
  const name = formData.get('name') as string;
  const prefectureCode = formData.get('prefectureCode') as string;
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const description = formData.get('description') as string | null;
  const imageFile = formData.get('image') as File | null;

  if (!id || !name || !prefectureCode || !latitude || !longitude) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const regionId = parseInt(id as string, 10);
  const lat = parseFloat(latitude as string);
  const lng = parseFloat(longitude as string);

  if (isNaN(regionId) || isNaN(lat) || isNaN(lng)) {
    return json({ error: 'Invalid ID, latitude or longitude' }, { status: 400 });
  }

  const region = await updateRegion(
    regionId,
    name,
    prefectureCode,
    lat,
    lng,
    description || undefined,
    imageFile && imageFile.size > 0 ? imageFile : undefined
  );
  return json(region, { status: 200 });
};

