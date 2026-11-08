'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Invoice, InvoiceStatus, InvoiceFormValues } from '@/types/invoice';
import { Client } from '@/types/client';
import { Property } from '@/types/property';
import { listInvoicesRequest, createInvoiceRequest, updateInvoiceStatusRequest } from '@/lib/api/invoice-api';
import { listClientsRequest } from '@/lib/api/client-api';
import { listPropertiesRequest } from '@/lib/api/property-api';
import { InvoiceCard } from '@/components/invoices/invoice-card';
import { InvoiceForm } from '@/components/invoices/invoice-form';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      const result = await listInvoicesRequest();
      setInvoices(result);
    } catch {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
    Promise.all([listClientsRequest({ limit: 100 }), listPropertiesRequest({ limit: 100 })])
      .then(([clientsRes, propertiesRes]) => {
        setClients(clientsRes.clients);
        setProperties(propertiesRes.properties);
      })
      .catch(() => {});
  }, [fetchInvoices]);

  async function handleCreate(values: InvoiceFormValues) {
    try {
      await createInvoiceRequest(values);
      toast.success('Invoice created');
      setShowForm(false);
      fetchInvoices();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create invoice');
    }
  }

  async function handleStatusChange(id: string, status: InvoiceStatus) {
    try {
      await updateInvoiceStatusRequest(id, status);
      toast.success('Status updated');
      fetchInvoices();
    } catch {
      toast.error('Failed to update status');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Invoices</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Track payments and dues</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />}
          {showForm ? 'Cancel' : 'New Invoice'}
        </button>
      </div>

      {showForm && (
        <div className="mx-auto max-w-lg rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <InvoiceForm clients={clients} properties={properties} onSubmit={handleCreate} />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">No invoices yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onStatusChange={(status) => handleStatusChange(invoice.id, status)}
            />
          ))}
        </div>
      )}
    </div>
  );
}