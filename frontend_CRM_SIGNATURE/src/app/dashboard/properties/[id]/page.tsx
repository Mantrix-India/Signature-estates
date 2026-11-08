// 'use client';
// import { StatusUpdateForm } from '@/components/inventory/status-update-form';
// import { StatusHistoryTimeline } from '@/components/inventory/status-history-timeline';
// import { updatePropertyStatusRequest, getStatusHistoryRequest } from '@/lib/api/inventory-api';
// import { InventoryStatusLog } from '@/types/inventory';
// import { InventorySource } from '@/types/inventory';
// import { PropertyStatus } from '@/types/property';
// import { useEffect, useState, useCallback } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Link from 'next/link';
// import dynamic from 'next/dynamic';
// import { Bed, Bath, Ruler, MapPin, Pencil, LocateFixed, Loader2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { Property } from '@/types/property';
// import { PropertyDocument } from '@/types/document';
// import { getPropertyRequest } from '@/lib/api/property-api';
// import { listDocumentsRequest, deleteDocumentRequest } from '@/lib/api/document-api';
// import { geocodePropertyRequest } from '@/lib/api/maps-api';
// import { DocumentUpload } from '@/components/documents/document-upload';
// import { DocumentList } from '@/components/documents/document-list';
// import { NearbyPlacesPanel } from '@/components/maps/nearby-places-panel';
// import { AiSummaryPanel } from '@/components/ai/ai-summary-panel';




// // Leaflet touches `window` on import, which doesn't exist during server-side rendering —
// // loading the map client-side only avoids an SSR crash.
// const PropertyMap = dynamic(
//   () => import('@/components/maps/property-map').then((mod) => mod.PropertyMap),
//   { ssr: false, loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
// );

// function formatPrice(price: number) {
//   if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
//   if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
//   return `₹${price.toLocaleString('en-IN')}`;
// }

// export default function PropertyDetailPage() {
//   const params = useParams<{ id: string }>();
//   const router = useRouter();
//   const [property, setProperty] = useState<Property | null>(null);
//   const [documents, setDocuments] = useState<PropertyDocument[]>([]);
//   const [statusLogs, setStatusLogs] = useState<InventoryStatusLog[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isGeocoding, setIsGeocoding] = useState(false);

//   const fetchData = useCallback(async () => {
//     try {
//       const [propertyData, docsData, historyData] = await Promise.all([
//         getPropertyRequest(params.id),
//         listDocumentsRequest(params.id),
//         getStatusHistoryRequest(params.id),
//       ]);
//       setProperty(propertyData);
//       setDocuments(docsData);
//       setStatusLogs(historyData);
//     } catch {
//       toast.error('Property not found');
//       router.push('/dashboard/properties');
//     } finally {
//       setIsLoading(false);
//     }
//   }, [params.id, router]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   async function handleDeleteDocument(id: string) {
//     if (!confirm('Delete this document?')) return;
//     try {
//       await deleteDocumentRequest(id);
//       toast.success('Document deleted');
//       fetchData();
//     } catch {
//       toast.error('Failed to delete document');
//     }
//   }

//   async function handleStatusUpdate(status: PropertyStatus, source: InventorySource, note: string) {
//     try {
//       await updatePropertyStatusRequest(params.id, status, source, note || undefined);
//       toast.success('Status updated');
//       fetchData();
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Failed to update status');
//     }
//   }

//   async function handleGeocode() {
//     setIsGeocoding(true);
//     try {
//       const updated = await geocodePropertyRequest(params.id);
//       setProperty(updated);
//       toast.success('Location found');
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || 'Failed to locate this address');
//     } finally {
//       setIsGeocoding(false);
//     }
//   }

//   if (isLoading) {
//     return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
//   }

//   if (!property) return null;

//   const hasLocation = property.latitude != null && property.longitude != null;

//   return (
//     <div className="mx-auto max-w-3xl space-y-6">
//       <div className="flex items-start justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{property.title}</h1>
//           <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
//             <MapPin size={13} /> {property.address}, {property.city}, {property.state}
//           </p>
//         </div>
//         <Link
//           href={`/dashboard/properties/${property.id}/edit`}
//           className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
//         >
//           <Pencil size={14} /> Edit
//         </Link>
//       </div>

