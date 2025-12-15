import { json } from '@sveltejs/kit';
import { addProduct } from '$lib/server/addProduct';
import { updateProduct } from '$lib/server/updateProduct';

export const POST = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name') as string;
  const regionId = formData.get('regionId');
  const productionAmount = formData.get('productionAmount');
  const ranking = formData.get('ranking');
  const description = formData.get('description') as string | null;
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const imageFile = formData.get('image') as File | null;

  if (!name || !regionId) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const rId = parseInt(regionId as string, 10);
  if (isNaN(rId)) {
    return json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const product = await addProduct(
    name,
    rId,
    productionAmount ? parseFloat(productionAmount as string) : undefined,
    ranking ? parseInt(ranking as string, 10) : undefined,
    description || undefined,
    latitude ? parseFloat(latitude as string) : undefined,
    longitude ? parseFloat(longitude as string) : undefined,
    imageFile && imageFile.size > 0 ? imageFile : undefined
  );
  return json(product, { status: 201 });
};

export const PUT = async ({ request }) => {
  const formData = await request.formData();
  const id = formData.get('id');
  const name = formData.get('name') as string;
  const regionId = formData.get('regionId');
  const productionAmount = formData.get('productionAmount');
  const ranking = formData.get('ranking');
  const description = formData.get('description') as string | null;
  const latitude = formData.get('latitude');
  const longitude = formData.get('longitude');
  const imageFile = formData.get('image') as File | null;

  if (!id || !name || !regionId) {
    return json({ error: 'Invalid input' }, { status: 400 });
  }

  const productId = parseInt(id as string, 10);
  const rId = parseInt(regionId as string, 10);
  if (isNaN(productId) || isNaN(rId)) {
    return json({ error: 'Invalid ID' }, { status: 400 });
  }

  const product = await updateProduct(
    productId,
    name,
    rId,
    productionAmount ? parseFloat(productionAmount as string) : undefined,
    ranking ? parseInt(ranking as string, 10) : undefined,
    description || undefined,
    latitude ? parseFloat(latitude as string) : undefined,
    longitude ? parseFloat(longitude as string) : undefined,
    imageFile && imageFile.size > 0 ? imageFile : undefined
  );
  return json(product, { status: 200 });
};

