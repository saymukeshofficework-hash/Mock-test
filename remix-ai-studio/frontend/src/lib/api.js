const BASE = ''; // same-origin; dev server proxies /api to the backend

async function request(path, options = {}) {
  const res = await fetch(BASE + path, options);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      /* ignore non-json error bodies */
    }
    throw new Error(detail);
  }
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res;
}

export function uploadSong(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE + '/api/upload');
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new Error(body.detail || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload.'));
    const form = new FormData();
    form.append('file', file);
    xhr.send(form);
  });
}

export const startAnalysis = (fileId) => request(`/api/analyze/${fileId}`, { method: 'POST' });

export const getJobStatus = (jobId) => request(`/api/status/${jobId}`);

export const cancelJob = (jobId) => request(`/api/cancel/${jobId}`, { method: 'POST' });

export const getOptions = () => request('/api/options');

export const startRemix = (fileId, body) =>
  request(`/api/remix/${fileId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const previewUrl = (resultId) => `/api/remix/preview/${resultId}`;

export const startStems = (fileId) => request(`/api/stems/${fileId}`, { method: 'POST' });

export const stemsStatus = () => request('/api/stems/status');

export const startExport = (resultId, body) =>
  request(`/api/export/${resultId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const originalAudioUrl = (fileId) => `/api/upload/${fileId}/audio`;

export const listProjects = () => request('/api/projects');
export const getProject = (id) => request(`/api/projects/${id}`);
export const createProject = (body) =>
  request('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const updateProject = (id, body) =>
  request(`/api/projects/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const deleteProject = (id) => request(`/api/projects/${id}`, { method: 'DELETE' });

export async function pollJob(jobId, { onStage, intervalMs = 700, timeoutMs = 20 * 60 * 1000 } = {}) {
  const start = Date.now();
  for (;;) {
    const status = await getJobStatus(jobId);
    if (onStage) onStage(status);
    if (status.done) {
      if (status.error) throw new Error(status.error);
      return status.result;
    }
    if (Date.now() - start > timeoutMs) throw new Error('Timed out waiting for processing.');
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}