//       <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
//         <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
//           {formatPrice(property.price)}
//         </p>
//         <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
//           {property.bedrooms != null && (
//             <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms}</span>
//           )}
//           {property.bathrooms != null && (
//             <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
//           )}
//           {property.areaSqft != null && (
//             <span className="flex items-center gap-1"><Ruler size={14} /> {property.areaSqft} sqft</span>
//           )}
//         </div>
//         {property.description && (
//           <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{property.description}</p>
//         )}
//       </div>

//       <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
//         <div className="mb-3 flex items-center justify-between">
//           <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Location</h2>
//           {!hasLocation && (
//             <button
//               onClick={handleGeocode}
//               disabled={isGeocoding}
//               className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
//             >
//               {isGeocoding ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
//               {isGeocoding ? 'Locating...' : 'Find on Map'}
//             </button>
//           )}
//         </div>

//         {hasLocation ? (
//           <>
//             <PropertyMap
//               latitude={property.latitude as number}
//               longitude={property.longitude as number}
//               title={property.title}
//             />

//             <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
//               <h3 className="mb-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
//                 Nearby
//               </h3>
//               <NearbyPlacesPanel propertyId={property.id} />
//             </div>
//           </>
//         ) : (
//           <p className="text-sm text-neutral-500 dark:text-neutral-400">
//             This property hasn't been located on the map yet. Click "Find on Map" to geocode its address.
//           </p>
//         )}
//       </div>

//       <AiSummaryPanel propertyId={property.id} />

//       <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
//         <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
//           Inventory Status
//         </h2>
//         <StatusUpdateForm currentStatus={property.status} onSubmit={handleStatusUpdate} />
//         <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
//           <h3 className="mb-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
//             History
//           </h3>
//           <StatusHistoryTimeline logs={statusLogs} />
//         </div>
//       </div>

//       <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
//         <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Documents</h2>
//         <DocumentUpload propertyId={property.id} onUploaded={fetchData} />
//         <div className="mt-4">
//           <DocumentList documents={documents} onDelete={handleDeleteDocument} />
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';
import { StatusUpdateForm } from '@/components/inventory/status-update-form';
import { StatusHistoryTimeline } from '@/components/inventory/status-history-timeline';
import { updatePropertyStatusRequest, getStatusHistoryRequest } from '@/lib/api/inventory-api';
import { InventoryStatusLog } from '@/types/inventory';
import { InventorySource } from '@/types/inventory';
import { PropertyStatus } from '@/types/property';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Bed, Bath, Ruler, MapPin, Pencil, LocateFixed, Loader2, Crosshair, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Property } from '@/types/property';
import { PropertyDocument } from '@/types/document';
import { getPropertyRequest } from '@/lib/api/property-api';
import { listDocumentsRequest, deleteDocumentRequest } from '@/lib/api/document-api';
import { geocodePropertyRequest, setPropertyLocationRequest } from '@/lib/api/maps-api';
import { DocumentUpload } from '@/components/documents/document-upload';
import { DocumentList } from '@/components/documents/document-list';
import { NearbyPlacesPanel } from '@/components/maps/nearby-places-panel';
import { AiSummaryPanel } from '@/components/ai/ai-summary-panel';




