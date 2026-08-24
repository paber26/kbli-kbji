import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS survey_cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_code TEXT UNIQUE,
    contributor_name TEXT,
    contributor_role TEXT,
    kode_prov TEXT DEFAULT '71',
    kode_kab TEXT DEFAULT '05',
    nama_wilayah TEXT DEFAULT 'Kabupaten Minahasa Selatan, Sulawesi Utara',
    mjj_occtle TEXT NOT NULL,
    mjj_occmtd TEXT NOT NULL,
    mjj_bidang TEXT NOT NULL,
    mjj_kbli_code TEXT NOT NULL,
    mjj_kbli_label TEXT NOT NULL,
    mjj_kbji_code TEXT NOT NULL,
    mjj_kbji_label TEXT NOT NULL,
    sample_count INTEGER DEFAULT 1,
    variants TEXT,
    action_type TEXT CHECK(action_type IN ('CREATE', 'UPDATE', 'DELETE')) DEFAULT 'CREATE',
    target_case_id INTEGER,
    proposer_notes TEXT,
    status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_status ON survey_cases(status);
  CREATE INDEX IF NOT EXISTS idx_kbli ON survey_cases(mjj_kbli_code);
  CREATE INDEX IF NOT EXISTS idx_kbji ON survey_cases(mjj_kbji_code);
`);

// Apply column migrations if table already existed
try { db.exec("ALTER TABLE survey_cases ADD COLUMN sample_count INTEGER DEFAULT 1;"); } catch {}
try { db.exec("ALTER TABLE survey_cases ADD COLUMN variants TEXT;"); } catch {}
try { db.exec("ALTER TABLE survey_cases ADD COLUMN action_type TEXT DEFAULT 'CREATE';"); } catch {}
try { db.exec("ALTER TABLE survey_cases ADD COLUMN target_case_id INTEGER;"); } catch {}
try { db.exec("ALTER TABLE survey_cases ADD COLUMN proposer_notes TEXT;"); } catch {}

export function reseedDatabase() {
  console.log('Re-seeding SQLite database with consolidated deduplicated records...');
  
  // Recreate table with new columns
  db.exec(`
    DROP TABLE IF EXISTS survey_cases;
    CREATE TABLE survey_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      case_code TEXT UNIQUE,
      contributor_name TEXT,
      contributor_role TEXT,
      kode_prov TEXT DEFAULT '71',
      kode_kab TEXT DEFAULT '05',
      nama_wilayah TEXT DEFAULT 'Kabupaten Minahasa Selatan, Sulawesi Utara',
      mjj_occtle TEXT NOT NULL,
      mjj_occmtd TEXT NOT NULL,
      mjj_bidang TEXT NOT NULL,
      mjj_kbli_code TEXT NOT NULL,
      mjj_kbli_label TEXT NOT NULL,
      mjj_kbji_code TEXT NOT NULL,
      mjj_kbji_label TEXT NOT NULL,
      sample_count INTEGER DEFAULT 1,
      variants TEXT,
      action_type TEXT CHECK(action_type IN ('CREATE', 'UPDATE', 'DELETE')) DEFAULT 'CREATE',
      target_case_id INTEGER,
      proposer_notes TEXT,
      status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_status ON survey_cases(status);
    CREATE INDEX IF NOT EXISTS idx_kbli ON survey_cases(mjj_kbli_code);
    CREATE INDEX IF NOT EXISTS idx_kbji ON survey_cases(mjj_kbji_code);
  `);

  const jsonPath = path.resolve(__dirname, '../src/data/fieldCases.json');
  if (fs.existsSync(jsonPath)) {
    const raw = fs.readFileSync(jsonPath, 'utf8');
    const cases = JSON.parse(raw);

    const insertStmt = db.prepare(`
      INSERT INTO survey_cases (
        case_code, contributor_name, contributor_role, kode_prov, kode_kab,
        nama_wilayah, mjj_occtle, mjj_occmtd, mjj_bidang,
        mjj_kbli_code, mjj_kbli_label, mjj_kbji_code, mjj_kbji_label,
        sample_count, variants,
        status, created_at, reviewed_at, reviewed_by
      ) VALUES (
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SISTEM BPS MINSEL'
      )
    `);

    const insertMany = db.transaction((rows) => {
      for (const r of rows) {
        insertStmt.run(
          r.id,
          'Petugas Survei BPS Minsel',
          'Pencacah Lapangan (PCL)',
          r.kode_prov || '71',
          r.kode_kab || '05',
          r.nama_wilayah || 'Kabupaten Minahasa Selatan, Sulawesi Utara',
          r.mjj.occtle,
          r.mjj.occmtd,
          r.mjj.bidang,
          r.mjj.kbli_code,
          r.mjj.kbli_label,
          r.mjj.kbji_code,
          r.mjj.kbji_label,
          r.sample_count || 1,
          JSON.stringify(r.variants || [])
        );
      }
    });

    insertMany(cases);
    console.log(`Successfully seeded ${cases.length} clean consolidated records into SQLite.`);
  }
}

// Auto seed if empty or outdated
const countRow = db.prepare("SELECT COUNT(*) as count FROM survey_cases WHERE status = 'APPROVED'").get();
if (countRow.count < 500) {
  reseedDatabase();
}

export default db;
