import { useEffect, useState } from 'react';
import { listProjects, createProject, updateProject, deleteProject, getProject } from '../lib/api';

export default function ProjectBar({ getSnapshot, onLoad, currentProjectId, setCurrentProjectId }) {
  const [projects, setProjects] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function refresh() {
    try { setProjects(await listProjects()); } catch (e) { setError(e.message); }
  }
  useEffect(() => { refresh(); }, []);

  async function handleNew() {
    setCurrentProjectId(null);
  }

  async function handleSave(asNew) {
    const snapshot = getSnapshot();
    if (!snapshot.file_id) { setError('Upload and analyze a song before saving a project.'); return; }
    const name = asNew || !currentProjectId
      ? window.prompt('Project name?', snapshot.suggestedName || 'My Remix')
      : null;
    if ((asNew || !currentProjectId) && !name) return;
    setBusy(true);
    setError(null);
    try {
      if (!asNew && currentProjectId) {
        await updateProject(currentProjectId, snapshot);
      } else {
        const created = await createProject({ ...snapshot, name });
        setCurrentProjectId(created.id);
      }
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleLoad(id) {
    if (!id) return;
    setBusy(true);
    setError(null);
    try {
      const project = await getProject(id);
      setCurrentProjectId(id);
      onLoad(project);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!currentProjectId) return;
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setBusy(true);
    try {
      await deleteProject(currentProjectId);
      setCurrentProjectId(null);
      await refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="project-bar">
      <select value={currentProjectId || ''} onChange={(e) => handleLoad(e.target.value)} disabled={busy}>
        <option value="">Load project…</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name} {p.style_id ? `(${p.style_id})` : ''}</option>
        ))}
      </select>
      <button className="ghost" onClick={handleNew} disabled={busy}>New</button>
      <button onClick={() => handleSave(false)} disabled={busy}>Save</button>
      <button className="ghost" onClick={() => handleSave(true)} disabled={busy}>Save As</button>
      <button className="danger" onClick={handleDelete} disabled={busy || !currentProjectId}>Delete</button>
      {error && <span style={{ color: 'var(--danger)', fontSize: 12 }}>{error}</span>}
    </div>
  );
}
