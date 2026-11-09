import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, MapPin, Globe } from 'lucide-react';
import { searchCities } from '../api/weather';

export default function CitySearch({ onSelectCity }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef(null);

  // 400ms 디바운스 적용 도시 검색
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    let isMounted = true;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await searchCities(trimmed);
        if (isMounted) {
          setResults(data);
          setIsOpen(true);
          setHasSearched(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error('도시 검색 에러:', err);
          setResults([]);
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  // 검색창 입력 이벤트 처리
  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setIsOpen(false);
      setHasSearched(false);
    }
  };

  // 외부 클릭 감지 및 ESC 키 닫기
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (item) => {
    const displayName = item.country
      ? `${item.name} (${item.country})`
      : item.name;

    onSelectCity({
      name: displayName,
      lat: item.latitude,
      lon: item.longitude,
    });
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="city-search-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="도시 검색 (예: Seoul, Tokyo, New York, Busan, 파리...)"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        {isSearching && <Loader2 size={16} className="search-spinner spinning" />}
        {query && !isSearching && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="검색어 지우기"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 검색 결과 드롭다운 */}
      {isOpen && (
        <div className="search-dropdown">
          {results.length > 0 ? (
            <ul className="search-results-list">
              {results.map((item) => (
                <li key={item.id} className="search-result-item">
                  <button
                    type="button"
                    className="search-result-btn"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="result-main">
                      <MapPin size={16} className="result-pin" />
                      <span className="result-name">{item.name}</span>
                    </div>
                    <div className="result-sub">
                      {item.admin1 && <span className="result-admin">{item.admin1}, </span>}
                      {item.country && (
                        <span className="result-country">
                          <Globe size={12} />
                          {item.country}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : hasSearched && !isSearching ? (
            <div className="search-empty">
              <span>일치하는 검색 결과가 없습니다.</span>
              <small>도시명을 영문 또는 한글로 다시 확인해 주세요.</small>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
