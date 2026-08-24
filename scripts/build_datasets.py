import openpyxl
import json
import re
import os
from collections import Counter, defaultdict

os.makedirs('src/data', exist_ok=True)

wb = openpyxl.load_workbook('KBLI KBJI.xlsx', data_only=True)
ws = wb['Sheet1']
rows = list(ws.iter_rows(values_only=True))
headers = rows[0]

def clean_val(v):
    if v is None:
        return ''
    s = str(v).strip()
    if s.endswith('.0'):
        s = s[:-2]
    return s

def clean_kbli_code(code_val, label):
    c = clean_val(code_val)
    if c:
        return c.zfill(5)
    if label:
        m = re.search(r'\[(\d+)\]', label)
        if m:
            return m.group(1).zfill(5)
    return ''

def clean_kbji_code(code_val, label):
    c = clean_val(code_val)
    if c:
        return c.zfill(4)
    if label:
        m = re.search(r'\[(\d+)\]', label)
        if m:
            return m.group(1).zfill(4)
    return ''

def clean_label(label):
    if not label:
        return ''
    s = re.sub(r'^\[\d+\]\s*', '', str(label).strip())
    return s

KBLI_CATEGORIES = {
    "A": {"name": "Pertanian, Kehutanan Dan Perikanan", "start": 1, "end": 3, "color": "#10B981", "desc": "Mencakup pemanfaatan sumber daya alam hayati nabati dan hewani."},
    "B": {"name": "Pertambangan Dan Penggalian", "start": 5, "end": 9, "color": "#64748B", "desc": "Mencakup ekstraksi mineral padat, cair, atau gas yang terbentuk secara alami."},
    "C": {"name": "Industri Pengolahan", "start": 10, "end": 33, "color": "#F59E0B", "desc": "Kegiatan transformasi fisik atau kimiawi dari material menjadi produk baru."},
    "D": {"name": "Pengadaan Listrik, Gas, Uap/Air Panas Dan Udara Dingin", "start": 35, "end": 35, "color": "#EAB308", "desc": "Penyediaan tenaga listrik, gas alam, uap dan pendingin udara."},
    "E": {"name": "Pengelolaan Air, Air Limbah, Sampah & Remediasi", "start": 36, "end": 39, "color": "#06B6D4", "desc": "Pengumpulan, pengolahan, dan pembuangan berbagai bentuk limbah."},
    "F": {"name": "Konstruksi", "start": 41, "end": 43, "color": "#EC4899", "desc": "Konstruksi umum dan spesialis untuk bangunan gedung dan pekerjaan sipil."},
    "G": {"name": "Perdagangan Besar Dan Eceran; Reparasi Mobil & Motor", "start": 45, "end": 47, "color": "#3B82F6", "desc": "Perdagangan partai besar dan eceran tanpa mengubah bentuk barang."},
    "H": {"name": "Pengangkutan Dan Pergudangan", "start": 49, "end": 53, "color": "#8B5CF6", "desc": "Angkutan penumpang atau barang (darat, air, udara) dan pergudangan."},
    "I": {"name": "Penyediaan Akomodasi Dan Makan Minum", "start": 55, "end": 56, "color": "#F97316", "desc": "Penyediaan penginapan jangka pendek dan makanan/minuman siap saji."},
    "J": {"name": "Informasi Dan Komunikasi", "start": 58, "end": 63, "color": "#6366F1", "desc": "Produksi dan distribusi informasi, media, penyiaran, telekomunikasi dan TI."},
    "K": {"name": "Aktivitas Keuangan Dan Asuransi", "start": 64, "end": 66, "color": "#14B8A6", "desc": "Transaksi keuangan, perbankan, asuransi, dan dana pensiun."},
    "L": {"name": "Real Estat", "start": 68, "end": 68, "color": "#84CC16", "desc": "Penyewaan, pembelian, penjualan, dan pengelolaan properti real estat."},
    "M": {"name": "Aktivitas Profesional, Ilmiah Dan Teknis", "start": 69, "end": 75, "color": "#A855F7", "desc": "Aktivitas keahlian khusus ilmiah, hukum, akuntansi, dan teknik."},
    "N": {"name": "Aktivitas Penyewaan, Ketenagakerjaan & Penunjang Usaha", "start": 77, "end": 82, "color": "#0EA5E9", "desc": "Penyewaan barang, penyedia tenaga kerja, agen travel, keamanan."},
    "O": {"name": "Administrasi Pemerintahan, Pertahanan & Jamsos Wajib", "start": 84, "end": 84, "color": "#1E3A8A", "desc": "Kegiatan pemerintahan, peradilan, kepolisian, dan pertahanan."},
    "P": {"name": "Pendidikan", "start": 85, "end": 85, "color": "#4F46E5", "desc": "Pendidikan formal dan non-formal pada semua tingkatan tingkatan."},
    "Q": {"name": "Aktivitas Kesehatan Manusia Dan Sosial", "start": 86, "end": 88, "color": "#EF4444", "desc": "Pelayanan kesehatan medis, rumah sakit, klinik, dan panti sosial."},
    "R": {"name": "Kesenian, Hiburan Dan Rekreasi", "start": 90, "end": 93, "color": "#D946EF", "desc": "Aktivitas seni, pertunjukan, museum, olahraga, dan rekreasi."},
    "S": {"name": "Aktivitas Jasa Lainnya", "start": 94, "end": 96, "color": "#475569", "desc": "Aktivitas organisasi, reparasi perlengkapan rumah tangga, pangkas rambut, dll."},
    "T": {"name": "Aktivitas Rumah Tangga Sebagai Pemberi Kerja", "start": 97, "end": 98, "color": "#78716C", "desc": "Pekerjaan asisten rumah tangga dan produksi keluarga untuk konsumsi sendiri."},
    "U": {"name": "Aktivitas Badan Internasional", "start": 99, "end": 99, "color": "#334155", "desc": "Aktivitas kedutaan, konsulat, PBB, dan lembaga internasional."}
}

