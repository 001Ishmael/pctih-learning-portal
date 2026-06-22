import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, X, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';
import type { Course, LearningMaterial } from '../../lib/types';
import { Spinner, EmptyState } from '../../components/ui/States';

export default function TrainerMaterials() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [materials, setMaterials] = useState<Record<string, LearningMaterial[]>>({});
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', notes: '', file_url: '' });
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!profile) return;
    setLoading(true);
    const { data: trainer } = await supabase.from('trainers').select('id').eq('profile_id', profile.id).maybeSingle();
    if (!trainer) {
      setLoading(false);
      return;
    }
    const { data: courseList } = await supabase.from('courses').select('*').eq('trainer_id', trainer.id);
    setCourses(courseList ?? []);
    const map: Record<string, LearningMaterial[]> = {};
    for (const c of courseList ?? []) {
      const { data } = await supabase.from('learning_materials').select('*').eq('course_id', c.id);
      map[c.id] = data ?? [];
    }
    setMaterials(map);
    setLoading(false);
  }

  useEffect(() => { load(); }, [profile]);

  async function handleAdd(courseId: string) {
    if (!form.title) {
      toast.error('Title is required.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.from('learning_materials').insert({ course_id: courseId, ...form, uploaded_by: profile?.id });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Material added.');
    setAdding(null);
    setForm({ title: '', notes: '', file_url: '' });
    load();
  }

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy mb-6">Learning Materials</h1>
      {courses.length === 0 ? (
        <EmptyState title="No courses assigned" />
      ) : (
        <div className="space-y-6">
          {courses.map((c) => (
            <div key={c.id} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-navy">{c.title}</h2>
                <button onClick={() => setAdding(c.id)} className="btn-outline text-sm"><Plus className="h-4 w-4" /> Add Material</button>
              </div>
              {(materials[c.id] ?? []).length === 0 ? (
                <p className="text-sm text-gray-400">No materials uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {materials[c.id].map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText className="h-4 w-4 text-brand-600" />
                      {m.file_url ? <a href={m.file_url} target="_blank" rel="noreferrer" className="text-brand-600 underline">{m.title}</a> : m.title}
                    </li>
                  ))}
                </ul>
              )}

              {adding === c.id && (
                <div className="mt-4 border-t border-gray-100 pt-4 space-y-3">
                  <input className="input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <input className="input" placeholder="File URL (link to material)" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} />
                  <textarea className="input" placeholder="Class notes" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  <div className="flex gap-2">
                    <button onClick={() => setAdding(null)} className="btn-ghost"><X className="h-4 w-4" /> Cancel</button>
                    <button onClick={() => handleAdd(c.id)} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
