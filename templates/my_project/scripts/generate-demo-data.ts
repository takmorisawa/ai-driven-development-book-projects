import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// デモ用の充実したデータ
const demoRegions = [
  // 北海道・東北
  { name: '札幌市', code: '01', lat: 43.0642, lng: 141.3469, desc: '北海道の道庁所在地。雪まつりで有名。' },
  { name: '青森市', code: '02', lat: 40.8244, lng: 140.7406, desc: '青森県の県庁所在地。りんごの生産が盛ん。' },
  { name: '盛岡市', code: '03', lat: 39.7036, lng: 141.1528, desc: '岩手県の県庁所在地。南部鉄器で有名。' },
  { name: '仙台市', code: '04', lat: 38.2682, lng: 140.8694, desc: '宮城県の県庁所在地。東北地方の中心都市。' },
  { name: '秋田市', code: '05', lat: 39.7186, lng: 140.1024, desc: '秋田県の県庁所在地。' },
  { name: '山形市', code: '06', lat: 38.2404, lng: 140.3633, desc: '山形県の県庁所在地。さくらんぼの産地。' },
  { name: '福島市', code: '07', lat: 37.7500, lng: 140.4678, desc: '福島県の県庁所在地。' },
  
  // 関東
  { name: '水戸市', code: '08', lat: 36.3414, lng: 140.4467, desc: '茨城県の県庁所在地。' },
  { name: '宇都宮市', code: '09', lat: 36.5658, lng: 139.8836, desc: '栃木県の県庁所在地。餃子で有名。' },
  { name: '前橋市', code: '10', lat: 36.3911, lng: 139.0608, desc: '群馬県の県庁所在地。' },
  { name: 'さいたま市', code: '11', lat: 35.8617, lng: 139.6455, desc: '埼玉県の県庁所在地。' },
  { name: '千葉市', code: '12', lat: 35.6074, lng: 140.1065, desc: '千葉県の県庁所在地。落花生の産地。' },
  { name: '新潟市', code: '15', lat: 37.9161, lng: 139.0364, desc: '新潟県の県庁所在地。コシヒカリの産地として有名。' },
  
  // 中部
  { name: '富山市', code: '16', lat: 36.6953, lng: 137.2113, desc: '富山県の県庁所在地。' },
  { name: '金沢市', code: '17', lat: 36.5613, lng: 136.6562, desc: '石川県の県庁所在地。加賀友禅で有名。' },
  { name: '福井市', code: '18', lat: 36.0652, lng: 136.2216, desc: '福井県の県庁所在地。' },
  { name: '甲府市', code: '19', lat: 35.6636, lng: 138.5683, desc: '山梨県の県庁所在地。ぶどうの産地。' },
  { name: '長野市', code: '20', lat: 36.6513, lng: 138.1810, desc: '長野県の県庁所在地。りんごの産地。' },
  { name: '岐阜市', code: '21', lat: 35.3912, lng: 136.7223, desc: '岐阜県の県庁所在地。' },
  { name: '静岡市', code: '22', lat: 34.9756, lng: 138.3825, desc: '静岡県の県庁所在地。お茶の生産が盛ん。' },
  { name: '名古屋市', code: '23', lat: 35.1815, lng: 136.9066, desc: '愛知県の県庁所在地。' },
  
  // 近畿
  { name: '津市', code: '24', lat: 34.7303, lng: 136.5086, desc: '三重県の県庁所在地。' },
  { name: '大津市', code: '25', lat: 35.0045, lng: 135.8686, desc: '滋賀県の県庁所在地。' },
  { name: '京都市', code: '26', lat: 35.0116, lng: 135.7681, desc: '京都府の府庁所在地。' },
  { name: '大阪市', code: '27', lat: 34.6937, lng: 135.5023, desc: '大阪府の府庁所在地。' },
  { name: '神戸市', code: '28', lat: 34.6901, lng: 135.1956, desc: '兵庫県の県庁所在地。' },
  { name: '奈良市', code: '29', lat: 34.6851, lng: 135.8048, desc: '奈良県の県庁所在地。' },
  { name: '和歌山市', code: '30', lat: 34.2261, lng: 135.1675, desc: '和歌山県の県庁所在地。みかんの産地。' },
  
  // 中国・四国
  { name: '鳥取市', code: '31', lat: 35.5039, lng: 134.2377, desc: '鳥取県の県庁所在地。梨の産地。' },
  { name: '松江市', code: '32', lat: 35.4723, lng: 133.0506, desc: '島根県の県庁所在地。' },
  { name: '岡山市', code: '33', lat: 34.6617, lng: 133.9350, desc: '岡山県の県庁所在地。桃の産地。' },
  { name: '広島市', code: '34', lat: 34.3853, lng: 132.4553, desc: '広島県の県庁所在地。' },
  { name: '山口市', code: '35', lat: 34.1858, lng: 131.4706, desc: '山口県の県庁所在地。' },
  { name: '徳島市', code: '36', lat: 34.0658, lng: 134.5594, desc: '徳島県の県庁所在地。' },
  { name: '高松市', code: '37', lat: 34.3402, lng: 134.0433, desc: '香川県の県庁所在地。うどんで有名。' },
  { name: '松山市', code: '38', lat: 33.8416, lng: 132.7654, desc: '愛媛県の県庁所在地。みかんの産地。' },
  { name: '高知市', code: '39', lat: 33.5597, lng: 133.5311, desc: '高知県の県庁所在地。カツオの水揚げで有名。' },
  
  // 九州・沖縄
  { name: '福岡市', code: '40', lat: 33.5904, lng: 130.4017, desc: '福岡県の県庁所在地。' },
  { name: '佐賀市', code: '41', lat: 33.2494, lng: 130.2988, desc: '佐賀県の県庁所在地。' },
  { name: '長崎市', code: '42', lat: 32.7503, lng: 129.8779, desc: '長崎県の県庁所在地。' },
  { name: '熊本市', code: '43', lat: 32.8031, lng: 130.7079, desc: '熊本県の県庁所在地。' },
  { name: '大分市', code: '44', lat: 33.2382, lng: 131.6126, desc: '大分県の県庁所在地。' },
  { name: '宮崎市', code: '45', lat: 31.9077, lng: 131.4202, desc: '宮崎県の県庁所在地。マンゴーの産地として有名。' },
  { name: '鹿児島市', code: '46', lat: 31.5966, lng: 130.5571, desc: '鹿児島県の県庁所在地。さつまいもの産地。' },
  { name: '那覇市', code: '47', lat: 26.2124, lng: 127.6809, desc: '沖縄県の県庁所在地。' },
];