KBLI_DIVISIONS = {
    "01": "Pertanian Tanaman, Peternakan, Perburuan dan Kegiatan YBDI",
    "02": "Kehutanan dan Penebangan Kayu",
    "03": "Perikanan",
    "05": "Pertambangan Batu Bara dan Lignit",
    "06": "Pertambangan Minyak Bumi dan Gas Alam dan Panas Bumi",
    "07": "Pertambangan Bijih Logam",
    "08": "Pertambangan dan Penggalian Lainnya",
    "09": "Aktivitas Jasa Penunjang Pertambangan",
    "10": "Industri Makanan",
    "11": "Industri Minuman",
    "12": "Industri Pengolahan Tembakau",
    "13": "Industri Tekstil",
    "14": "Industri Pakaian Jadi",
    "15": "Industri Kulit, Barang dari Kulit dan Alas Kaki",
    "16": "Industri Kayu, Barang dari Kayu dan Gabus",
    "17": "Industri Kertas dan Barang dari Kertas",
    "18": "Industri Pencetakan dan Reproduksi Media Rekaman",
    "19": "Industri Produk dari Batu Bara dan Pengilangan Minyak Bumi",
    "20": "Industri Bahan Kimia dan Barang dari Bahan Kimia",
    "21": "Industri Farmasi, Obat Kimia dan Tradisional",
    "22": "Industri Karet, Barang dari Karet dan Plastik",
    "23": "Industri Barang Galian Bukan Logam",
    "24": "Industri Logam Dasar",
    "25": "Industri Barang Logam, Bukan Mesin dan Peralatannya",
    "26": "Industri Komputer, Barang Elektronik dan Optik",
    "27": "Industri Peralatan Listrik",
    "28": "Industri Mesin dan Perlengkapan YTDL",
    "29": "Industri Kendaraan Bermotor, Trailer dan Semi Trailer",
    "30": "Industri Alat Angkutan Lainnya",
    "31": "Industri Furnitur",
    "32": "Industri Pengolahan Lainnya",
    "33": "Jasa Reparasi dan Pemasangan Mesin dan Peralatan",
    "35": "Pengadaan Listrik, Gas, Uap/Air Panas dan Udara Dingin",
    "36": "Pengelolaan Air",
    "37": "Pengelolaan Air Limbah",
    "38": "Pengelolaan dan Daur Ulang Sampah",
    "39": "Aktivitas Remediasi dan Pengelolaan Limbah Lainnya",
    "41": "Konstruksi Gedung",
    "42": "Konstruksi Bangunan Sipil",
    "43": "Konstruksi Khusus",
    "45": "Perdagangan, Reparasi dan Perawatan Mobil dan Sepeda Motor",
    "46": "Perdagangan Besar, Bukan Mobil dan Sepeda Motor",
    "47": "Perdagangan Eceran, Bukan Mobil dan Sepeda Motor",
    "49": "Angkutan Darat dan Angkutan Melalui Saluran Pipa",
    "50": "Angkutan Perairan",
    "51": "Angkutan Udara",
    "52": "Pergudangan dan Aktivitas Penunjang Angkutan",
    "53": "Pos dan Kurir",
    "55": "Penyediaan Akomodasi",
    "56": "Penyediaan Makanan dan Minuman",
    "58": "Aktivitas Penerbitan",
    "59": "Aktivitas Produksi Gambar Bergerak, Video, Suara dan Musik",
    "60": "Aktivitas Penyiaran dan Pemrograman",
    "61": "Telekomunikasi",
    "62": "Aktivitas Pemrograman, Konsultasi Komputer dan TI",
    "63": "Aktivitas Jasa Informasi",
    "64": "Aktivitas Jasa Keuangan, Bukan Asuransi dan Dana Pensiun",
    "65": "Asuransi, Reasuransi dan Dana Pensiun",
    "66": "Aktivitas Penunjang Jasa Keuangan dan Asuransi",
    "68": "Real Estat",
    "69": "Aktivitas Hukum dan Akuntansi",
    "70": "Aktivitas Kantor Pusat dan Konsultasi Manajemen",
    "71": "Aktivitas Arsitektur, Keinsinyuran dan Analisis Teknis",
    "72": "Penelitian dan Pengembangan Ilmu Pengetahuan",
    "73": "Periklanan dan Penelitian Pasar",
    "74": "Aktivitas Profesional, Ilmiah dan Teknis Lainnya",
    "75": "Aktivitas Kesehatan Hewan",
    "77": "Aktivitas Penyewaan dan Sewa Guna Usaha Tanpa Hak Opsi",
    "78": "Aktivitas Ketenagakerjaan",
    "79": "Aktivitas Agen Perjalanan dan Jasa Reservasi",
    "80": "Aktivitas Keamanan dan Penyelidikan",
    "81": "Aktivitas Jasa Untuk Gedung dan Pertamanan",
    "82": "Aktivitas Administrasi dan Penunjang Kantor",
    "84": "Administrasi Pemerintahan, Pertahanan dan Jaminan Sosial Wajib",
    "85": "Pendidikan",
    "86": "Aktivitas Kesehatan Manusia",
    "87": "Aktivitas Perawatan di Lembaga Sosial",
    "88": "Aktivitas Sosial Tanpa Akomodasi",
    "90": "Aktivitas Hiburan, Seni dan Kreativitas",
    "91": "Perpustakaan, Arsip, Museum dan Kebudayaan",
    "92": "Aktivitas Perjudian dan Pertaruhan",
    "93": "Aktivitas Olahraga dan Rekreasi Lainnya",
    "94": "Aktivitas Keanggotaan Organisasi",
    "95": "Reparasi Komputer dan Barang Pribadi Rumah Tangga",
    "96": "Aktivitas Jasa Perorangan Lainnya",
    "97": "Aktivitas Rumah Tangga Sebagai Pemberi Kerja",
    "98": "Aktivitas Produksi Rumah Tangga Sendiri",
    "99": "Aktivitas Badan Internasional"
}

