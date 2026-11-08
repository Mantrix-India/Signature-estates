export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Overview of your properties, leads, and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['Total Properties', 'Active Leads', 'Site Visits', 'Clients'].map(
          (label) => (
            <div
              key={label}
              className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-neutral-900 dark:text-white">
                0
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}