'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, Percent, Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Builder } from '@/types/builder';
import { ProjectFormValues } from '@/types/project';
import { getBuilderRequest, deleteBuilderRequest } from '@/lib/api/builder-api';
import { createProjectRequest, deleteProjectRequest } from '@/lib/api/project-api';
import { ProjectForm } from '@/components/builders/project-form';

const statusStyles: Record<string, string> = {
  UPCOMING: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  ONGOING: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  COMPLETED: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
};

export default function BuilderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [builder, setBuilder] = useState<Builder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const fetchBuilder = useCallback(async () => {
    try {
      const data = await getBuilderRequest(params.id);
      setBuilder(data);
    } catch {
      toast.error('Builder not found');
      router.push('/dashboard/builders');
    } finally {
      setIsLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchBuilder();
  }, [fetchBuilder]);

  async function handleAddProject(values: ProjectFormValues) {
    try {
      await createProjectRequest(values);
      toast.success('Project added');
      setShowProjectForm(false);
      fetchBuilder();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add project');
    }
  }

  async function handleDeleteProject(id: string) {
    if (!confirm('Delete this project?')) return;
    try {
      await deleteProjectRequest(id);
      toast.success('Project deleted');
      fetchBuilder();
    } catch {
      toast.error('Failed to delete project');
    }
  }

  async function handleDeleteBuilder() {
    if (!confirm('Delete this builder and all its projects? This cannot be undone.')) return;
    try {
      await deleteBuilderRequest(params.id);
      toast.success('Builder deleted');
      router.push('/dashboard/builders');
    } catch {
      toast.error('Failed to delete builder');
    }
  }

  if (isLoading) {
    return <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading...</p>;
  }

  if (!builder) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">{builder.name}</h1>
          {builder.contactPerson && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{builder.contactPerson}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/builders/${builder.id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            onClick={handleDeleteBuilder}
            className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        {builder.phone && (
          <span className="flex items-center gap-1.5">
            <Phone size={14} /> {builder.phone}
          </span>
        )}
        {builder.email && (
          <span className="flex items-center gap-1.5">
            <Mail size={14} /> {builder.email}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <Percent size={14} /> {builder.commissionPercent}% commission
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Projects</h2>
          <button
            onClick={() => setShowProjectForm((v) => !v)}
            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus size={14} /> Add Project
          </button>
        </div>

        {showProjectForm && (
          <div className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <ProjectForm
              builderId={builder.id}
              onSubmit={handleAddProject}
              onCancel={() => setShowProjectForm(false)}
            />
          </div>
        )}

        {builder.projects && builder.projects.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {builder.projects.map((project) => (
                  <tr key={project.id} className="bg-white dark:bg-neutral-950">
                    <td className="px-4 py-3 font-medium text-neutral-900 dark:text-white">
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {project.city}, {project.state}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[project.status]}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="text-neutral-400 hover:text-red-600"
                        aria-label="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-300 py-10 text-center dark:border-neutral-700">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No projects yet for this builder.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}