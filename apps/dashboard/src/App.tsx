import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { Import } from './pages/Import';
import { CreateBatch } from './pages/CreateBatch';
import { BatchHistory } from './pages/BatchHistory';
import { BatchDetail } from './pages/BatchDetail';
import { SystemStatus } from './pages/SystemStatus';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/import" element={<Import />} />
        <Route path="/batch/create" element={<CreateBatch />} />
        <Route path="/batches" element={<BatchHistory />} />
        <Route path="/batches/:batchId" element={<BatchDetail />} />
        <Route path="/status" element={<SystemStatus />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
