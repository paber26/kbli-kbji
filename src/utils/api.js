import localFieldCases from '../data/fieldCases.json';
import localAnalytics from '../data/analyticsSummary.json';

const API_BASE = '/api';

/**
 * Fetch all approved cases from SQLite backend (with fallback to local JSON)
 */
export async function fetchApprovedCases() {
  try {
    const res = await fetch(`${API_BASE}/cases`);
    if (!res.ok) throw new Error('API server unreachable');
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Using local fallback cases data:', err);
    return localFieldCases;
  }
}

/**
 * Submit a new contribution (Status: PENDING)
 */
export async function submitContribution(payload) {
  const res = await fetch(`${API_BASE}/contribute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal mengirim data kontribusi.');
  }
  return await res.json();
}

/**
 * Admin Login check
 */
export async function adminLogin(pin) {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'PIN Admin salah.');
  }
  return data;
}

/**
 * Fetch all contributions for admin moderation (filter: ALL | PENDING | APPROVED | REJECTED)
 */
export async function fetchAdminContributions(status = 'ALL') {
  const res = await fetch(`${API_BASE}/admin/contributions?status=${status}`);
  if (!res.ok) {
    throw new Error('Gagal mengambil data moderasi admin.');
  }
  return await res.json();
}

/**
 * Approve contribution
 */
export async function approveContribution(id, payload = {}) {
  const res = await fetch(`${API_BASE}/admin/approve/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menyetujui data.');
  }
  return await res.json();
}

/**
 * Reject contribution
 */
export async function rejectContribution(id, notes) {
  const res = await fetch(`${API_BASE}/admin/reject/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ admin_notes: notes })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Gagal menolak data.');
  }
  return await res.json();
}

/**
 * Delete contribution
 */
export async function deleteContribution(id) {
  const res = await fetch(`${API_BASE}/admin/cases/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    throw new Error('Gagal menghapus data.');
  }
  return await res.json();
}

/**
 * Fetch stats
 */
export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    if (!res.ok) throw new Error('API server unreachable');
    return await res.json();
  } catch (err) {
    return {
      total: localFieldCases.length,
      approved: localFieldCases.length,
      pending: 0,
      rejected: 0
    };
  }
}
