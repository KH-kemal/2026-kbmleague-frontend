import { useId, useState } from 'react';
import CardIcon from './CardIcon';
import { MATCH_STATS } from '../utils/matchDetails';
import './match-details.css';

const statLabels = { possession: 'Penguasaan bola', shots: 'Tembakan', shots_on_target: 'Tembakan tepat sasaran', saves: 'Penyelamatan', fouls: 'Pelanggaran', offsides: 'Offside', yellow_cards: 'Kartu kuning', red_cards: 'Kartu merah' };
function TeamIdentity({ team }) {
  return <div className="match-detail-team">{team?.logo ? <img src={team.logo} alt="" loading="lazy" /> : <span className="match-detail-initial">{(team?.name || 'KB').slice(0, 2).toUpperCase()}</span>}<strong>{team?.name || 'Tim'}</strong></div>;
}
export default function MatchDetails({ fixture, showScoreboard = true }) {
  const [tab, setTab] = useState('summary');
  const id = useId();
  if (!['live', 'completed'].includes(fixture.status)) return null;
  const goals = [...(fixture.goals || [])].sort((a, b) => a.minute - b.minute || (a.added_time || 0) - (b.added_time || 0));
  const statistics = fixture.match_statistics;
  const passingAccuracy = side => {
    const { passes, successful_passes: successful } = statistics?.[side] || {};
    return passes != null && successful != null && passes > 0 && successful >= 0 && successful <= passes ? Math.round(successful / passes * 1000) / 10 : null;
  };
  const getValue = (side, stat) => stat.key === 'passing_accuracy' ? passingAccuracy(side) : statistics?.[side]?.[stat.key];
  const stats = [...MATCH_STATS];
  stats.splice(stats.findIndex(stat => stat.key === 'successful_passes') + 1, 0, { key: 'passing_accuracy', label: 'Pass accuracy', percent: true });
  const format = (side, stat) => { const value = getValue(side, stat); return value == null ? '-' : value + (stat.percent ? '%' : ''); };
  const highlight = (side, stat) => {
    const home = getValue('home', stat); const away = getValue('away', stat);
    if (home == null || away == null || home === away) return '';
    const higher = side === 'home' ? home > away : away > home;
    return higher ? (['fouls', 'offsides', 'yellow_cards', 'red_cards'].includes(stat.key) ? ' match-stat-warning' : ' match-stat-leading') : '';
  };
  const minute = goal => goal.minute + (goal.added_time ? '+' + goal.added_time : '') + "'";
  const scorers = side => goals.filter(goal => Number(goal.team_id) === Number(fixture[side + '_team_id']));
  const content = <div className="match-detail-panel">
    {showScoreboard && <div className="match-detail-scoreboard"><TeamIdentity team={fixture.home_team} /><div><small>{fixture.status === 'live' ? 'SEDANG BERLANGSUNG' : 'HASIL AKHIR'}</small><strong>{fixture.home_score ?? '-'} : {fixture.away_score ?? '-'}</strong></div><TeamIdentity team={fixture.away_team} /></div>}
    <div className="match-scorers" aria-label="Pencetak gol kedua tim">{['home', 'away'].map(side => <div key={side}><span className="sr-only">{fixture[side + '_team']?.name}</span>{scorers(side).map((goal, i) => <p key={i}>{goal.player_name} <strong>{minute(goal)}</strong>{goal.type === 'own_goal' ? ' (GBD)' : goal.type === 'penalty' ? ' (P)' : ''}</p>)}</div>)}</div>
    <div className="match-detail-tabs" role="group" aria-label="Bagian detail pertandingan">{[['summary', 'Ringkasan'], ['stats', 'Statistik']].map(([key, label]) => <button type="button" key={key} aria-pressed={tab === key} aria-controls={id} onClick={() => setTab(key)}>{label}</button>)}</div>
    <div id={id} className="match-detail-body">
      {tab === 'summary' ? <>
        <section><h3>Pencetak gol</h3>{goals.length ? <ol className="match-event-list">{goals.map((goal, i) => <li key={i}><span className="match-event-minute">{minute(goal)}</span><div><strong>{goal.player_name}</strong><small>{Number(goal.team_id) === Number(fixture.home_team_id) ? fixture.home_team?.name : fixture.away_team?.name}{goal.type === 'own_goal' ? ' / Gol bunuh diri' : goal.type === 'penalty' ? ' / Penalti' : ''}</small></div></li>)}</ol> : <p className="match-detail-muted">{fixture.home_score === 0 && fixture.away_score === 0 ? 'Belum ada gol.' : 'Detail pencetak gol belum diisi.'}</p>}</section>
        <section><h3>Penyelamatan kiper</h3>{fixture.goalkeeper_saves?.length ? <ul className="match-event-list">{fixture.goalkeeper_saves.map(entry => <li key={entry.player_id}><div><strong>{entry.player_name}</strong><small>{Number(entry.team_id) === Number(fixture.home_team_id) ? fixture.home_team?.name : fixture.away_team?.name}</small></div><b>{entry.saves} saves</b></li>)}</ul> : <p className="match-detail-muted">Rincian penyelamatan kiper belum diisi.</p>}</section>
      </> : <section>
        <div className="match-stats-heading"><TeamIdentity team={fixture.home_team} /><h3>STATISTIK TIM</h3><TeamIdentity team={fixture.away_team} /></div>
        <table className="match-stats-table"><caption className="sr-only">Perbandingan statistik {fixture.home_team?.name} dan {fixture.away_team?.name}</caption><colgroup><col className="match-stats-side" /><col className="match-stats-label" /><col className="match-stats-side" /></colgroup><thead className="sr-only"><tr><th scope="col">{fixture.home_team?.name}</th><th scope="col">Statistik</th><th scope="col">{fixture.away_team?.name}</th></tr></thead><tbody>{stats.map(stat => <tr key={stat.key}><td><span className={'match-stat-value' + highlight('home', stat)}>{format('home', stat)}</span></td><th scope="row">{stat.card && <CardIcon color={stat.card} />}{statLabels[stat.key] || stat.label}</th><td><span className={'match-stat-value' + highlight('away', stat)}>{format('away', stat)}</span></td></tr>)}</tbody></table>
      </section>}
    </div>
  </div>;
  return fixture.status === 'live' ? content : <details className="match-detail-disclosure"><summary>Lihat detail pertandingan</summary>{content}</details>;
}