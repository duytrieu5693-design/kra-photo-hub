import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  title?: string;
  back?: string;
}

export function Layout({ children, title, back }: Props) {
  const location = useLocation();

  return (
    <div className="layout">
      <header className="header">
        {back ? (
          <NavLink to={back} style={{ color: 'var(--accent-light)', textDecoration: 'none', fontSize: 24 }}>
            ‹
          </NavLink>
        ) : null}
        <div>
          <div className="header-title">
            {title || 'KRA Photo Hub'}
          </div>
          <div className="header-subtitle">Kimono Rental Ann</div>
        </div>
      </header>

      <main className="main-content page-content">
        {children}
      </main>

      <nav className="nav">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive && location.pathname === '/' ? 'active' : ''}`}>
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </NavLink>
        <NavLink to="/import" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📥</span>
          <span>Import</span>
        </NavLink>
        <NavLink to="/batch/create" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span>
          <span>Batch</span>
        </NavLink>
        <NavLink to="/batches" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📋</span>
          <span>History</span>
        </NavLink>
        <NavLink to="/status" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          <span>Status</span>
        </NavLink>
      </nav>
    </div>
  );
}
