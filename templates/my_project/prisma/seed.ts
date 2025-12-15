import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('データベースにサンプルデータを投入中...');

  // 地域データ（都道府県の主要都市）
  const regions = [
    {
      name: '青森市',
      prefectureCode: '02',
      latitude: 40.8244,
      longitude: 140.7406,
      description: '青森県の県庁所在地。りんごの生産が盛ん。',
    },
    {
      name: '盛岡市',
      prefectureCode: '03',
      latitude: 39.7036,
      longitude: 141.1528,
      description: '岩手県の県庁所在地。南部鉄器で有名。',
    },
    {
      name: '仙台市',
      prefectureCode: '04',
      latitude: 38.2682,
      longitude: 140.8694,
      description: '宮城県の県庁所在地。東北地方の中心都市。',
    },
    {
      name: '新潟市',
      prefectureCode: '15',
      latitude: 37.9161,
      longitude: 139.0364,
      description: '新潟県の県庁所在地。コシヒカリの産地として有名。',
    },
    {
      name: '静岡市',
      prefectureCode: '22',
      latitude: 34.9756,
      longitude: 138.3825,
      description: '静岡県の県庁所在地。お茶の生産が盛ん。',
    },
    {
      name: '高知市',
      prefectureCode: '39',
      latitude: 33.5597,
      longitude: 133.5311,
      description: '高知県の県庁所在地。カツオの水揚げで有名。',
    },
    {
      name: '宮崎市',
      prefectureCode: '45',
      latitude: 31.9077,
      longitude: 131.4202,
      description: '宮崎県の県庁所在地。マンゴーの産地として有名。',
    },
  ];

  // 地域を作成
  const createdRegions = [];
  for (const regionData of regions) {
    const region = await prisma.region.upsert({
      where: { name: regionData.name },
      update: regionData,
      create: regionData,
    });
    createdRegions.push(region);
    console.log(`地域を作成: ${region.name}`);
  }

  // 名産品データ
  const products = [
    {
      name: 'りんご',
      regionName: '青森市',
      productionAmount: 450000,
      ranking: 1,
      description: '青森県は日本一のりんごの生産量を誇ります。',
      latitude: 40.8244,
      longitude: 140.7406,
    },
    {
      name: '南部鉄器',
      regionName: '盛岡市',
      productionAmount: null,
      ranking: null,
      description: '岩手県盛岡市で作られる伝統工芸品。',
      latitude: 39.7036,
      longitude: 141.1528,
    },
    {
      name: 'コシヒカリ',
      regionName: '新潟市',
      productionAmount: 380000,
      ranking: 1,
      description: '新潟県はコシヒカリの生産量が日本一です。',
      latitude: 37.9161,
      longitude: 139.0364,
    },
    {
      name: 'お茶',
      regionName: '静岡市',
      productionAmount: 32000,
      ranking: 1,
      description: '静岡県はお茶の生産量が日本一です。',
      latitude: 34.9756,
      longitude: 138.3825,
    },
    {
      name: 'カツオ',
      regionName: '高知市',
      productionAmount: 45000,
      ranking: 1,
      description: '高知県はカツオの水揚げ量が日本一です。',
      latitude: 33.5597,
      longitude: 133.5311,
    },
    {
      name: 'マンゴー',
      regionName: '宮崎市',
      productionAmount: 3500,
      ranking: 1,
      description: '宮崎県はマンゴーの生産量が日本一です。',
      latitude: 31.9077,
      longitude: 131.4202,
    },
  ];

  // 名産品を作成
  for (const productData of products) {
    const region = createdRegions.find((r) => r.name === productData.regionName);
    if (region) {
      await prisma.product.upsert({
        where: {
          name_regionId: {
            name: productData.name,
            regionId: region.id,
          },
        },
        update: {
          productionAmount: productData.productionAmount,
          ranking: productData.ranking,
          description: productData.description,
          latitude: productData.latitude,
          longitude: productData.longitude,
        },
        create: {
          name: productData.name,
          regionId: region.id,
          productionAmount: productData.productionAmount,
          ranking: productData.ranking,
          description: productData.description,
          latitude: productData.latitude,
          longitude: productData.longitude,
        },
      });
      console.log(`名産品を作成: ${productData.name} (${productData.regionName})`);
    }
  }

  // 名所データ
  const landmarks = [
    {
      name: '青森県立美術館',
      regionName: '青森市',
      latitude: 40.8081,
      longitude: 140.7008,
      description: '青森県を代表する美術館。',
    },
    {
      name: '盛岡城跡公園',
      regionName: '盛岡市',
      latitude: 39.7014,
      longitude: 141.1528,
      description: '盛岡城の跡地を公園として整備。',
    },
    {
      name: '仙台城跡',
      regionName: '仙台市',
      latitude: 38.2517,
      longitude: 140.8569,
      description: '伊達政宗が築いた仙台城の跡地。',
    },
    {
      name: '高知城',
      regionName: '高知市',
      latitude: 33.5603,
      longitude: 133.5311,
      description: '現存する12天守の一つ。',
    },
  ];

  // 名所を作成
  for (const landmarkData of landmarks) {
    const region = createdRegions.find((r) => r.name === landmarkData.regionName);
    if (region) {
      await prisma.landmark.upsert({
        where: {
          name_regionId: {
            name: landmarkData.name,
            regionId: region.id,
          },
        },
        update: {
          latitude: landmarkData.latitude,
          longitude: landmarkData.longitude,
          description: landmarkData.description,
        },
        create: {
          name: landmarkData.name,
          regionId: region.id,
          latitude: landmarkData.latitude,
          longitude: landmarkData.longitude,
          description: landmarkData.description,
        },
      });
      console.log(`名所を作成: ${landmarkData.name} (${landmarkData.regionName})`);
    }
  }

  // 地形データ
  const terrains = [
    {
      name: 'リアス式海岸',
      regionName: '仙台市',
      latitude: 38.2682,
      longitude: 140.8694,
      description: '三陸海岸はリアス式海岸として有名です。',
    },
    {
      name: '扇状地',
      regionName: '静岡市',
      latitude: 34.9756,
      longitude: 138.3825,
      description: '静岡県には扇状地が多く見られます。',
    },
    {
      name: '三角州',
      regionName: '新潟市',
      latitude: 37.9161,
      longitude: 139.0364,
      description: '信濃川の河口に形成された三角州。',
    },
  ];

  // 地形を作成
  for (const terrainData of terrains) {
    const region = createdRegions.find((r) => r.name === terrainData.regionName);
    if (region) {
      await prisma.terrain.upsert({
        where: {
          name_regionId: {
            name: terrainData.name,
            regionId: region.id,
          },
        },
        update: {
          latitude: terrainData.latitude,
          longitude: terrainData.longitude,
          description: terrainData.description,
        },
        create: {
          name: terrainData.name,
          regionId: region.id,
          latitude: terrainData.latitude,
          longitude: terrainData.longitude,
          description: terrainData.description,
        },
      });
      console.log(`地形を作成: ${terrainData.name} (${terrainData.regionName})`);
    }
  }

  console.log('サンプルデータの投入が完了しました！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
