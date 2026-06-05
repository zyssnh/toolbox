import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import Favorites from './pages/Favorites';
import GamePage from './pages/GamePage';

const SudokuStandalone = lazy(() => import('./pages/SudokuStandalone'));

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Standalone game pages — full-screen, no Navbar */}
        <Route
          path="/game/sudoku"
          element={
            <Suspense fallback={null}>
              <SudokuStandalone />
            </Suspense>
          }
        />
        <Route path="/game/:gameId" element={<GamePage />} />

        {/* Toolbox routes — with Navbar Layout */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tool/:id" element={<ToolPage />} />
                <Route path="/favorites" element={<Favorites />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </HashRouter>
  );
}
