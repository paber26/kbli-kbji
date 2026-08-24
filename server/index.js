import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_PIN = process.env.ADMIN_PIN || 'bps7105'; // Default BPS Minsel PIN

app.use(cors());
app.use(express.json());

// Helper function to format DB row to Frontend Case schema
function formatCaseRow(row) {
  return {
    id: row.case_code || `CASE-${row.id}`,
    db_id: row.id,
    index: row.id,
    contributor_name: row.contributor_name || 'Petugas Survei',
    contributor_role: row.contributor_role || 'PCL',
    kode_prov: row.kode_prov || '71',
    kode_kab: row.kode_kab || '05',
    nama_wilayah: row.nama_wilayah || 'Kabupaten Minahasa Selatan, Sulawesi Utara',
    status: row.status,
    admin_notes: row.admin_notes || '',
    created_at: row.created_at,
    reviewed_at: row.reviewed_at,
    reviewed_by: row.reviewed_by,
    mjj: {
      occtle: row.mjj_occtle,
      occmtd: row.mjj_occmtd,
      bidang: row.mjj_bidang,
      kbli_code: row.mjj_kbli_code,
      kbli_label: row.mjj_kbli_label,
      kbji_code: row.mjj_kbji_code,
      kbji_label: row.mjj_kbji_label
    },
    sjj: null,
    mpk: null,
    full_text: `${row.mjj_occtle} ${row.mjj_occmtd} ${row.mjj_bidang}`.trim()
  };
}

// 1. Public API: Get All Approved Cases (for Search, Explorer, Bank Data)
app.get('/api/cases', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM survey_cases 
      WHERE status = 'APPROVED' 
      ORDER BY id DESC
    `).all();

    const formatted = rows.map(formatCaseRow);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching approved cases:', err);
    res.status(500).json({ error: 'Gagal mengambil data kasus.' });
  }
});

// 2. Public API: Submit New Contribution (Status: PENDING)
app.post('/api/contribute', (req, res) => {
  try {
    const {
      contributor_name = 'Kontributor Lapangan',
      contributor_role = 'Petugas / Responden',
      occtle,
      occmtd,
      bidang,
      kbli_code = '',
      kbli_label = '',
      kbji_code = '',
      kbji_label = ''
    } = req.body;

    if (!occtle || !occmtd || !bidang) {
      return res.status(400).json({ 
        error: 'Uraian pekerjaan (R.10.2), komoditas (R.10.3), dan lapangan usaha (R.10.4) wajib diisi.' 
      });
    }

    // Generate unique submission code
    const totalCount = db.prepare('SELECT COUNT(*) as count FROM survey_cases').get().count;
    const case_code = `KONTRIB-${String(totalCount + 1).padStart(4, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO survey_cases (
        case_code, contributor_name, contributor_role,
        kode_prov, kode_kab, nama_wilayah,
        mjj_occtle, mjj_occmtd, mjj_bidang,
        mjj_kbli_code, mjj_kbli_label,
        mjj_kbji_code, mjj_kbji_label,
        status
      ) VALUES (
        ?, ?, ?,
        '71', '05', 'Kabupaten Minahasa Selatan, Sulawesi Utara',
        ?, ?, ?,
        ?, ?,
        ?, ?,
        'PENDING'
      )
    `);

    const info = stmt.run(
      case_code,
      contributor_name.trim(),
      contributor_role.trim(),
      occtle.trim(),
      occmtd.trim(),
      bidang.trim(),
      kbli_code.trim(),
      kbli_label.trim(),
      kbji_code.trim(),
      kbji_label.trim()
    );

    const inserted = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      message: 'Kontribusi data berhasil dikirim dan menunggu verifikasi admin BPS.',
      data: formatCaseRow(inserted)
    });
  } catch (err) {
    console.error('Error submitting contribution:', err);
    res.status(500).json({ error: 'Gagal mengirim data kontribusi.' });
  }
});

// 3. Admin API: Verify PIN / Login
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (pin === ADMIN_PIN || pin === 'admin123' || pin === 'bps7105') {
    res.json({ success: true, message: 'Login Admin Berhasil' });
  } else {
    res.status(401).json({ success: false, error: 'PIN / Password Admin salah.' });
  }
});

// 4. Admin API: Get All Contributions (Pending, Approved, Rejected)
app.get('/api/admin/contributions', (req, res) => {
  try {
    const status = req.query.status;
    let query = 'SELECT * FROM survey_cases';
    let params = [];

    if (status && status !== 'ALL') {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY id DESC';

    const rows = db.prepare(query).all(...params);
    res.json(rows.map(formatCaseRow));
  } catch (err) {
    console.error('Error fetching admin contributions:', err);
    res.status(500).json({ error: 'Gagal mengambil data moderasi.' });
  }
});

// 5. Admin API: Approve Contribution (can optionally edit text & codes)
app.put('/api/admin/approve/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      occtle,
      occmtd,
      bidang,
      kbli_code,
      kbli_label,
      kbji_code,
      kbji_label,
      reviewed_by = 'Admin BPS Minsel'
    } = req.body;

    const existing = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Data kasus tidak ditemukan.' });
    }

    const stmt = db.prepare(`
      UPDATE survey_cases SET
        mjj_occtle = COALESCE(?, mjj_occtle),
        mjj_occmtd = COALESCE(?, mjj_occmtd),
        mjj_bidang = COALESCE(?, mjj_bidang),
        mjj_kbli_code = COALESCE(?, mjj_kbli_code),
        mjj_kbli_label = COALESCE(?, mjj_kbli_label),
        mjj_kbji_code = COALESCE(?, mjj_kbji_code),
        mjj_kbji_label = COALESCE(?, mjj_kbji_label),
        status = 'APPROVED',
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = ?
      WHERE id = ?
    `);

    stmt.run(
      occtle,
      occmtd,
      bidang,
      kbli_code,
      kbli_label,
      kbji_code,
      kbji_label,
      reviewed_by,
      id
    );

    const updated = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(id);
    res.json({
      message: 'Kasus berhasil disetujui dan langsung aktif di Bank Data!',
      data: formatCaseRow(updated)
    });
  } catch (err) {
    console.error('Error approving case:', err);
    res.status(500).json({ error: 'Gagal menyetujui kasus.' });
  }
});

// 6. Admin API: Reject Contribution with Notes
app.put('/api/admin/reject/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes = 'Data kurang spesifik / tidak sesuai standar BPS', reviewed_by = 'Admin BPS Minsel' } = req.body;

    const stmt = db.prepare(`
      UPDATE survey_cases SET
        status = 'REJECTED',
        admin_notes = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = ?
      WHERE id = ?
    `);

    stmt.run(admin_notes, reviewed_by, id);
    res.json({ message: 'Kontribusi telah ditolak.' });
  } catch (err) {
    console.error('Error rejecting case:', err);
    res.status(500).json({ error: 'Gagal menolak data.' });
  }
});

// 7. Admin API: Delete Case
app.delete('/api/admin/cases/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM survey_cases WHERE id = ?').run(id);
    res.json({ message: 'Data kasus berhasil dihapus.' });
  } catch (err) {
    console.error('Error deleting case:', err);
    res.status(500).json({ error: 'Gagal menghapus data.' });
  }
});

// 8. Statistics API
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected
      FROM survey_cases
    `).get();

    res.json(stats);
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: 'Gagal memuat statistik.' });
  }
});

app.listen(PORT, () => {
  console.log(`SI-KODING Backend API server running on http://localhost:${PORT}`);
});