KBJI_MAJOR_GROUPS = {
    "1": {"name": "Manajer", "color": "#4F46E5", "desc": "Merencanakan, memimpin, mengkoordinasikan dan mengevaluasi aktivitas bisnis/organisasi."},
    "2": {"name": "Profesional", "color": "#06B6D4", "desc": "Menerapkan pengetahuan ilmiah/artistik tingkat tinggi dalam bidang spesifik."},
    "3": {"name": "Teknisi Dan Asisten Profesional", "color": "#10B981", "desc": "Melakukan tugas teknis penunjang profesional dan operasional terapan."},
    "4": {"name": "Tenaga Tata Usaha", "color": "#3B82F6", "desc": "Mengatur, mengolah, dan mencatat informasi operasional kantor/organisasi."},
    "5": {"name": "Tenaga Usaha Jasa Dan Tenaga Penjualan", "color": "#F59E0B", "desc": "Menyediakan layanan pribadi, perlindungan, dan penjualan barang/jasa."},
    "6": {"name": "Pekerja Terampil Pertanian, Kehutanan Dan Perikanan", "color": "#84CC16", "desc": "Menanam, memanen tanaman dan memelihara/menangkap hewan untuk pasar."},
    "7": {"name": "Pekerja Pengolahan, Kerajinan Dan YBTD", "color": "#EC4899", "desc": "Membuat, merawat, dan memperbaiki struktur bangunan, mesin, atau kerajinan."},
    "8": {"name": "Operator Dan Perakit Mesin", "color": "#8B5CF6", "desc": "Mengoperasikan mesin pabrik, peralatan stasioner, dan mengemudikan kendaraan."},
    "9": {"name": "Tenaga Kebersihan Dan Tenaga Kasar (Buruh)", "color": "#EF4444", "desc": "Melakukan tugas fisik sederhana dan rutin dengan tenaga manual."},
    "0": {"name": "Angkatan Bersenjata", "color": "#1E3A8A", "desc": "Personel militer dan pertahanan negara."}
}

