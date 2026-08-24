import * as XLSX from 'xlsx';
import { matchKbliKbji } from './smartMatcher';
import { validateKbliKbjiConsistency } from './consistencyChecker';

/**
 * Parse uploaded Excel or CSV file
 * @param {File} file 
 * @returns {Promise<Array>}
 */
export function parseSurveyExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawJson || rawJson.length < 2) {
          throw new Error('File Excel kosong atau tidak memiliki baris data.');
        }

        const headers = rawJson[0].map(h => String(h || '').trim());
        const rows = rawJson.slice(1);

        // Find column indices
        const findColIdx = (patterns) => {
          return headers.findIndex(h => {
            const low = h.toLowerCase();
            return patterns.some(p => low.includes(p));
          });
        };

        const occtleIdx = findColIdx(['occtle', 'uraian pekerjaan', 'pekerjaan', 'jabatan', 'profesi']);
        const occmtdIdx = findColIdx(['occmtd', 'komoditas', 'tugas', 'barang', 'produk']);
        const bidangIdx = findColIdx(['bidang', 'lapangan usaha', 'tempat kerja', 'kegiatan usaha', 'sektor']);
        const kbliIdx = findColIdx(['kbli', 'kode_kbli', 'kbli_val']);
        const kbjiIdx = findColIdx(['kbji', 'kode_kbji', 'kbji_val']);

        const parsedRows = rows.map((row, index) => {
          const occtle = occtleIdx >= 0 ? String(row[occtleIdx] || '').trim() : '';
          const occmtd = occmtdIdx >= 0 ? String(row[occmtdIdx] || '').trim() : '';
          const bidang = bidangIdx >= 0 ? String(row[bidangIdx] || '').trim() : '';
          const existingKbli = kbliIdx >= 0 ? String(row[kbliIdx] || '').replace('.0','').trim() : '';
          const existingKbji = kbjiIdx >= 0 ? String(row[kbjiIdx] || '').replace('.0','').trim() : '';

          // If standard columns not found, use first 3 columns as fallback
          const fallbackOcctle = occtle || String(row[0] || '').trim();
          const fallbackOccmtd = occmtd || String(row[1] || '').trim();
          const fallbackBidang = bidang || String(row[2] || '').trim();

          // Auto-match
          const matchResult = matchKbliKbji({
            occtle: fallbackOcctle,
            occmtd: fallbackOccmtd,
            bidang: fallbackBidang
          });

          const recKbli = matchResult.kbliRecommendations[0];
          const recKbji = matchResult.kbjiRecommendations[0];

          const suggestedKbliCode = recKbli ? recKbli.code : (existingKbli || '-');
          const suggestedKbliLabel = recKbli ? recKbli.title : '-';
          const suggestedKbjiCode = recKbji ? recKbji.code : (existingKbji || '-');
          const suggestedKbjiLabel = recKbji ? recKbji.title : '-';

          const validation = validateKbliKbjiConsistency(suggestedKbliCode, suggestedKbjiCode);

          return {
            rowId: index + 1,
            rawRow: row,
            occtle: fallbackOcctle,
            occmtd: fallbackOccmtd,
            bidang: fallbackBidang,
            existingKbli,
            existingKbji,
            suggestedKbliCode,
            suggestedKbliLabel,
            suggestedKbjiCode,
            suggestedKbjiLabel,
            confidence: matchResult.confidence,
            topKbliList: matchResult.kbliRecommendations,
            topKbjiList: matchResult.kbjiRecommendations,
            validation
          };
        }).filter(r => r.occtle || r.occmtd || r.bidang);

        resolve(parsedRows);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Export processed batch rows to Excel file
 * @param {Array} processedRows 
 * @param {string} fileName 
 */
export function exportBatchToExcel(processedRows, fileName = 'BPS_KBLI_KBJI_Hasil_Koding.xlsx') {
  const exportData = processedRows.map(r => ({
    'No': r.rowId,
    'Uraian Pekerjaan (occtle)': r.occtle,
    'Uraian Komoditas (occmtd)': r.occmtd,
    'Uraian Lapangan Usaha (bidang)': r.bidang,
    'Kode KBLI Terpilih': r.suggestedKbliCode,
    'Label KBLI': r.suggestedKbliLabel,
    'Kode KBJI Terpilih': r.suggestedKbjiCode,
    'Label KBJI': r.suggestedKbjiLabel,
    'Skor Keyakinan (%)': `${r.confidence}%`,
    'Status Validasi': r.validation.title || 'Normal'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Koding');

  // Auto column widths
  const colWidths = [
    { wch: 6 },
    { wch: 35 },
    { wch: 25 },
    { wch: 30 },
    { wch: 15 },
    { wch: 40 },
    { wch: 15 },
    { wch: 40 },
    { wch: 18 },
    { wch: 30 }
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}
