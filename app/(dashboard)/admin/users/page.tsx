'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.ceil(total / limit);

  const roleColors: Record<string, string> = {
    student: 'text-sky-400 bg-sky-500/10',
    tutor: 'text-emerald-400 bg-emerald-500/10',
    admin: 'text-purple-400 bg-purple-500/10',
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
        <p className="text-slate-400 mt-1 text-sm">Search, filter, and manage all platform users.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="pl-10 bg-slate-900/50 border-white/10 text-white"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="h-10 rounded-xl border border-white/10 bg-slate-900/50 px-3 text-sm text-white focus:ring-2 focus:ring-sky-500/50"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="tutor">Tutors</option>
          <option value="admin">Admins</option>
        </select>
        <p className="text-xs text-slate-500">{total} users total</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>
      ) : (
        <Card className="bg-slate-900/50 border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-3">User</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-3">Email</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-3">Role</th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                          {(u.full_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{u.full_name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${roleColors[u.role] || ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <Button
                variant="ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-slate-400 text-xs"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
              <Button
                variant="ghost"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-slate-400 text-xs"
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
