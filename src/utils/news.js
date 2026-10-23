export const NEWS_CATEGORIES = [
  { value: 'pertandingan', label: 'Pertandingan' },
  { value: 'kegiatan', label: 'Kegiatan' },
  { value: 'pengumuman', label: 'Pengumuman' },
];
export const newsCategory = value => NEWS_CATEGORIES.find(category => category.value === value)?.label || 'Kabar Liga';
export const newsDate = value => value ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00' : value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
