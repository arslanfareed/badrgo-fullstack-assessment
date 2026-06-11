import { CreateUserForm } from '@/features/users/CreateUserForm';
import { UsersList } from '@/features/users/UsersList';

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">Create users and manage their wallets.</p>
      </div>
      <CreateUserForm />
      <UsersList />
    </div>
  );
}
