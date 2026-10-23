import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PageTitle from './components/PageTitle';


import Home from './pages/home/Home';
import TeamList from './pages/teams/TeamList';
import TeamDetail from './pages/teams/TeamDetail';
import PlayerList from './pages/players/PlayerList';
import PlayerDetail from './pages/players/PlayerDetail';
import FixtureList from './pages/fixtures/FixtureList';
import NewsList from './pages/news/NewsList';
import NewsDetail from './pages/news/NewsDetail';
import AdminNews from './pages/admin/news/AdminNews';
import NewsForm from './pages/admin/news/NewsForm';
import Statistics from './pages/statistics/Statistics';
import LeagueTable from './pages/league-table/LeagueTable';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import AdminTeams from './pages/admin/teams/AdminTeams';
import TeamCreate from './pages/admin/teams/TeamCreate';
import TeamEdit from './pages/admin/teams/TeamEdit';
import AdminPlayers from './pages/admin/players/AdminPlayers';
import PlayerImport from './pages/admin/players/PlayerImport';
import PlayerCreate from './pages/admin/players/PlayerCreate';
import PlayerEdit from './pages/admin/players/PlayerEdit';
import AdminFixtures from './pages/admin/fixtures/AdminFixtures';
import FixtureCreate from './pages/admin/fixtures/FixtureCreate';
import FixtureEdit from './pages/admin/fixtures/FixtureEdit';
import AdminScreening from './pages/admin/screening/AdminScreening';

export default function App() {
  return (
    <Router>
      <PageTitle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          

            <Route path="/teams" element={<TeamList />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/players" element={<PlayerList />} />
            <Route path="/players/:id" element={<PlayerDetail />} />
            <Route path="/fixtures" element={<FixtureList />} />
            <Route path="/league-table" element={<LeagueTable />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/news" element={<NewsList />} />
            <Route path="/news/:id" element={<NewsDetail />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="teams/create" element={<TeamCreate />} />
            <Route path="teams/:id/edit" element={<TeamEdit />} />
            <Route path="players" element={<AdminPlayers />} />
            <Route path="players/import" element={<PlayerImport />} />
            <Route path="players/create" element={<PlayerCreate />} />
            <Route path="players/:id/edit" element={<PlayerEdit />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/create" element={<NewsForm />} />
            <Route path="news/:id/edit" element={<NewsForm editing />} />
            <Route path="screening" element={<AdminScreening />} />
            <Route path="fixtures" element={<AdminFixtures />} />
            <Route path="fixtures/create" element={<FixtureCreate />} />
            <Route path="fixtures/:id/edit" element={<FixtureEdit />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
