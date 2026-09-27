// Thư viện trò chơi: xem, tìm, tạo, nhập/xuất, nhân bản, xóa các bài đã lưu.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar } from './Brand';
import { modeName, formatDate } from './labels';
import {
  listGames,
  ensureSeeded,
  deleteGame,
  duplicateGame,
  saveGame,
  exportGameJSON,
  importGameJSON,
  getStorageError,
} from '../storage/storage';
import { downloadText } from '../utils/download';
import type { GameConfig } from '../types';

type SortKey = 'updated' | 'title' | 'questions';

export function Library() {
  const nav = useNavigate();
  const [games, setGames] = useState<GameConfig[]>([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('updated');
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setGames(listGames());

  useEffect(() => {
    ensureSeeded();
    refresh();
  }, []);

  const storageError = getStorageError();

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = games;
    if (q) {
      list = list.filter(
        (g) => g.title.toLowerCase().includes(q) || modeName(g.mode).toLowerCase().includes(q),
      );
    }
    const sorted = [...list];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
    else if (sort === 'questions') sorted.sort((a, b) => b.questions.length - a.questions.length);
    // 'updated' đã theo thứ tự của listGames()
    return sorted;
  }, [games, query, sort]);

  const onExport = (g: GameConfig) => {
    downloadText(exportGameJSON(g), `keo-co-${slug(g.title)}.json`);
  };

  const onImportFile = async (file: File) => {
    const text = await file.text();
    const { game, issues } = importGameJSON(text);
    if (!game) {
      setNotice('Nhập thất bại: ' + issues.join(' '));
      return;
    }
    saveGame(game);
    refresh();
    setNotice(
      issues.length
        ? `Đã nhập "${game.title}" nhưng có ${issues.length} cảnh báo. Hãy mở ra kiểm tra.`
        : `Đã nhập "${game.title}".`,
    );
  };

  const onDelete = (g: GameConfig) => {
    if (window.confirm(`Xóa trò chơi "${g.title}"? Hành động này không thể hoàn tác.`)) {
      deleteGame(g.id);
      refresh();
    }
  };

  const onDuplicate = (g: GameConfig) => {
    duplicateGame(g.id);
    refresh();
  };

  return (
    <div className="shell">
      <AppBar
        subtitle="Trò chơi giáo dục lối sống xanh & ứng phó thiên tai"
        right={
          <>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              ⭳ Nhập JSON
            </button>
            <button className="btn btn-primary" onClick={() => nav('/edit/new')}>
              ＋ Tạo trò chơi mới
            </button>
          </>
        }
      />

      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImportFile(f);
          e.target.value = '';
        }}
      />

      {storageError && <div className="banner banner-warn">{storageError}</div>}
      {notice && (
        <div className="banner banner-warn" role="status">
          {notice}{' '}
          <button className="btn btn-ghost" onClick={() => setNotice(null)}>
            Đóng
          </button>
        </div>
      )}

      <div className="toolbar">
        <input
          className="grow"
          type="search"
          placeholder="Tìm theo tên hoặc chế độ chơi…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm trò chơi"
        />
        <label className="row" style={{ gap: '0.4rem' }}>
          Sắp xếp
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{ width: 'auto' }}
          >
            <option value="updated">Mới cập nhật</option>
            <option value="title">Theo tên</option>
            <option value="questions">Số câu hỏi</option>
          </select>
        </label>
      </div>

      {shown.length === 0 ? (
        <div className="empty">
          <h2>Chưa có trò chơi nào</h2>
          <p>Hãy tạo một trò chơi mới hoặc nhập file JSON đã sao lưu để bắt đầu.</p>
          <button className="btn btn-primary" onClick={() => nav('/edit/new')}>
            ＋ Tạo trò chơi mới
          </button>
        </div>
      ) : (
        <div className="cards">
          {shown.map((g) => (
            <article className="card" key={g.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="badge">{modeName(g.mode)}</span>
                <span className="hint">{formatDate(g.updatedAt)}</span>
              </div>
              <h3>{g.title}</h3>
              <div className="meta">
                <span>
                  👥 {g.teamNames[0]} vs {g.teamNames[1]}
                </span>
                <span>❓ {g.questions.length} câu</span>
                <span>🎯 Mốc {g.winThreshold}</span>
                <span>⏱ {Math.round(g.durationSeconds / 60)} phút</span>
              </div>
              <div className="card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => nav(`/play/${g.id}`)}
                  disabled={g.questions.length === 0}
                  title={
                    g.questions.length === 0 ? 'Cần thêm câu hỏi trước khi chơi' : 'Bắt đầu chơi'
                  }
                >
                  ▶ Chơi
                </button>
                <button className="btn" onClick={() => nav(`/edit/${g.id}`)}>
                  ✎ Sửa
                </button>
                <button className="btn" onClick={() => onDuplicate(g)}>
                  ⧉ Nhân bản
                </button>
                <button className="btn" onClick={() => onExport(g)}>
                  ⭱ Xuất
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(g)}>
                  🗑 Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="hint" style={{ marginTop: '2rem' }}>
        Dữ liệu được lưu trong trình duyệt của máy này (localStorage). Hãy dùng “Xuất JSON” để sao
        lưu hoặc chuyển sang máy khác.
      </p>
    </div>
  );
}

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40) || 'tro-choi';
}
