'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';

export default function CourseEnrollButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setEnrolled(true);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to enroll');
      }
    } catch {
      alert('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (enrolled) {
    return (
      <Button disabled className="bg-emerald-500 text-white font-bold">
        <CheckCircle className="h-4 w-4 mr-2" /> Enrolled
      </Button>
    );
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} className="bg-sky-500 text-slate-950 font-bold">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll Now'}
    </Button>
  );
}
