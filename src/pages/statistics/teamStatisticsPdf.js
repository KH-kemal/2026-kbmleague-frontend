import { jsPDF } from 'jspdf';
import api from '../../services/api';

const metrics = [
  ['possession', 'Penguasaan bola', true], ['shots', 'Tembakan'],
  ['shots_on_target', 'Tembakan tepat sasaran'], ['saves', 'Penyelamatan'],
  ['passes', 'Passing'], ['successful_passes', 'Passing Success'], ['passing_accuracy', 'Akurasi operan', true],
  ['fouls', 'Pelanggaran'], ['offsides', 'Offside'],
  ['yellow_cards', 'Kartu kuning', false, true], ['red_cards', 'Kartu merah', false, true],
];
const date = value => new Date(value.replace(' ', 'T')).toLocaleDateString('id-ID');
const results = { W: 'Menang', D: 'Seri', L: 'Kalah' };
function loadReportLogo(source) {
  return new Promise(resolve => {
    if (!source) { resolve(null); return; }
    const image = new Image();
    image.crossOrigin = 'anonymous';
    const timer = setTimeout(() => { image.onload = null; image.onerror = null; resolve(null); }, 6000);
    image.onerror = () => { clearTimeout(timer); resolve(null); };
    image.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const scale = Math.min(1, 320 / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        // Trim white/transparent margins on the exported copy only.
        const context = canvas.getContext('2d');
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let left = canvas.width, top = canvas.height, right = -1, bottom = -1;
        for (let row = 0; row < canvas.height; row++) {
          for (let col = 0; col < canvas.width; col++) {
            const i = (row * canvas.width + col) * 4;
            if (pixels[i + 3] > 24 && Math.min(pixels[i], pixels[i + 1], pixels[i + 2]) < 238) {
              left = Math.min(left, col); right = Math.max(right, col);
              top = Math.min(top, row); bottom = Math.max(bottom, row);
            }
          }
        }
        if (right < left) { resolve({ src: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }); return; }
        left = Math.max(0, left - 3); top = Math.max(0, top - 3);
        right = Math.min(canvas.width - 1, right + 3); bottom = Math.min(canvas.height - 1, bottom + 3);
        const cropped = document.createElement('canvas');
        cropped.width = right - left + 1; cropped.height = bottom - top + 1;
        cropped.getContext('2d').drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
        resolve({ src: cropped.toDataURL('image/png'), width: cropped.width, height: cropped.height });
      } catch { resolve(null); }
    };
    image.src = source;
  });
}
export function createTeamStatisticsPdf(data, generatedAt = new Date(), logos = {}) {
  const pdf = new jsPDF();
  let y = 0;
  const text = (value, x, top, size = 10, bold = false) => {
    pdf.setFont('helvetica', bold ? 'bold' : 'normal');
    pdf.setFontSize(size);
    pdf.setTextColor(27, 45, 85);
    pdf.text(String(value), x, top);
  };
  const drawLogo = (logo, x, alias, fallback) => {
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(x, 4, 26, 26, 3, 3, 'F');
    if (logo) {
      const scale = 23 / Math.max(logo.width, logo.height);
      const width = logo.width * scale; const height = logo.height * scale;
      pdf.addImage(logo.src, 'PNG', x + 13 - width / 2, 17 - height / 2, width, height, alias, 'FAST');
    } else {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(27, 45, 85);
      pdf.text(fallback, x + 13, 19, { align: 'center' });
    }
  };
  const page = () => {
    pdf.setFillColor(27, 45, 85);
    pdf.rect(0, 0, 210, 35, 'F');
    drawLogo(logos.league, 15, 'league-logo', 'KBM');
    drawLogo(logos.team, 169, 'team-logo', data.team.name.slice(0, 2).toUpperCase());
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text('LAPORAN STATISTIK TIM', 105, 13, { align: 'center' });
    pdf.setFontSize(9);
    const teamLines = pdf.splitTextToSize(data.team.name, 120).slice(0, 2);
    pdf.text(teamLines, 105, 20, { align: 'center' });
    y = 45;
  };
  const room = height => { if (y + height > 276) { pdf.addPage(); page(); } };
  const paragraph = value => {
    const lines = pdf.splitTextToSize(value, 178);
    lines.forEach(line => { room(6); text(line, 15, y); y += 6; });
    y += 3;
  };
  const title = value => { room(16); text(value, 15, y, 13, true); y += 10; };
  const row = columns => {
    room(10);
    columns.forEach(([value, x]) => text(value, x, y, 9));
    pdf.setDrawColor(225, 230, 237);
    pdf.line(15, y + 3, 195, y + 3);
    y += 10;
  };
  page();
  const nameLines = pdf.splitTextToSize(data.team.name, 175);
  nameLines.forEach(line => { room(10); text(line, 15, y, 18, true); y += 9; });
  paragraph('Dibuat: ' + generatedAt.toLocaleString('id-ID'));
  title('Ringkasan tim');
  [['played', 'Pertandingan'], ['wins', 'Menang'], ['draws', 'Seri'], ['losses', 'Kalah'], ['goals_for', 'Gol dicetak'], ['goals_against', 'Kebobolan'], ['goal_difference', 'Selisih gol'], ['clean_sheets', 'Tanpa kebobolan']].forEach(([key, label]) => row([[label, 15], [data.summary[key], 150]]));
  y += 7;
  title('Statistik permainan');
  metrics.forEach(([key, label, percent, total]) => {
    const metric = data.metrics[key];
    const value = metric?.recorded_matches ? (total ? metric.total : metric.average) + (percent ? '%' : '') : '-';
    row([[label + (total ? ' (total)' : key === 'passing_accuracy' ? '' : ' / laga'), 15], [value, 108], [(metric?.recorded_matches ?? 0) + '/' + data.summary.played + ' laga', 162]]);
  });
  if (!data.matches.length) { y += 8; paragraph('Tim belum memiliki pertandingan selesai.'); }
  // Use vector bars so the PDF stays sharp and does not depend on screen size or theme.
  for (let offset = 0; offset < data.matches.length; offset += 5) {
    pdf.addPage(); page();
    title('Grafik evaluasi tim');
    paragraph('Pertandingan ' + (offset + 1) + ' - ' + Math.min(offset + 5, data.matches.length) );
    const batch = data.matches.slice(offset, offset + 5);
    const groups = [
      { title: 'Gol dicetak (biru) dan kebobolan (merah)', keys: ['goals_for', 'goals_against'], colors: [[84,117,174], [196,90,112]] },
      { title: 'Tembakan (hijau)', keys: ['shots'], colors: [[39,132,119]] },
      { title: 'Penguasaan bola (%)', keys: ['possession'], colors: [[179,123,34]], percent: true },
    ];
    const valueOf = (match, key) => ['goals_for', 'goals_against'].includes(key) ? match[key] : match.statistics?.[key];
    groups.forEach(group => {
      text(group.title, 15, y, 11, true);
      // Scale against all matches, keeping pages directly comparable.
      const values = data.matches.flatMap(match => group.keys.map(key => valueOf(match, key))).filter(value => value != null);
      const max = group.percent ? 100 : Math.max(4, Math.ceil(Math.max(0, ...values) / 4) * 4);
      const baseline = y + 42;
      [0, .5, 1].forEach(step => {
        const top = baseline - step * 30;
        text(max * step + (group.percent ? '%' : ''), 15, top + 1, 8);
        pdf.setDrawColor(225,230,237); pdf.line(31, top, 195, top);
      });
      batch.forEach((match, i) => {
        const center = 47 + i * 33;
        group.keys.forEach((key, k) => {
          const value = valueOf(match, key);
          const x = center + (k - (group.keys.length - 1) / 2) * 11;
          const height = value == null ? 0 : value / max * 30;
          pdf.setFillColor(...group.colors[k]);
          if (height) pdf.rect(x - 4, baseline - height, 8, height, 'F');
          text(value == null ? '-' : value + (group.percent ? '%' : ''), x - 4, baseline - height - 2, 8);
        });
        text('Pertandingan ' + (offset + i + 1), center - 12, baseline + 6, 7, true);
      });
      y += 66;
    });
  }
  if (data.matches.length) {
    pdf.addPage(); page();
    title('Rincian per pertandingan');
    data.matches.forEach((match, index) => {
      room(100);
      title('Pertandingan ' + (index + 1) + ' / ' + date(match.match_date));
      paragraph('Hasil: ' + (results[match.result] || '-') + ' | Gol dicetak: ' + match.goals_for + ' | Kebobolan: ' + match.goals_against);
      metrics.forEach(([key, label, percent], metricIndex) => {
        const value = match.statistics?.[key];
        const col = metricIndex % 2;
        text(label + ': ' + (value == null ? '-' : value + (percent ? '%' : '')), col ? 108 : 15, y, 9);
        if (col || metricIndex === metrics.length - 1) y += 8;
      });
      y += 12;
    });
  }
  const pages = pdf.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    text('KBM League | ' + i + ' / ' + pages, 15, 288, 8);
  }
  return pdf;
}
export async function downloadTeamStatisticsPdf(data) {
  const now = new Date();
  const name = data.team.name.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'Tim';
  const [league, team] = await Promise.all([
    loadReportLogo((import.meta.env.BASE_URL || '/') + 'logo_kbmleague.png'),
    (async () => {
      try {
        const response = await api.get('/teams/' + data.team.id + '/report-logo', { timeout: 8000 });
        const logo = await loadReportLogo(response.data.data_url);
        if (logo) return logo;
      } catch { /* Fall back for old backends or external logo URLs. */ }
      return loadReportLogo(data.team.logo);
    })(),
  ]);
  createTeamStatisticsPdf(data, now, { league, team }).save('Statistik-' + name + '-' + now.toISOString().slice(0, 10) + '.pdf');
}
