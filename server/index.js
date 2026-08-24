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
  let parsedVariants = [];
  try {
    if (row.variants) {
      parsedVariants = typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants;
    }
  } catch {}

  return {
    id: row.case_code || `CASE-${row.id}`,
    db_id: row.id,
    index: row.id,
    contributor_name: row.contributor_name || 'Petugas Lapangan / Responden',
    contributor_role: row.contributor_role || 'PCL',
    kode_prov: row.kode_prov || '71',
    kode_kab: row.kode_kab || '05',
    nama_wilayah: row.nama_wilayah || 'Kabupaten Minahasa Selatan, Sulawesi Utara',
    status: row.status,
    action_type: row.action_type || 'CREATE',
    target_case_id: row.target_case_id || null,
    proposer_notes: row.proposer_notes || '',
    admin_notes: row.admin_notes || '',
    sample_count: row.sample_count || 1,
    variants: parsedVariants,
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

// 1. Public API: Get All Approved Cases (for Search and Bank Data)
app.get('/api/cases', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM survey_cases 
      WHERE status = 'APPROVED' AND action_type != 'DELETE'
      ORDER BY id DESC
    `).all();

    const formatted = rows.map(formatCaseRow);
    res.json(formatted);
  } catch (err) {
    console.error('Error fetching approved cases:', err);
    res.status(500).json({ error: 'Gagal mengambil data kasus.' });
  }
});

// 2. Public API: Submit New Case Contribution (Status: PENDING, Action: CREATE)
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
      kbji_label = '',
      notes = ''
    } = req.body;

    if (!occtle || !occmtd || !bidang) {
      return res.status(400).json({ 
        error: 'Uraian pekerjaan (R.10.2), komoditas (R.10.3), dan lapangan usaha (R.10.4) wajib diisi.' 
      });
    }

    const totalCount = db.prepare('SELECT COUNT(*) as count FROM survey_cases').get().count;
    const case_code = `USUL-TAMBAH-${String(totalCount + 1).padStart(4, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO survey_cases (
        case_code, contributor_name, contributor_role,
        kode_prov, kode_kab, nama_wilayah,
        mjj_occtle, mjj_occmtd, mjj_bidang,
        mjj_kbli_code, mjj_kbli_label,
        mjj_kbji_code, mjj_kbji_label,
        action_type, proposer_notes,
        status
      ) VALUES (
        ?, ?, ?,
        '71', '05', 'Kabupaten Minahasa Selatan, Sulawesi Utara',
        ?, ?, ?,
        ?, ?,
        ?, ?,
        'CREATE', ?,
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
      kbji_label.trim(),
      notes.trim()
    );

    const inserted = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      message: 'Usulan data baru berhasil dikirim dan menunggu persetujuan Admin BPS.',
      data: formatCaseRow(inserted)
    });
  } catch (err) {
    console.error('Error submitting contribution:', err);
    res.status(500).json({ error: 'Gagal mengirim usulan data baru.' });
  }
});

// 3. Public API: Propose Edit on Existing Case (Status: PENDING, Action: UPDATE)
app.post('/api/contribute/edit', (req, res) => {
  try {
    const {
      target_case_id,
      contributor_name = 'Kontributor Lapangan',
      contributor_role = 'Petugas / Responden',
      occtle,
      occmtd,
      bidang,
      kbli_code,
      kbli_label,
      kbji_code,
      kbji_label,
      notes = ''
    } = req.body;

    if (!target_case_id) {
      return res.status(400).json({ error: 'Target ID kasus yang ingin diubah harus disertakan.' });
    }

    const existing = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(target_case_id);
    if (!existing) {
      return res.status(404).json({ error: 'Kasus yang ingin diubah tidak ditemukan.' });
    }

    const totalCount = db.prepare('SELECT COUNT(*) as count FROM survey_cases').get().count;
    const case_code = `USUL-EDIT-${String(totalCount + 1).padStart(4, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO survey_cases (
        case_code, contributor_name, contributor_role,
        kode_prov, kode_kab, nama_wilayah,
        mjj_occtle, mjj_occmtd, mjj_bidang,
        mjj_kbli_code, mjj_kbli_label,
        mjj_kbji_code, mjj_kbji_label,
        action_type, target_case_id, proposer_notes,
        status
      ) VALUES (
        ?, ?, ?,
        '71', '05', 'Kabupaten Minahasa Selatan, Sulawesi Utara',
        ?, ?, ?,
        ?, ?,
        ?, ?,
        'UPDATE', ?, ?,
        'PENDING'
      )
    `);

    const info = stmt.run(
      case_code,
      contributor_name.trim(),
      contributor_role.trim(),
      (occtle || existing.mjj_occtle).trim(),
      (occmtd || existing.mjj_occmtd).trim(),
      (bidang || existing.mjj_bidang).trim(),
      (kbli_code || existing.mjj_kbli_code).trim(),
      (kbli_label || existing.mjj_kbli_label).trim(),
      (kbji_code || existing.mjj_kbji_code).trim(),
      (kbji_label || existing.mjj_kbji_label).trim(),
      target_case_id,
      notes.trim()
    );

    const inserted = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      message: 'Usulan perbaikan data telah dikirim dan menunggu persetujuan Admin BPS.',
      data: formatCaseRow(inserted)
    });
  } catch (err) {
    console.error('Error proposing edit:', err);
    res.status(500).json({ error: 'Gagal mengajukan perbaikan data.' });
  }
});

