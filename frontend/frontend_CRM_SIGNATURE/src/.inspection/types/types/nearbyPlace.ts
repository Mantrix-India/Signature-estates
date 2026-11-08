export type PlaceType = 'school' | 'hospital' | 'airport' | 'metro' | 'market';

export interface NearbyPlace {
  id: string;
  placeType: string;
  name: string;
  distanceKm: number;
}