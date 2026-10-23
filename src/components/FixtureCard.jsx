import { CalendarDays, MapPin } from 'lucide-react';
import MatchDetails from './MatchDetails';
import './fixture-card.css';

function TeamMark({ team }) {
  return <span className="fixture-team-mark">{team?.logo
    ? <img src={team.logo} alt="" loading="lazy" />
    : <span aria-hidden="true">{(team?.name || 'KB').slice(0, 2).toUpperCase()}</span>}</span>;
}

export default function FixtureCard({ fixture }) {
  const live = fixture.status === 'live';
  const scheduled = fixture.status === 'scheduled';
  const home = fixture.home_team?.name || 'Tim Kandang';
  const away = fixture.away_team?.name || 'Tim Tandang';
  const date = new Date(fixture.match_date);
  const dateLabel = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeLabel = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });

  if (scheduled) return <article id={`match-${fixture.id}`} aria-label={`${home} melawan ${away}`} className="fixture-card fixture-card--scheduled">
    <div className="fixture-scheduled-teams">{[fixture.home_team, fixture.away_team].map((team, index) =>
      <div key={index}><TeamMark team={team} /><strong>{team?.name || (index === 0 ? 'Tim Kandang' : 'Tim Tandang')}</strong></div>)}</div>
    <time dateTime={fixture.match_date} className="fixture-kickoff"><CalendarDays size={15} aria-hidden="true" /><span>{dateLabel}</span><strong>{timeLabel}</strong></time>
  </article>;

  return <article id={`match-${fixture.id}`} className={`fixture-card fixture-card--${live ? 'live' : 'completed'}`}>
    <div className="fixture-card-heading">
      <span className="fixture-status">{live && <span className="fixture-live-dot" aria-hidden="true" />}{live ? 'LIVE / Sedang Berlangsung' : 'Selesai / Full Time'}</span>
      <time dateTime={fixture.match_date}><CalendarDays size={14} aria-hidden="true" />{dateLabel} / {timeLabel}</time>
    </div>
    <div className="fixture-result-teams">
      <div className="fixture-result-team"><TeamMark team={fixture.home_team} /><strong>{home}</strong></div>
      <div className="fixture-score-panel"><small>{live ? 'SKOR LANGSUNG' : 'HASIL AKHIR'}</small><span className="fixture-score-value" aria-label={`Skor ${fixture.home_score ?? '-'} - ${fixture.away_score ?? '-'}`}><span>{fixture.home_score ?? '-'}</span><span className="fixture-score-divider">:</span><span>{fixture.away_score ?? '-'}</span></span></div>
      <div className="fixture-result-team"><TeamMark team={fixture.away_team} /><strong>{away}</strong></div>
    </div>
    <p className="fixture-venue"><MapPin size={14} aria-hidden="true" />{fixture.venue || 'Venue belum ditentukan'}</p>
    <div className="fixture-details"><MatchDetails fixture={fixture} /></div>
  </article>;
}