// デモ用名産品データ（ベスト3を含む）
const demoProducts = [
  // 青森市 - りんご（ベスト3）
  { name: 'りんご', region: '青森市', amount: 450000, rank: 1, desc: '青森県は日本一のりんごの生産量を誇ります。' },
  { name: 'にんにく', region: '青森市', amount: 8500, rank: 2, desc: '青森県のにんにくは品質が高いことで知られています。' },
  { name: 'ながいも', region: '青森市', amount: 12000, rank: 3, desc: '青森県のながいもは全国有数の生産量です。' },
  
  // 山形市 - さくらんぼ（ベスト3）
  { name: 'さくらんぼ', region: '山形市', amount: 15000, rank: 1, desc: '山形県はさくらんぼの生産量が日本一です。' },
  { name: 'ラ・フランス', region: '山形市', amount: 8500, rank: 2, desc: '山形県はラ・フランスの生産量が日本一です。' },
  { name: 'ぶどう', region: '山形市', amount: 12000, rank: 3, desc: '山形県のぶどうは高品質で知られています。' },
  
  // 新潟市 - コシヒカリ（ベスト3）
  { name: 'コシヒカリ', region: '新潟市', amount: 380000, rank: 1, desc: '新潟県はコシヒカリの生産量が日本一です。' },
  { name: '日本酒', region: '新潟市', amount: null, rank: 2, desc: '新潟県は日本酒の名産地として有名です。' },
  { name: '笹団子', region: '新潟市', amount: null, rank: 3, desc: '新潟県の伝統的な和菓子です。' },
  
  // 静岡市 - お茶（ベスト3）
  { name: 'お茶', region: '静岡市', amount: 32000, rank: 1, desc: '静岡県はお茶の生産量が日本一です。' },
  { name: 'みかん', region: '静岡市', amount: 180000, rank: 2, desc: '静岡県のみかんは品質が高いことで知られています。' },
  { name: 'わさび', region: '静岡市', amount: 850, rank: 3, desc: '静岡県のわさびは全国有数の生産量です。' },
  
  // 和歌山市 - みかん
  { name: 'みかん', region: '和歌山市', amount: 180000, rank: 1, desc: '和歌山県はみかんの生産量が日本一です。' },
  
  // 鳥取市 - 梨
  { name: '梨', region: '鳥取市', amount: 12000, rank: 1, desc: '鳥取県は梨の生産量が日本一です。' },
  
  // 岡山市 - 桃
  { name: '桃', region: '岡山市', amount: 15000, rank: 1, desc: '岡山県は桃の生産量が日本一です。' },
  
  // 高知市 - カツオ
  { name: 'カツオ', region: '高知市', amount: 45000, rank: 1, desc: '高知県はカツオの水揚げ量が日本一です。' },
  
  // 宮崎市 - マンゴー
  { name: 'マンゴー', region: '宮崎市', amount: 3500, rank: 1, desc: '宮崎県はマンゴーの生産量が日本一です。' },
  
  // 鹿児島市 - さつまいも
  { name: 'さつまいも', region: '鹿児島市', amount: 380000, rank: 1, desc: '鹿児島県はさつまいもの生産量が日本一です。' },
  
  // その他
  { name: 'ぶどう', region: '甲府市', amount: 45000, rank: 1, desc: '山梨県はぶどうの生産量が日本一です。' },
  { name: 'うどん', region: '高松市', amount: null, rank: null, desc: '香川県はうどんで有名です。' },
  { name: '餃子', region: '宇都宮市', amount: null, rank: null, desc: '栃木県宇都宮市は餃子で有名です。' },
  { name: '落花生', region: '千葉市', amount: 6500, rank: 1, desc: '千葉県は落花生の生産量が日本一です。' },
];

