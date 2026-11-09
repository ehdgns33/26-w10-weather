import { useState, useEffect, useCallback } from 'react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import { getWeatherTheme } from './utils/weatherThemes';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import CitySearch from './components/CitySearch';
import RecentCities from './components/RecentCities';
import ThemeToggle from './components/ThemeToggle';
import WorldMapModal from './components/WorldMapModal';
import { MapPin, RefreshCw, AlertCircle, Globe, Sparkles } from 'lucide-react';
import './App.css';

const RECENT_KEY = 'weather_recent_cities_v1';
const THEME_KEY = 'weather_theme_mode_v1';

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 1. 라이트/다크 모드 상태 (기본값: 'light')
  const [themeMode, setThemeMode] = useState(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  // 2. 세계지도/지구본 모달 열림 여부
  const [isWorldMapOpen, setIsWorldMapOpen] = useState(false);

  // 3. 최근 본 도시 목록 (localStorage 연동)
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleThemeMode = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch (err) {
        console.error('테마 모드 저장 실패:', err);
      }
      return next;
    });
  };

  const addRecentCity = useCallback((city) => {
    setRecentCities((prev) => {
      const filtered = prev.filter((c) => c.name !== city.name);
      const updated = [city, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('localStorage 저장 실패:', err);
      }
      return updated;
    });
  }, []);

  const handleRemoveRecentCity = (cityName) => {
    setRecentCities((prev) => {
      const updated = prev.filter((c) => c.name !== cityName);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('localStorage 삭제 실패:', err);
      }
      return updated;
    });
  };

  const handleClearAllRecentCities = () => {
    setRecentCities([]);
    try {
      localStorage.removeItem(RECENT_KEY);
    } catch (err) {
      console.error('localStorage 삭제 실패:', err);
    }
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      setIsLoading(true);
      setError(null);
      try {
        const [weather, airQuality] = await Promise.all([
          fetchWeatherData(selectedCity.lat, selectedCity.lon),
          fetchAirQualityData(selectedCity.lat, selectedCity.lon),
        ]);
        if (!isCancelled) {
          setWeatherData(weather);
          setAirQualityData(airQuality);
          setLastUpdated(new Date());
          addRecentCity(selectedCity);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('데이터 로드 실패:', err);
          setError('날씨 및 대기질 데이터를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isCancelled = true;
    };
  }, [selectedCity, refreshTrigger, addRecentCity]);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSelectCity = (city) => {
    setSelectedCity(city);
  };

  const currentWeather = weatherData?.current;
  const currentAir = airQualityData?.current;
  const hourly = weatherData?.hourly;
  const daily = weatherData?.daily;

  // 동적 기상 테마 정보 계산 (기상 상태 + 주야간 + 라이트/다크모드)
  const currentTheme = getWeatherTheme(
    currentWeather?.weather_code,
    currentWeather?.is_day ?? 1,
    themeMode
  );

  return (
    <div
      className={`app-theme-wrapper theme-${currentTheme.type}`}
      data-theme={themeMode}
      style={{
        background: `${currentTheme.bgPattern}, ${currentTheme.gradient}`,
      }}
    >
      <div className="dashboard-container">
        {/* 상단 헤더 영역 */}
        <header className="dashboard-header">
          <div className="header-title-group">
            <div className="title-with-badge">
              <h1>실시간 날씨 · 미세먼지 대시보드</h1>
              <span className="weather-mood-pill" style={{ borderColor: `${currentTheme.accentColor}50` }}>
                <Sparkles size={13} style={{ color: currentTheme.accentColor }} />
                <span>{currentTheme.name}</span>
              </span>
            </div>
            <p className="header-subtitle">Open-Meteo 공개 API 기반 글로벌 실시간 기상 관측 및 예보</p>
          </div>

          <div className="header-actions">
            {/* 세계지도 / 지구본 맵 버튼 */}
            <button
              type="button"
              className="world-map-btn"
              onClick={() => setIsWorldMapOpen(true)}
              title="세계 날씨 맵 열기"
            >
              <Globe size={16} />
              <span>세계 날씨 맵</span>
            </button>

            {/* 라이트/다크모드 토글 스위치 (기본값: 라이트) */}
            <ThemeToggle mode={themeMode} onToggle={toggleThemeMode} />

            {/* 새로고침 버튼 */}
            <button
              type="button"
              className="refresh-btn"
              onClick={handleRefresh}
              disabled={isLoading}
              title="새로고침"
            >
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              <span>새로고침</span>
            </button>
          </div>
        </header>

        {/* 업데이트 시각 */}
        {lastUpdated && (
          <div className="header-meta-bar">
            <span className="last-updated">
              마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        )}

        {/* 도시 검색창 (400ms 디바운스 적용) */}
        <section className="search-section">
          <CitySearch onSelectCity={handleSelectCity} />
        </section>

        {/* 최근 본 도시 (localStorage 연동) */}
        <RecentCities
          recentCities={recentCities}
          onSelectCity={handleSelectCity}
          onRemoveCity={handleRemoveRecentCity}
          onClearAll={handleClearAllRecentCities}
          currentCityName={selectedCity.name}
        />

        {/* 주요 프리셋 도시 빠른 선택 바 */}
        <nav className="city-presets" aria-label="주요 도시 빠른 선택">
          <div className="city-presets-label">
            <MapPin size={16} />
            <span>주요 프리셋</span>
          </div>
          <div className="city-btn-list">
            {DEFAULT_CITIES.map((city) => {
              const isSelected = city.name === selectedCity.name;
              return (
                <button
                  key={city.name}
                  type="button"
                  className={`city-btn ${isSelected ? 'active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        </nav>

        {/* 에러 상태 안내 */}
        {error && (
          <div className="alert-box error">
            <AlertCircle size={20} />
            <span>{error}</span>
            <button type="button" onClick={handleRefresh}>
              다시 시도
            </button>
          </div>
        )}

        {/* 로딩 표시 */}
        {isLoading && (
          <div className="loading-state">
            <RefreshCw size={36} className="spinning" />
            <p>{selectedCity.name}의 실시간 기상 데이터를 불러오는 중입니다...</p>
          </div>
        )}

        {/* 대시보드 메인 콘텐츠 */}
        {!isLoading && !error && currentWeather && currentAir && (
          <main className="dashboard-content">
            {/* 상단 2열 그리드: 현재 날씨 + 미세먼지 */}
            <div className="dashboard-grid">
              <CurrentWeather currentWeather={currentWeather} cityName={selectedCity.name} />
              <AirQualityCard currentAir={currentAir} />
            </div>

            {/* 중단: 24시간 기온 차트 */}
            <div className="dashboard-section">
              <HourlyChart hourly={hourly} currentTime={currentWeather.time} />
            </div>

            {/* 하단: 7일간 주간 일기예보 */}
            <div className="dashboard-section">
              <WeeklyForecast daily={daily} />
            </div>
          </main>
        )}
      </div>

      {/* 인터랙티브 세계 날씨 맵 모달 */}
      <WorldMapModal
        isOpen={isWorldMapOpen}
        onClose={() => setIsWorldMapOpen(false)}
        onSelectCity={handleSelectCity}
      />
    </div>
  );
}

export default App;
