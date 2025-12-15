import type { Prisma } from "@prisma/client";

export type RegionWithRelations = Prisma.RegionGetPayload<{
    include: {
        products: true;
        landmarks: true;
        terrains: true;
    };
}>;

export type ProductWithRegion = Prisma.ProductGetPayload<{
    include: {
        region: true;
    };
}>;

export type LandmarkWithRegion = Prisma.LandmarkGetPayload<{
    include: {
        region: true;
    };
}>;

export type TerrainWithRegion = Prisma.TerrainGetPayload<{
    include: {
        region: true;
    };
}>;

export type TravelPlanItem = {
    id: number;
    type: 'region' | 'landmark';
    name: string;
    latitude: number;
    longitude: number;
};

export type TripPlan = {
    id: string;
    name: string;
    createdAt: string;
    items: TravelPlanItem[];
};