KBJI_SUBMAJORS = {
    "11": "Manajer Eksekutif, Pejabat Tinggi dan Anggota Badan Legislatif",
    "12": "Manajer Administrasi dan Komersial",
    "13": "Manajer Produksi dan Pelayanan Khusus",
    "14": "Manajer Perhotelan, Ritel dan Pelayanan Lainnya",
    "21": "Profesional Sains dan Teknik",
    "22": "Profesional Kesehatan",
    "23": "Profesional Pendidikan",
    "24": "Profesional Bisnis dan Administrasi",
    "25": "Profesional Teknologi Informasi dan Komunikasi",
    "26": "Profesional Hukum, Sosial dan Kebudayaan",
    "31": "Teknisi Sains dan Teknik",
    "32": "Tenaga Madya Kesehatan",
    "33": "Tenaga Madya Bisnis dan Administrasi",
    "34": "Tenaga Madya Hukum, Sosial dan Budaya",
    "35": "Teknisi Informasi dan Komunikasi",
    "41": "Tenaga Tata Usaha Umum dan Kantor",
    "42": "Tenaga Layanan Pelanggan",
    "43": "Tenaga Pencatat Angka dan Material",
    "44": "Tenaga Tata Usaha Lainnya",
    "51": "Tenaga Jasa Perorangan",
    "52": "Tenaga Penjualan",
    "53": "Tenaga Perawatan Pribadi",
    "54": "Tenaga Jasa Perlindungan dan Keamanan",
    "61": "Pekerja Terampil Pertanian Tanaman dan Peternakan",
    "62": "Pekerja Terampil Kehutanan, Perikanan dan Perburuan",
    "63": "Petani, Nelayan dan Pengumpul Subsisten",
    "71": "Tukang Bangunan dan Tukang Terkait",
    "72": "Pekerja Logam, Mesin dan Kerajinan Terkait",
    "73": "Pekerja Kerajinan Tangan dan Percetakan",
    "74": "Pekerja Listrik dan Elektronik",
    "75": "Pekerja Pengolahan Makanan, Kayu, Pakaian dan Barang Lainnya",
    "81": "Operator Mesin dan Pabrik Stasioner",
    "82": "Perakit Mesin",
    "83": "Pengemudi dan Operator Mesin Bergerak",
    "91": "Tenaga Kebersihan dan Pembantu Rumah Tangga",
    "92": "Buruh Pertanian, Kehutanan dan Perikanan",
    "93": "Buruh Pertambangan, Konstruksi, Industri Pengolahan dan Transportasi",
    "94": "Asisten Penyiapan Makanan",
    "95": "Pekerja Jalanan dan Penjual Barang Jasa Terkait",
    "96": "Pekerja Sampah dan Tenaga Kasar Lainnya",
    "01": "Perwira Angkatan Bersenjata",
    "02": "Bintara dan Tamtama Angkatan Bersenjata"
}

def get_kbli_category(code):
    if not code:
        return {"code": "Z", "name": "Lainnya", "color": "#94A3B8"}
    try:
        prefix_2 = int(code[:2])
        for cat_letter, cat_info in KBLI_CATEGORIES.items():
            if cat_info["start"] <= prefix_2 <= cat_info["end"]:
                return {"code": cat_letter, "name": cat_info["name"], "color": cat_info["color"]}
    except:
        pass
    return {"code": "Z", "name": "Lainnya", "color": "#94A3B8"}

def get_kbji_major(code):
    if not code:
        return {"code": "0", "name": "Lainnya", "color": "#94A3B8"}
    major_digit = code[0] if code else "0"
    if major_digit in KBJI_MAJOR_GROUPS:
        info = KBJI_MAJOR_GROUPS[major_digit]
        return {"code": major_digit, "name": info["name"], "color": info["color"]}
    return {"code": "0", "name": "Lainnya", "color": "#94A3B8"}