// デモ用名所データ
const demoLandmarks = [
  // 北海道・東北
  { name: '札幌時計台', region: '札幌市', lat: 43.0627, lng: 141.3537, desc: '札幌のシンボルとして親しまれている時計台。' },
  { name: '青森県立美術館', region: '青森市', lat: 40.8081, lng: 140.7008, desc: '青森県を代表する美術館。' },
  { name: '盛岡城跡公園', region: '盛岡市', lat: 39.7014, lng: 141.1528, desc: '盛岡城の跡地を公園として整備。' },
  { name: '仙台城跡', region: '仙台市', lat: 38.2517, lng: 140.8569, desc: '伊達政宗が築いた仙台城の跡地。' },
  
  // 関東・中部
  { name: '金沢城', region: '金沢市', lat: 36.5613, lng: 136.6562, desc: '加賀百万石の城。' },
  { name: '富士山', region: '静岡市', lat: 35.3606, lng: 138.7274, desc: '日本最高峰の山。世界文化遺産。' },
  
  // 近畿
  { name: '清水寺', region: '京都市', lat: 34.9949, lng: 135.7850, desc: '京都を代表する寺院。' },
  { name: '東大寺', region: '奈良市', lat: 34.6891, lng: 135.8397, desc: '世界最大の木造建築。' },
  { name: '姫路城', region: '神戸市', lat: 34.8394, lng: 134.6939, desc: '世界遺産に登録されている白鷺城。' },
  { name: '大阪城', region: '大阪市', lat: 34.6873, lng: 135.5262, desc: '豊臣秀吉が築いた城。' },
  
  // 中国・四国
  { name: '高知城', region: '高知市', lat: 33.5603, lng: 133.5311, desc: '現存する12天守の一つ。' },
  { name: '厳島神社', region: '広島市', lat: 34.2958, lng: 132.3197, desc: '世界遺産に登録されている海上の神社。' },
  
  // 九州・沖縄
  { name: '首里城', region: '那覇市', lat: 26.2172, lng: 127.7192, desc: '琉球王国の王城。' },
  { name: '熊本城', region: '熊本市', lat: 32.8061, lng: 130.7058, desc: '加藤清正が築いた名城。' },
];

