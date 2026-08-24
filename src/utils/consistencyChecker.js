/**
 * Logical Consistency Validator between KBLI (Industry/Activity) and KBJI (Occupation/Position)
 */

export function validateKbliKbjiConsistency(kbliCode, kbjiCode) {
  if (!kbliCode || !kbjiCode) {
    return {
      isValid: true,
      status: 'neutral',
      message: 'Lengkapi kedua kode KBLI dan KBJI untuk validasi relasi.'
    };
  }

  const kbli2 = kbliCode.substring(0, 2);
  const kbji1 = kbjiCode.substring(0, 1);
  const kbji2 = kbjiCode.substring(0, 2);

  // 1. Agriculture / Perkebunan / Perikanan (KBLI 01-03)
  const isAgriKbli = ['01', '02', '03'].includes(kbli2);
  const isAgriKbji = kbji1 === '6' || kbji2 === '92' || ['2132', '3142'].includes(kbjiCode);
  
  if (isAgriKbli && isAgriKbji) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Selaras (Pertanian / Perikanan)',
      message: 'Kode KBLI Pertanian/Perikanan sangat cocok dengan profesi tenaga terampil/buruh pertanian.'
    };
  }

  // 2. Perdagangan (KBLI 45-47)
  const isTradeKbli = ['45', '46', '47'].includes(kbli2);
  const isTradeKbji = kbji2 === '52' || kbji2 === '14' || kbji2 === '33' || ['9333', '9334'].includes(kbjiCode);

  if (isTradeKbli && isTradeKbji) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Selaras (Perdagangan & Penjualan)',
      message: 'Kode KBLI Perdagangan selaras dengan profesi pemilik toko, pramuniaga, atau tenaga penjualan.'
    };
  }

  // 3. Transportasi & Angkutan (KBLI 49-53)
  const isTransportKbli = ['49', '50', '51', '52', '53'].includes(kbli2);
  const isTransportKbji = kbji2 === '83' || kbji2 === '93' || ['4323', '3151'].includes(kbjiCode);

  if (isTransportKbli && isTransportKbji) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Selaras (Transportasi & Pengemudi)',
      message: 'Kode KBLI Transportasi/Angkutan selaras dengan jabatan pengemudi atau operator armada.'
    };
  }

  // 4. Industri Pengolahan (KBLI 10-33)
  const isManufacturingKbli = parseInt(kbli2, 10) >= 10 && parseInt(kbli2, 10) <= 33;
  const isManufacturingKbji = ['7', '8'].includes(kbji1) || kbji2 === '93' || kbji2 === '13' || kbji2 === '31';

  if (isManufacturingKbli && isManufacturingKbji) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Selaras (Industri Pengolahan)',
      message: 'Kode KBLI Manufaktur/Pengolahan selaras dengan pekerja pengolahan atau operator mesin.'
    };
  }

  // 5. Konstruksi (KBLI 41-43)
  const isConstructionKbli = ['41', '42', '43'].includes(kbli2);
  const isConstructionKbji = kbji2 === '71' || kbji2 === '93' || kbjiCode === '9313' || kbji2 === '31';

  if (isConstructionKbli && isConstructionKbji) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Selaras (Konstruksi)',
      message: 'Kode KBLI Konstruksi selaras dengan profesi tukang bangunan atau kuli bangunan.'
    };
  }

  // 6. Penyediaan Makanan & Minuman (KBLI 55-56)
  const isFoodServiceKbli = ['55', '56'].includes(kbli2);
  const isFoodServiceKbji = kbji2 === '51' || kbji2 === '52' || kbji2 === '94' || kbji2 === '14';

  if (isFoodServiceKbli && isFoodServiceKbji) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Selaras (Kuliner / Penyediaan Makanan)',
      message: 'Kode KBLI Kuliner selaras dengan pemilik kedai, pramusaji, atau pembuat makanan.'
    };
  }

  // Potential Anomaly Detections
  if (isAgriKbli && isConstructionKbji) {
    return {
      isValid: false,
      status: 'warning',
      title: 'Perhatian Anomali: Pertanian vs Konstruksi',
      message: 'Lapangan usaha berkode Pertanian tetapi Jabatan berkode Buruh/Tukang Konstruksi. Mohon verifikasi kembali.'
    };
  }

  if (isTradeKbli && isAgriKbji) {
    return {
      isValid: false,
      status: 'warning',
      title: 'Perhatian Anomali: Perdagangan vs Petani Terampil',
      message: 'Lapangan usaha berkode Perdagangan tetapi Jabatan berkode Petani Terampil. Jika hanya menjual hasil kebun sendiri, pertimbangkan KBLI Pertanian atau KBJI Pedagang.'
    };
  }

  // General acceptable combination (e.g. managers/administrators work in any industry)
  if (['1', '2', '3', '4'].includes(kbji1)) {
    return {
      isValid: true,
      status: 'valid',
      title: 'Kombinasi Umum Wajar',
      message: 'Jabatan Manajerial/Profesional/Tata Usaha bersifat fleksibel dan dapat berada di berbagai sektor lapangan usaha.'
    };
  }

  return {
    isValid: true,
    status: 'neutral',
    title: 'Kombinasi Perlu Dikonfirmasi',
    message: 'Kombinasi kode KBLI dan KBJI dapat diterima namun disarankan diperiksa kembali sesuai konteks responden.'
  };
}