cases = []
kbli_dict = {}
kbji_dict = {}
kbli_usage_counts = Counter()
kbji_usage_counts = Counter()

for idx, r in enumerate(rows[1:], 1):
    prov = clean_val(r[0])
    kab = clean_val(r[1])
    
    # 1. Main job (mjj)
    mjj_occtle = clean_val(r[2])
    mjj_occmtd = clean_val(r[3])
    mjj_bidang = clean_val(r[4])
    mjj_kbli_val = clean_kbli_code(r[5], r[6])
    mjj_kbli_lbl = clean_label(r[6])
    mjj_kbji_val = clean_kbji_code(r[7], r[8])
    mjj_kbji_lbl = clean_label(r[8])
    
    # 2. Secondary job (sjj)
    sjj_kbli_val = clean_kbli_code(r[9], r[10])
    sjj_kbli_lbl = clean_label(r[10])
    sjj_kbji_val = clean_kbji_code(r[11], r[12])
    sjj_kbji_lbl = clean_label(r[12])
    
    # 3. Past job (mpk)
    mpk_kbli_val = clean_kbli_code(r[13], r[14])
    mpk_kbli_lbl = clean_label(r[14])
    mpk_kbji_val = clean_kbji_code(r[15], r[16])
    mpk_kbji_lbl = clean_label(r[16])

    kbli_cat = get_kbli_category(mjj_kbli_val)
    kbji_maj = get_kbji_major(mjj_kbji_val)

    if mjj_kbli_val:
        kbli_usage_counts[mjj_kbli_val] += 1
    if mjj_kbji_val:
        kbji_usage_counts[mjj_kbji_val] += 1

    case_entry = {
        'id': f'CASE-{idx:03d}',
        'index': idx,
        'kode_prov': prov or '71',
        'kode_kab': kab.zfill(2) if kab else '05',
        'nama_wilayah': 'Kabupaten Minahasa Selatan, Sulawesi Utara',
        'mjj': {
            'occtle': mjj_occtle,
            'occmtd': mjj_occmtd,
            'bidang': mjj_bidang,
            'kbli_code': mjj_kbli_val,
            'kbli_label': mjj_kbli_lbl,
            'kbli_category': kbli_cat,
            'kbli_division': KBLI_DIVISIONS.get(mjj_kbli_val[:2], ""),
            'kbji_code': mjj_kbji_val,
            'kbji_label': mjj_kbji_lbl,
            'kbji_major': kbji_maj,
            'kbji_submajor': KBJI_SUBMAJORS.get(mjj_kbji_val[:2], "")
        },
        'sjj': {
            'kbli_code': sjj_kbli_val,
            'kbli_label': sjj_kbli_lbl,
            'kbli_category': get_kbli_category(sjj_kbli_val),
            'kbli_division': KBLI_DIVISIONS.get(sjj_kbli_val[:2], ""),
            'kbji_code': sjj_kbji_val,
            'kbji_label': sjj_kbji_lbl,
            'kbji_major': get_kbji_major(sjj_kbji_val),
            'kbji_submajor': KBJI_SUBMAJORS.get(sjj_kbji_val[:2], "")
        } if sjj_kbli_val or sjj_kbji_val else None,
        'mpk': {
            'kbli_code': mpk_kbli_val,
            'kbli_label': mpk_kbli_lbl,
            'kbli_category': get_kbli_category(mpk_kbli_val),
            'kbli_division': KBLI_DIVISIONS.get(mpk_kbli_val[:2], ""),
            'kbji_code': mpk_kbji_val,
            'kbji_label': mpk_kbji_lbl,
            'kbji_major': get_kbji_major(mpk_kbji_val),
            'kbji_submajor': KBJI_SUBMAJORS.get(mpk_kbji_val[:2], "")
        } if mpk_kbli_val or mpk_kbji_val else None,
        'full_text': f"{mjj_occtle} {mjj_occmtd} {mjj_bidang}".strip()
    }
    cases.append(case_entry)
    
    # Store unique KBLI definitions
    for code, lbl in [(mjj_kbli_val, mjj_kbli_lbl), (sjj_kbli_val, sjj_kbli_lbl), (mpk_kbli_val, mpk_kbli_lbl)]:
        if code and lbl:
            if code not in kbli_dict:
                kbli_dict[code] = {
                    "code": code,
                    "title": lbl,
                    "category": get_kbli_category(code),
                    "division_code": code[:2],
                    "division_name": KBLI_DIVISIONS.get(code[:2], ""),
                    "group": code[:3],
                    "subgroup": code[:4],
                    "sample_cases": []
                }
            if mjj_occtle and mjj_occtle not in kbli_dict[code]["sample_cases"]:
                kbli_dict[code]["sample_cases"].append(mjj_occtle)
            
    # Store unique KBJI definitions
    for code, lbl in [(mjj_kbji_val, mjj_kbji_lbl), (sjj_kbji_val, sjj_kbji_lbl), (mpk_kbji_val, mpk_kbji_lbl)]:
        if code and lbl:
            if code not in kbji_dict:
                kbji_dict[code] = {
                    "code": code,
                    "title": lbl,
                    "major": get_kbji_major(code),
                    "submajor_code": code[:2],
                    "submajor_name": KBJI_SUBMAJORS.get(code[:2], ""),
                    "minor": code[:3],
                    "sample_cases": []
                }
            if mjj_occtle and mjj_occtle not in kbji_dict[code]["sample_cases"]:
                kbji_dict[code]["sample_cases"].append(mjj_occtle)

