import CardIcon from './CardIcon';
import { MATCH_STATS } from '../utils/matchDetails';

export default function MatchDetails({ fixture }) {
  if (!['live', 'completed'].includes(fixture.status)) return null;
  const goals = [...(fixture.goals || [])].sort((a, b) => a.minute - b.minute || (a.added_time || 0) - (b.added_time || 0));
  const statistics = fixture.match_statistics;
  const value = (side, stat) => statistics?.[side]?.[stat.key] == null ? '—' : `${statistics[side][stat.key]}${stat.percent ? '%' : ''}`;
  const content = (
    <div className="w-full border-t border-slate-200 dark:border-slate-800 mt-5 pt-4 text-sm text-slate-700 dark:text-slate-200">
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section>
          <h3 className="font-extrabold mb-3">Pencetak Gol</h3>
          {goals.length ? <ol className="space-y-2">{goals.map((goal, index) => (
            <li key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
              <span role="img" aria-label="Gol" className="text-lg">⚽</span>
              <span className="font-extrabold tabular-nums text-primary whitespace-nowrap">{goal.minute}{goal.added_time ? `+${goal.added_time}` : ''}′</span>
              <div className="min-w-0"><p className="font-bold break-words">{goal.player_name}{goal.type === 'own_goal' ? ' (bunuh diri)' : goal.type === 'penalty' ? ' (penalti)' : ''}</p><p className="text-xs text-slate-500 dark:text-slate-400">{Number(goal.team_id) === Number(fixture.home_team_id) ? fixture.home_team?.name : fixture.away_team?.name}</p></div>
            </li>
          ))}</ol> : <p className="text-slate-500 dark:text-slate-400">{fixture.status === 'live' && fixture.home_score === 0 && fixture.away_score === 0 ? 'Belum ada gol.' : 'Detail pencetak gol belum diisi.'}</p>}
        </section>
        <section>
          <h3 className="font-extrabold mb-3">Statistik Pertandingan</h3>
          <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center text-center gap-2 text-xs font-bold mb-3"><span>{fixture.home_team?.name}</span><span className="text-slate-400">STATISTIK</span><span>{fixture.away_team?.name}</span></div>
          {MATCH_STATS.map(stat => <div key={stat.key} className="grid grid-cols-[1fr_1.4fr_1fr] items-center text-center gap-2 py-2.5 border-t border-slate-100 dark:border-slate-800">
            <span className="font-extrabold tabular-nums">{value('home', stat)}</span>
            <span className="flex items-center justify-center gap-2 text-xs sm:text-sm">{stat.card && <CardIcon color={stat.card} />}{stat.label}</span>
            <span className="font-extrabold tabular-nums">{value('away', stat)}</span>
          </div>)}
        </section>
      </div>
      {(fixture.goalkeeper_saves || []).length > 0 && <section className="mt-6"><h3 className="font-extrabold mb-3">Penyelamatan Kiper</h3><ul className="grid gap-2 sm:grid-cols-2">{fixture.goalkeeper_saves.map(entry => <li key={entry.player_id} className="rounded-xl bg-slate-50 dark:bg-slate-950 p-3 flex justify-between gap-3"><div><p className="font-bold">{entry.player_name}</p><p className="text-xs text-slate-500">{Number(entry.team_id) === Number(fixture.home_team_id) ? fixture.home_team?.name : fixture.away_team?.name}</p></div><span className="font-bold whitespace-nowrap">{entry.saves} saves</span></li>)}</ul></section>}
    </div>
  );
  return fixture.status === 'live' ? content : (
    <details className="mt-4">
      <summary className="cursor-pointer rounded-xl bg-slate-50 dark:bg-slate-950 px-4 py-3 font-bold text-primary focus-visible:outline focus-visible:outline-2">Lihat detail pertandingan</summary>
      {content}
    </details>
  );
}
