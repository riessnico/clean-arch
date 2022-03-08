import React from 'react';
import { Login } from '@/presentation/pages';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Router: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
