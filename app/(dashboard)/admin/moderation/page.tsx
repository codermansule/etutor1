import { createServerClient } from '@/lib/supabase/server';
import { Card } from '@/components/ui/card';
import { Shield, Star, MessageSquare } from 'lucide-react';

export default async function AdminModerationPage() {
  const supabase = await createServerClient();

  // Get recent reviews with low ratings for moderation
  const { data: flaggedReviews } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, profiles!reviews_student_id_fkey(full_name)')
    .lte('rating', 2)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Content Moderation</h1>
        <p className="text-slate-400 mt-1 text-sm">Review flagged content and low-rated reviews.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400" />
          Low-Rated Reviews (1-2 Stars)
        </h2>

        {(!flaggedReviews || flaggedReviews.length === 0) ? (
          <Card className="bg-slate-900/50 border-white/5 p-12 text-center">
            <Shield className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">All Clear</h3>
            <p className="text-sm text-slate-500">No flagged content to review.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {flaggedReviews.map((review: any) => (
              <Card key={review.id} className="bg-slate-900/50 border-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">by {(review.profiles as any)?.full_name || 'Anonymous'}</span>
                    </div>
                    {review.comment ? (
                      <p className="text-sm text-slate-300 flex items-start gap-2">
                        <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0 text-slate-600" />
                        {review.comment}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-600 italic">No comment provided</p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
