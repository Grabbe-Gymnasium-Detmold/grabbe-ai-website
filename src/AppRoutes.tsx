import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ChatPage from "@/sites/ChatPage.tsx";
import {Privacy} from "@/sites/Privacy.tsx";
import {Tos} from "@/sites/Tos.tsx";

const AppRoutes: React.FC = () => (
    <Router>
        <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route path="/privacy" element={<Privacy/>} />
            <Route path="/tos" element={<Tos/>} />
        </Routes>
    </Router>
);

export default AppRoutes;
