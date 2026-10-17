import MatchDetails from './MatchDetails';

export default function FixtureCard({ fixture }) {
  const live = fixture.status === 'live';
  const scheduled = fixture.status === 'scheduled';
  if (scheduled) {
    const kickOff = new Date(fixture.match_date);
    return <article id={`match-${fixture.id}`} aria-label={`${fixture.home_team?.name || 'Tim Kandang'} melawan ${fixture.away_team?.name || 'Tim Tandang'}`} className="grid grid-cols-[minmax(0,1fr)_6.5rem] sm:grid-cols-[minmax(0,1fr)_7.5rem] items-center bg-white dark:bg-slate-900 px-4 sm:px-5 py-5 text-slate-800 dark:text-white">
      <div className="space-y-3 pr-4 min-w-0">
        {[fixture.home_team, fixture.away_team].map((team, index) => <div key={index} className="flex items-center gap-3 min-w-0">
          {team?.logo ? <img src={team.logo} alt="" className="h-7 w-7 shrink-0 object-contain" /> : <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-extrabold text-slate-500 dark:text-slate-300">{(team?.name || 'KB').slice(0, 2).toUpperCase()}</span>}
          <span className="text-sm font-semibold leading-snug break-words">{team?.name || (index === 0 ? 'Tim Kandang' : 'Tim Tandang')}</span>
        </div>)}
      </div>
      <time dateTime={fixture.match_date} className="flex min-h-16 flex-col items-center justify-center border-l border-slate-200 dark:border-slate-700 pl-3 text-center tabular-nums">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{kickOff.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        <span className="mt-1 text-sm font-extrabold">{kickOff.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
      </time>
    </article>;
  }
  return <article id={`match-${fixture.id}`} className={`rounded-3xl border p-5 sm:p-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-white ${live ? 'border-primary shadow-lg shadow-primary/10 ring-1 ring-primary/20' : 'border-slate-200 dark:border-slate-800 shadow-xs'}`}>
    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold ${live ? 'bg-primary/10 text-primary' : scheduled ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300'}`}>
        {live && <span className="w-2 h-2 rounded-full bg-primary motion-safe:animate-pulse" />}
        {live ? 'LIVE - Sedang Berlangsung' : scheduled ? 'Terjadwal / Upcoming' : 'Selesai / Full Time'}
      </span>
      <time dateTime={fixture.match_date} className="text-xs text-slate-500 dark:text-slate-400">{new Date(fixture.match_date).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
    </div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
      <div className="text-right font-extrabold text-sm sm:text-lg break-words">{fixture.home_team?.name || 'Tim Kandang'}</div>
      <div className={`rounded-2xl px-4 sm:px-6 py-3 text-xl sm:text-3xl font-black tabular-nums whitespace-nowrap ${live ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white'}`}>
        {scheduled ? 'VS' : `${fixture.home_score ?? 0} : ${fixture.away_score ?? 0}`}
      </div>
      <div className="text-left font-extrabold text-sm sm:text-lg break-words">{fixture.away_team?.name || 'Tim Tandang'}</div>
    </div>
    <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">{fixture.venue || 'Venue belum ditentukan'}</p>
    {!scheduled && <MatchDetails fixture={fixture} />}
  </article>;
}
