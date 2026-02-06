'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Check, X, Loader2 } from 'lucide-react';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/tutors')
      .then(res => res.json())
      .then(data => { setTutors(Array.isArray(data) ? data : []); })
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (tutorId: string, action: 'approve' | 'reject') => {
    setActionLoading(tutorId);
    try {
      const res = await fetch('/api/admin/tutors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tutorId, action }),
      });
      if (res.ok) {
        setTutors(prev => prev.filter(t => t.id !== tutorId));
      }
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-sky-400" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Tutor Approval Queue</h1>
        <p className="text-slate-400 mt-1 text-sm">Review and approve pending tutor applications.</p>
      </div>

      {tutors.length === 0 ? (
        <Card className="bg-slate-900/50 border-white/5 p-12 text-center">
          <GraduationCap className="h-12 w-12 text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
          <p className="text-sm text-slate-500">No pending tutor applications to review.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tutors.map((tutor) => (
            <Card key={tutor.id} className="bg-slate-900/50 border-white/5 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg font-bold text-emerald-400">
                    {((tutor.profiles as any)?.full_name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-bold">{(tutor.profiles as any)?.full_name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">{(tutor.profiles as any)?.email}</p>
                    {tutor.bio && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{tutor.bio}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {tutor.hourly_rate && (
                    <span className="text-sm font-bold text-white">${tutor.hourly_rate}/hr</span>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAction(tutor.id, 'approve')}
                      disabled={actionLoading === tutor.id}
                      size="sm"
                      className="bg-emerald-500 text-white font-bold"
                    >
                      {actionLoading === tutor.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Check className="h-3 w-3 mr-1" /> Approve</>}
                    </Button>
                    <Button
                      onClick={() => handleAction(tutor.id, 'reject')}
                      disabled={actionLoading === tutor.id}
                      size="sm"
                      variant="outline"
                      className="border-red-500/30 text-red-400"
                    >
                      <X className="h-3 w-3 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
