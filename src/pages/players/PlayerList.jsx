import { Navigate, useLocation } from 'react-router-dom';

// Keep existing links/bookmarks working after merging the public directory.
export default function PlayerList() {
  const { search } = useLocation();
  return <Navigate to={{ pathname: '/teams', search }} replace />;
}
