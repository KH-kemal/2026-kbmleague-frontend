export const MATCH_STATS = [
  { key: 'possession', label: 'Possession', percent: true },
  { key: 'shots', label: 'Shots' },
  { key: 'shots_on_target', label: 'Shots on Target' },
  { key: 'saves', label: 'Saves' },
  { key: 'fouls', label: 'Fouls' },
  { key: 'yellow_cards', label: 'Yellow Card', card: 'yellow' },
  { key: 'red_cards', label: 'Red Card', card: 'red' },
];

export function emptyStatistics(saved = {}) {
  return Object.fromEntries(['home', 'away'].map(side => [side,
    Object.fromEntries(MATCH_STATS.map(({ key }) => [key, saved?.[side]?.[key] ?? ''])),
  ]));
}
