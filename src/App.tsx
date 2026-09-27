// Định tuyến bằng HashRouter để chạy tốt trên hosting tĩnh (Vercel) mà không cần
// cấu hình rewrite phía máy chủ.
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Library } from './ui/Library';
import { Editor } from './ui/Editor';
import { PlayScreen } from './ui/PlayScreen';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/edit/:id" element={<Editor />} />
        <Route path="/play/:id" element={<PlayScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
