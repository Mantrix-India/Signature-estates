// import { api } from '../axios';
// import { Property } from '@/types/property';
// import { NearbyPlace, PlaceType } from '@/types/nearbyPlace';

// export async function geocodePropertyRequest(propertyId: string): Promise<Property> {
//   const { data } = await api.post(`/properties/${propertyId}/geocode`);
//   return data.data;
// }

// export async function getNearbyPlacesRequest(
//   propertyId: string,
//   type: PlaceType
// ): Promise<NearbyPlace[]> {
//   const { data } = await api.get(`/properties/${propertyId}/nearby-places`, { params: { type } });
//   return data.data;
// }


import { api } from '../axios';
import { Property } from '@/types/property';
import { NearbyPlace, PlaceType } from '@/types/nearbyPlace';

export async function geocodePropertyRequest(propertyId: string): Promise<Property> {
  const { data } = await api.post(`/properties/${propertyId}/geocode`);
  return data.data;
}

export async function setPropertyLocationRequest(
  propertyId: string,
  latitude: number,
  longitude: number
): Promise<Property> {
  const { data } = await api.patch(`/properties/${propertyId}/location`, { latitude, longitude });
  return data.data;
}

export async function getNearbyPlacesRequest(
  propertyId: string,
  type: PlaceType
): Promise<NearbyPlace[]> {
  const { data } = await api.get(`/properties/${propertyId}/nearby-places`, { params: { type } });
  return data.data;
}