'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { AuthShowcase } from '@/components/auth/auth-showcase';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true);
    try {
      await registerUser(values.fullName, values.email, values.password);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600';

  return (
    <main className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <AuthShowcase />

      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[46%] lg:px-16">
        <div className="mx-auto w-full max-w-sm animate-fade-up">
          <div className="mb-10 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              <Building2 size={18} />
            </span>
            <span className="whitespace-nowrap text-lg font-semibold tracking-tight">
    Signature <span className="text-[#D4AF72]">Estates</span>
  </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Set up your agency workspace in a couple of steps.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                {...register('fullName')}
                className={inputClass}
                placeholder="Your full name"
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className={inputClass}
                placeholder="your email"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className={inputClass}
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800 disabled:opacity-60 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating account…
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-neutral-900 underline-offset-4 hover:underline dark:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
