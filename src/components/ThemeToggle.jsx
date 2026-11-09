import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ mode, onToggle }) {
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle-btn ${isDark ? 'dark' : 'light'}`}
      onClick={onToggle}
      title={isDark ? '라이트모드로 전환' : '다크모드로 전환'}
      aria-label="화면 모드 전환"
    >
      <div className="toggle-track">
        <span className={`toggle-icon-wrap ${!isDark ? 'active' : ''}`}>
          <Sun size={14} />
        </span>
        <span className={`toggle-icon-wrap ${isDark ? 'active' : ''}`}>
          <Moon size={14} />
        </span>
        <div className="toggle-thumb" />
      </div>
      <span className="toggle-text">{isDark ? '다크' : '라이트'}</span>
    </button>
  );
}