# Update usage counts
for code in kbli_dict:
    kbli_dict[code]["frequency"] = kbli_usage_counts.get(code, 0)
    kbli_dict[code]["sample_cases"] = kbli_dict[code]["sample_cases"][:5]

for code in kbji_dict:
    kbji_dict[code]["frequency"] = kbji_usage_counts.get(code, 0)
    kbji_dict[code]["sample_cases"] = kbji_dict[code]["sample_cases"][:5]

# Convert dictionaries to sorted lists
master_kbli_list = sorted(list(kbli_dict.values()), key=lambda x: x["code"])
master_kbji_list = sorted(list(kbji_dict.values()), key=lambda x: x["code"])

# Build Analytics Summary
category_counts = Counter()
kbji_major_counts = Counter()
for c in cases:
    cat = c['mjj']['kbli_category']['code']
    cat_name = c['mjj']['kbli_category']['name']
    category_counts[f"{cat} - {cat_name}"] += 1

    maj = c['mjj']['kbji_major']['code']
    maj_name = c['mjj']['kbji_major']['name']
    kbji_major_counts[f"Gol {maj}: {maj_name}"] += 1

top_kbli = []
for code, count in kbli_usage_counts.most_common(10):
    top_kbli.append({
        "code": code,
        "title": kbli_dict.get(code, {}).get("title", ""),
        "category": kbli_dict.get(code, {}).get("category", {}).get("name", ""),
        "count": count
    })

top_kbji = []
for code, count in kbji_usage_counts.most_common(10):
    top_kbji.append({
        "code": code,
        "title": kbji_dict.get(code, {}).get("title", ""),
        "major": kbji_dict.get(code, {}).get("major", {}).get("name", ""),
        "count": count
    })

analytics_summary = {
    "total_cases": len(cases),
    "unique_kbli": len(master_kbli_list),
    "unique_kbji": len(master_kbji_list),
    "cases_with_secondary_job": sum(1 for c in cases if c['sjj']),
    "cases_with_past_job": sum(1 for c in cases if c['mpk']),
    "top_kbli": top_kbli,
    "top_kbji": top_kbji,
    "category_distribution": dict(category_counts.most_common()),
    "kbji_major_distribution": dict(kbji_major_counts.most_common()),
    "categories_meta": {k: {"name": v["name"], "color": v["color"], "desc": v["desc"]} for k, v in KBLI_CATEGORIES.items()},
    "divisions_meta": KBLI_DIVISIONS,
    "kbji_majors_meta": KBJI_MAJOR_GROUPS,
    "kbji_submajors_meta": KBJI_SUBMAJORS
}

# Write files
with open('src/data/fieldCases.json', 'w', encoding='utf-8') as f:
    json.dump(cases, f, ensure_ascii=False, indent=2)

with open('src/data/masterKbli.json', 'w', encoding='utf-8') as f:
    json.dump(master_kbli_list, f, ensure_ascii=False, indent=2)

with open('src/data/masterKbji.json', 'w', encoding='utf-8') as f:
    json.dump(master_kbji_list, f, ensure_ascii=False, indent=2)

with open('src/data/analyticsSummary.json', 'w', encoding='utf-8') as f:
    json.dump(analytics_summary, f, ensure_ascii=False, indent=2)

print('Updated JSON datasets successfully generated in src/data/')