// 4. Public API: Propose Deletion of Existing Case (Status: PENDING, Action: DELETE)
app.post('/api/contribute/delete', (req, res) => {
  try {
    const {
      target_case_id,
      contributor_name = 'Kontributor Lapangan',
      contributor_role = 'Petugas / Responden',
      reason = 'Data tidak relevan / duplikasi'
    } = req.body;

    if (!target_case_id) {
      return res.status(400).json({ error: 'Target ID kasus yang ingin dihapus harus disertakan.' });
    }

    const existing = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(target_case_id);
    if (!existing) {
      return res.status(404).json({ error: 'Kasus yang ingin dihapus tidak ditemukan.' });
    }

    const totalCount = db.prepare('SELECT COUNT(*) as count FROM survey_cases').get().count;
    const case_code = `USUL-HAPUS-${String(totalCount + 1).padStart(4, '0')}`;

    const stmt = db.prepare(`
      INSERT INTO survey_cases (
        case_code, contributor_name, contributor_role,
        kode_prov, kode_kab, nama_wilayah,
        mjj_occtle, mjj_occmtd, mjj_bidang,
        mjj_kbli_code, mjj_kbli_label,
        mjj_kbji_code, mjj_kbji_label,
        action_type, target_case_id, proposer_notes,
        status
      ) VALUES (
        ?, ?, ?,
        '71', '05', 'Kabupaten Minahasa Selatan, Sulawesi Utara',
        ?, ?, ?,
        ?, ?,
        ?, ?,
        'DELETE', ?, ?,
        'PENDING'
      )
    `);

    const info = stmt.run(
      case_code,
      contributor_name.trim(),
      contributor_role.trim(),
      existing.mjj_occtle,
      existing.mjj_occmtd,
      existing.mjj_bidang,
      existing.mjj_kbli_code,
      existing.mjj_kbli_label,
      existing.mjj_kbji_code,
      existing.mjj_kbji_label,
      target_case_id,
      reason.trim()
    );

    const inserted = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({
      message: 'Permohonan penghapusan data telah dikirim dan menunggu persetujuan Admin BPS.',
      data: formatCaseRow(inserted)
    });
  } catch (err) {
    console.error('Error proposing delete:', err);
    res.status(500).json({ error: 'Gagal mengajukan penghapusan data.' });
  }
});

// 5. Admin API: Get All Contributions / Moderation Queue
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

// 6. Admin API: Approve Request (CREATE, UPDATE, or DELETE)
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

    const request = db.prepare('SELECT * FROM survey_cases WHERE id = ?').get(id);
    if (!request) {
      return res.status(404).json({ error: 'Data usulan tidak ditemukan.' });
    }

    if (request.action_type === 'CREATE') {
      // Approve new case
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

      stmt.run(occtle, occmtd, bidang, kbli_code, kbli_label, kbji_code, kbji_label, reviewed_by, id);
    } else if (request.action_type === 'UPDATE' && request.target_case_id) {
      // Apply updates to the target case
      const updateTargetStmt = db.prepare(`
        UPDATE survey_cases SET
          mjj_occtle = COALESCE(?, ?),
          mjj_occmtd = COALESCE(?, ?),
          mjj_bidang = COALESCE(?, ?),
          mjj_kbli_code = COALESCE(?, ?),
          mjj_kbli_label = COALESCE(?, ?),
          mjj_kbji_code = COALESCE(?, ?),
          mjj_kbji_label = COALESCE(?, ?),
          reviewed_at = CURRENT_TIMESTAMP,
          reviewed_by = ?
        WHERE id = ?
      `);

      updateTargetStmt.run(
        occtle, request.mjj_occtle,
        occmtd, request.mjj_occmtd,
        bidang, request.mjj_bidang,
        kbli_code, request.mjj_kbli_code,
        kbli_label, request.mjj_kbli_label,
        kbji_code, request.mjj_kbji_code,
        kbji_label, request.mjj_kbji_label,
        reviewed_by,
        request.target_case_id
      );

      // Mark request as APPROVED
      db.prepare(`
        UPDATE survey_cases SET status = 'APPROVED', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?
      `).run(reviewed_by, id);
    } else if (request.action_type === 'DELETE' && request.target_case_id) {
      // Delete the target case
      db.prepare('DELETE FROM survey_cases WHERE id = ?').run(request.target_case_id);

      // Mark request as APPROVED
      db.prepare(`
        UPDATE survey_cases SET status = 'APPROVED', reviewed_at = CURRENT_TIMESTAMP, reviewed_by = ? WHERE id = ?
      `).run(reviewed_by, id);
    }

    res.json({
      message: 'Usulan berhasil disetujui dan diterapkan ke Bank Data!'
    });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ error: 'Gagal menyetujui usulan.' });
  }
});

// 7. Admin API: Reject Request with Notes
app.put('/api/admin/reject/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes = 'Usulan tidak disetujui / tidak sesuai standar BPS', reviewed_by = 'Admin BPS Minsel' } = req.body;

    const stmt = db.prepare(`
      UPDATE survey_cases SET
        status = 'REJECTED',
        admin_notes = ?,
        reviewed_at = CURRENT_TIMESTAMP,
        reviewed_by = ?
      WHERE id = ?
    `);

    stmt.run(admin_notes, reviewed_by, id);
    res.json({ message: 'Usulan telah ditolak.' });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: 'Gagal menolak usulan.' });
  }
});

// 8. Admin API: Direct Delete Case
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

// 9. Statistics API
app.get('/api/stats', (req, res) => {
  try {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'APPROVED' AND action_type != 'DELETE' THEN 1 ELSE 0 END) as approved,
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
