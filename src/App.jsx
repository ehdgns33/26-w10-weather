import { useState, useEffect } from 'react';
import {
  DEFAULT_CITIES,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import CurrentWeather from './components/CurrentWeather';
import AirQualityCard from './components/AirQualityCard';
import HourlyChart from './components/HourlyChart';
import WeeklyForecast from './components/WeeklyForecast';
import CitySearch from './components/CitySearch';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import './App.css';

function App() {
  const [selectedCity, setSelectedCity] = useState(DEFAULT_CITIES[0]);
  const [weatherData, setWeatherData] = useState(null);
  const [airQualityData, setAirQualityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
  }, [selectedCity, refreshTrigger]);

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

  return (
    <div className="dashboard-container">
      {/* 1. 상단 헤더 영역 */}
      <header className="dashboard-header">
        <div className="header-title-group">
          <h1>실시간 날씨 · 미세먼지 대시보드</h1>
          <p className="header-subtitle">Open-Meteo 공개 API 기반 실시간 기상 관측 및 예보</p>
        </div>
        {lastUpdated && (
          <div className="header-meta">
            <span className="last-updated">
              업데이트: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
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
        )}
      </header>

      {/* 2. 도시 검색창 (400ms 디바운스 적용) */}
      <section className="search-section">
        <CitySearch onSelectCity={handleSelectCity} />
      </section>

      {/* 3. 주요 도시 빠른 선택 바 */}
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

      {/* 4. 에러 알림 */}
      {error && (
        <div className="alert-box error">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button type="button" onClick={handleRefresh}>
            다시 시도
          </button>
        </div>
      )}

      {/* 5. 로딩 표시 */}
      {isLoading && (
        <div className="loading-state">
          <RefreshCw size={36} className="spinning" />
          <p>{selectedCity.name}의 기상 및 대기질 데이터를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 6. 대시보드 메인 콘텐츠 */}
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
  );
}

export default App;
