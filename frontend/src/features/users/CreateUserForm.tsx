'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/FormField';
import { Alert } from '@/components/states/StateViews';
import { useCreateUser } from '@/hooks/use-users';
import { createUserSchema, type CreateUserFormValues } from './user.schema';

export function CreateUserForm() {
  const createUser = useCreateUser();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({ resolver: zodResolver(createUserSchema) });

  const onSubmit = handleSubmit((values) => {
    createUser.mutate(values, { onSuccess: () => reset() });
  });

  return (
    <Card>
      <h2 className="text-base font-semibold text-slate-900">Create user</h2>
      <form onSubmit={onSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField label="Name" placeholder="Amir Hassan" {...register('name')} error={errors.name?.message} />
        <TextField
          label="Phone"
          placeholder="+201000000001"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <TextField
          label="Email"
          placeholder="amir@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        <div className="sm:col-span-3 flex items-center gap-3">
          <Button type="submit" isLoading={createUser.isPending}>
            Create user
          </Button>
          {createUser.isSuccess && <Alert tone="success">User created successfully.</Alert>}
          {createUser.isError && <Alert tone="error">{(createUser.error as Error).message}</Alert>}
        </div>
      </form>
    </Card>
  );
}
