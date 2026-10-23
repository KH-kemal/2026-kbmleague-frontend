import './home-sponsors.css';

// Display bounds remove empty margins in the layout; original logo files stay intact.
const sponsors = [
  { name: 'GSportivo', file: 'gsportivo.png', width: 194, height: 279, bounds: '0 0 194 279', compact: true },
  { name: 'Jaya Digiprint', file: 'jaya-digiprint.png', width: 2362, height: 2362, bounds: '134 881 2100 589' },
  { name: 'Ken Sport', file: 'ken-sport.png', width: 196, height: 162, bounds: '4 4 188 156', compact: true },
  { name: 'KBM Trans', file: 'kbm-trans.png', width: 666, height: 375, bounds: '86 85 514 191' },
  { name: 'Graha KBM', file: 'graha-kbm.png', width: 4070, height: 656, bounds: '0 0 4070 656' },
  { name: 'RSU Anwar Medika', file: 'anwar-medika.png', width: 617, height: 579, bounds: '4 1 613 578', compact: true },
];
const mediaPartners = [
  { name: 'Skarisa Entertainment', file: 'skarisa.png', width: 1731, height: 579, bounds: '84 133 1576 279' },
  { name: 'KBM Media', file: 'kbm-media.png', width: 1028, height: 256, bounds: '363 8 256 231', compact: true },
];
function PartnerLogo({ partner }) {
  return <li className={'sponsor-tile' + (partner.compact ? ' sponsor-tile-compact' : '')}>
    <svg className="sponsor-logo" viewBox={partner.bounds} role="img" aria-label={partner.name} focusable="false">
      <image href={'/sponsors/' + partner.file} width={partner.width} height={partner.height} />
    </svg>
  </li>;
}
export default function HomeSponsors() {
  return <section className="home-sponsors" aria-labelledby="home-sponsors-title">
    <header className="home-sponsors-heading"><span>BERSAMA MEMAJUKAN SEPAK BOLA MUDA</span><h2 id="home-sponsors-title">Sponsor &amp; Partner</h2><p>Terima kasih atas dukungan untuk setiap langkah dan cerita di KBM League.</p></header>
    <div className="sponsor-group"><h3>Official Sponsor</h3><ul className="sponsor-grid">{sponsors.map(partner => <PartnerLogo key={partner.file} partner={partner} />)}</ul></div>
    <div className="sponsor-group sponsor-group-media"><h3>Media Partner</h3><ul className="sponsor-grid sponsor-grid-media">{mediaPartners.map(partner => <PartnerLogo key={partner.file} partner={partner} />)}</ul></div>
  </section>;
}