// Leaflet touches `window` on import, which doesn't exist during server-side rendering —
// loading the map client-side only avoids an SSR crash.
const PropertyMap = dynamic(
  () => import('@/components/maps/property-map').then((mod) => mod.PropertyMap),
  { ssr: false, loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);

function formatPrice(price: number) {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [statusLogs, setStatusLogs] = useState<InventoryStatusLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isAdjustingPin, setIsAdjustingPin] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pendingPosition, setPendingPosition] = useState<{ lat: number; lng: number } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [propertyData, docsData, historyData] = await Promise.all([
        getPropertyRequest(params.id),
        listDocumentsRequest(params.id),
        getStatusHistoryRequest(params.id),
      ]);
      setProperty(propertyData);
      setDocuments(docsData);
      setStatusLogs(historyData);
    } catch {
      toast.error('Property not found');
      router.push('/dashboard/properties');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleDeleteDocument(id: string) {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocumentRequest(id);
      toast.success('Document deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete document');
    }
  }

  async function handleStatusUpdate(status: PropertyStatus, source: InventorySource, note: string) {
    try {
      await updatePropertyStatusRequest(params.id, status, source, note || undefined);
      toast.success('Status updated');
      fetchData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update status');
    }
  }

  async function handleGeocode() {
    setIsGeocoding(true);
    try {
      const updated = await geocodePropertyRequest(params.id);
      setProperty(updated);
      toast.success('Location found');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to locate this address');
    } finally {
      setIsGeocoding(false);
    }
  }

  function handleStartAdjustPin() {
    if (!property) return;
    setPendingPosition({ lat: property.latitude as number, lng: property.longitude as number });
    setIsAdjustingPin(true);
  }

  function handleCancelAdjustPin() {
    setIsAdjustingPin(false);
    setPendingPosition(null);
  }

  async function handleSavePin() {
    if (!pendingPosition) return;
    setIsSavingPin(true);
    try {
      const updated = await setPropertyLocationRequest(
        params.id,
        pendingPosition.lat,
        pendingPosition.lng
      );
      setProperty(updated);
      toast.success('Pin location saved');
      setIsAdjustingPin(false);
      setPendingPosition(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save pin location');
    } finally {
      setIsSavingPin(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!property) return null;

  const hasLocation = property.latitude != null && property.longitude != null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{property.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            <MapPin size={13} /> {property.address}, {property.city}, {property.state}
          </p>
        </div>
        <Link
          href={`/dashboard/properties/${property.id}/edit`}
          className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          <Pencil size={14} /> Edit
        </Link>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-2xl font-semibold text-neutral-900 dark:text-white">
          {formatPrice(property.price)}
        </p>
        <div className="mt-3 flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          {property.bedrooms != null && (
            <span className="flex items-center gap-1"><Bed size={14} /> {property.bedrooms}</span>
          )}
          {property.bathrooms != null && (
            <span className="flex items-center gap-1"><Bath size={14} /> {property.bathrooms}</span>
          )}
          {property.areaSqft != null && (
            <span className="flex items-center gap-1"><Ruler size={14} /> {property.areaSqft} sqft</span>
          )}
        </div>
        {property.description && (
          <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{property.description}</p>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Location</h2>
          <div className="flex items-center gap-2">
            {!hasLocation && (
              <button
                onClick={handleGeocode}
                disabled={isGeocoding}
                className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                {isGeocoding ? <Loader2 size={13} className="animate-spin" /> : <LocateFixed size={13} />}
                {isGeocoding ? 'Locating...' : 'Find on Map'}
              </button>
            )}
            {hasLocation && !isAdjustingPin && (
              <button
                onClick={handleStartAdjustPin}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Crosshair size={13} /> Adjust Pin
              </button>
            )}
            {isAdjustingPin && (
              <>
                <button
                  onClick={handleCancelAdjustPin}
                  disabled={isSavingPin}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  onClick={handleSavePin}
                  disabled={isSavingPin}
                  className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                >
                  {isSavingPin ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                  {isSavingPin ? 'Saving...' : 'Save Pin'}
                </button>
              </>
            )}
          </div>
        </div>

        {hasLocation ? (
          <>
            {isAdjustingPin && (
              <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
                Click anywhere on the map, or drag the pin, to set the exact spot.
              </p>
            )}
            <PropertyMap
              latitude={(pendingPosition?.lat ?? property.latitude) as number}
              longitude={(pendingPosition?.lng ?? property.longitude) as number}
              title={property.title}
              editable={isAdjustingPin}
              onPositionChange={(lat, lng) => setPendingPosition({ lat, lng })}
            />

            {!isAdjustingPin && (
              <div className="mt-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <h3 className="mb-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Nearby
                </h3>
                <NearbyPlacesPanel propertyId={property.id} />
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            This property hasn't been located on the map yet. Click "Find on Map" to geocode its address.
          </p>
        )}
      </div>

      <AiSummaryPanel propertyId={property.id} />

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">
          Inventory Status
        </h2>
        <StatusUpdateForm currentStatus={property.status} onSubmit={handleStatusUpdate} />
        <div className="mt-5 border-t border-neutral-100 pt-4 dark:border-neutral-800">
          <h3 className="mb-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            History
          </h3>
          <StatusHistoryTimeline logs={statusLogs} />
        </div>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-white">Documents</h2>
        <DocumentUpload propertyId={property.id} onUploaded={fetchData} />
        <div className="mt-4">
          <DocumentList documents={documents} onDelete={handleDeleteDocument} />
        </div>
      </div>
    </div>
  );
}