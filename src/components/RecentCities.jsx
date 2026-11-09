import { History, X, MapPin } from 'lucide-react';

export default function RecentCities({
  recentCities,
  onSelectCity,
  onRemoveCity,
  onClearAll,
  currentCityName,
}) {
  if (!recentCities || recentCities.length === 0) return null;

  return (
    <div className="recent-cities-bar" aria-label="최근 본 도시 목록">
      <div className="recent-header">
        <div className="recent-label">
          <History size={15} />
          <span>최근 본 도시</span>
        </div>
        <button
          type="button"
          className="recent-clear-all"
          onClick={onClearAll}
          title="최근 본 도시 목록 모두 지우기"
        >
          모두 지우기
        </button>
      </div>

      <div className="recent-chips-list">
        {recentCities.map((city) => {
          const isSelected = city.name === currentCityName;
          return (
            <div
              key={city.name}
              className={`recent-chip ${isSelected ? 'active' : ''}`}
            >
              <button
                type="button"
                className="chip-select-btn"
                onClick={() => onSelectCity(city)}
                title={`${city.name} 날씨 조회`}
              >
                <MapPin size={13} className="chip-pin" />
                <span className="chip-name">{city.name}</span>
              </button>
              <button
                type="button"
                className="chip-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCity(city.name);
                }}
                title={`${city.name} 삭제`}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