// デモ用地形データ
const demoTerrains = [
  { name: 'リアス式海岸', region: '仙台市', lat: 38.2682, lng: 140.8694, desc: '三陸海岸はリアス式海岸として有名です。' },
  { name: '扇状地', region: '静岡市', lat: 34.9756, lng: 138.3825, desc: '静岡県には扇状地が多く見られます。' },
  { name: '三角州', region: '新潟市', lat: 37.9161, lng: 139.0364, desc: '信濃川の河口に形成された三角州。' },
  { name: 'カルデラ', region: '鹿児島市', lat: 31.5966, lng: 130.5571, desc: '桜島は活火山で、カルデラ地形が見られます。' },
  { name: 'サンゴ礁', region: '那覇市', lat: 26.2124, lng: 127.6809, desc: '沖縄には美しいサンゴ礁が広がっています。' },
  { name: '砂丘', region: '鳥取市', lat: 35.5436, lng: 134.2380, desc: '鳥取砂丘は日本最大の砂丘です。' },
];

async function main() {
  console.log('デモ用データを生成中...');

  // 既存データをクリア
  console.log('既存データをクリア中...');
  await prisma.terrain.deleteMany();
  await prisma.landmark.deleteMany();
  await prisma.product.deleteMany();
  await prisma.region.deleteMany();

  // 地域を作成
  const createdRegions = [];
  for (const regionData of demoRegions) {
    const region = await prisma.region.create({
      data: {
        name: regionData.name,
        prefectureCode: regionData.code,
        latitude: regionData.lat,
        longitude: regionData.lng,
        description: regionData.desc,
      },
    });
    createdRegions.push(region);
    console.log(`地域を作成: ${region.name}`);
  }

  // 名産品を作成
  for (const productData of demoProducts) {
    const region = createdRegions.find((r) => r.name === productData.region);
    if (region) {
      await prisma.product.create({
        data: {
          name: productData.name,
          regionId: region.id,
          productionAmount: productData.amount,
          ranking: productData.rank,
          description: productData.desc,
          latitude: region.latitude,
          longitude: region.longitude,
        },
      });
      console.log(`名産品を作成: ${productData.name} (${productData.region})`);
    }
  }

  // 名所を作成
  for (const landmarkData of demoLandmarks) {
    const region = createdRegions.find((r) => r.name === landmarkData.region);
    if (region) {
      await prisma.landmark.create({
        data: {
          name: landmarkData.name,
          regionId: region.id,
          latitude: landmarkData.lat,
          longitude: landmarkData.lng,
          description: landmarkData.desc,
        },
      });
      console.log(`名所を作成: ${landmarkData.name} (${landmarkData.region})`);
    }
  }

  // 地形を作成
  for (const terrainData of demoTerrains) {
    const region = createdRegions.find((r) => r.name === terrainData.region);
    if (region) {
      await prisma.terrain.create({
        data: {
          name: terrainData.name,
          regionId: region.id,
          latitude: terrainData.lat,
          longitude: terrainData.lng,
          description: terrainData.desc,
        },
      });
      console.log(`地形を作成: ${terrainData.name} (${terrainData.region})`);
    }
  }

  console.log('\nデモ用データの生成が完了しました！');
  console.log(`合計: ${createdRegions.length}地域、${demoProducts.length}名産品、${demoLandmarks.length}名所、${demoTerrains.length}地形`);
  console.log('\nデモで見せやすい地域:');
  console.log('- 青森市: りんごのベスト3（1位、2位、3位）');
  console.log('- 山形市: さくらんぼのベスト3（1位、2位、3位）');
  console.log('- 新潟市: コシヒカリのベスト3（1位、2位、3位）');
  console.log('- 静岡市: お茶のベスト3（1位、2位、3位）');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

