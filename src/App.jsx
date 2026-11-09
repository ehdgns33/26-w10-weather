import { useState, useEffect } from 'react';
import {
  DEFAULT_CITIES,
  getWeatherInfo,
  getAirQualityStatus,
  fetchWeatherData,
  fetchAirQualityData,
} from './api/weather';
import {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  MapPin,
  RefreshCw,
  AlertCircle,
  Activity,
  Calendar,
} from 'lucide-react';
import './App.css';

// 날씨 아이콘 맵핑
const ICON_MAP = {
  Sun,
  SunDim,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  Snowflake,
  CloudLightning,
};

function WeatherIcon({ name, size = 48, color, className = '' }) {
  const IconComponent = ICON_MAP[name] || Cloud;
  return <IconComponent size={size} color={color} className={className} />;
}

// 개별 미세먼지 수치 기준 라벨
function getPmGrade(type, value) {
  if (value == null) return { label: '-', color: '#94a3b8' };
  if (type === 'pm10') {
    if (value <= 30) return { label: '좋음', color: '#10b981' };
    if (value <= 80) return { label: '보통', color: '#3b82f6' };
    if (value <= 150) return { label: '나쁨', color: '#f97316' };
    return { label: '매우 나쁨', color: '#ef4444' };
  } else {
    // pm2.5
    if (value <= 15) return { label: '좋음', color: '#10b981' };
    if (value <= 35) return { label: '보통', color: '#3b82f6' };
    if (value <= 75) return { label: '나쁨', color: '#f97316' };
    return { label: '매우 나쁨', color: '#ef4444' };
  }
}

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

  const currentWeather = weatherData?.current;
  const currentAir = airQualityData?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null;
  const airStatus = currentAir ? getAirQualityStatus(currentAir.pm10, currentAir.pm2_5) : null;

  const pm10Grade = currentAir ? getPmGrade('pm10', currentAir.pm10) : null;
  const pm25Grade = currentAir ? getPmGrade('pm25', currentAir.pm2_5) : null;

  return (
    <div className="dashboard-container">
      {/* 헤더 영역 */}
      <header className="dashboard-header">
        <div className="header-title-group">
          <h1>실시간 날씨 · 미세먼지 대시보드</h1>
          <p className="header-subtitle">Open-Meteo 공개 API 기반 실시간 기상 관측 데이터</p>
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

      {/* 도시 빠른 선택 바 */}
      <nav className="city-presets" aria-label="주요 도시 빠른 선택">
        <div className="city-presets-label">
          <MapPin size={16} />
          <span>주요 도시</span>
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
          <p>{selectedCity.name}의 최신 기상 데이터를 불러오는 중입니다...</p>
        </div>
      )}

      {/* 대시보드 메인 콘텐츠 */}
      {!isLoading && !error && currentWeather && currentAir && (
        <main className="dashboard-grid">
          {/* 1. 현재 날씨 카드 */}
          <section className="card weather-card">
            <div className="card-header">
              <div className="city-badge">
                <MapPin size={18} />
                <h2>{selectedCity.name}</h2>
              </div>
              <span className="time-tag">
                <Calendar size={14} />
                {new Date(currentWeather.time).toLocaleDateString('ko-KR', {
                  month: 'long',
                  day: 'numeric',
                  weekday: 'short',
                })}
              </span>
            </div>

            <div className="weather-main">
              <div className="weather-visual">
                <WeatherIcon
                  name={weatherInfo.icon}
                  size={72}
                  color={weatherInfo.color}
                  className="weather-main-icon"
                />
                <span className="weather-desc" style={{ color: weatherInfo.color }}>
                  {weatherInfo.label}
                </span>
              </div>
              <div className="weather-temp">
                <span className="temp-val">{Math.round(currentWeather.temperature_2m)}</span>
                <span className="temp-unit">°C</span>
              </div>
            </div>

            <div className="weather-sub-metrics">
              <div className="sub-metric-item">
                <div className="metric-icon-wrap">
                  <Thermometer size={18} color="#ef4444" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">체감 온도</span>
                  <span className="metric-value">{Math.round(currentWeather.apparent_temperature)}°C</span>
                </div>
              </div>

              <div className="sub-metric-item">
                <div className="metric-icon-wrap">
                  <Droplets size={18} color="#3b82f6" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">습도</span>
                  <span className="metric-value">{currentWeather.relative_humidity_2m}%</span>
                </div>
              </div>

              <div className="sub-metric-item">
                <div className="metric-icon-wrap">
                  <Wind size={18} color="#10b981" />
                </div>
                <div className="metric-info">
                  <span className="metric-label">풍속</span>
                  <span className="metric-value">{currentWeather.wind_speed_10m} km/h</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 미세먼지 카드 */}
          <section className="card air-card">
            <div className="card-header">
              <div className="card-title-group">
                <Activity size={18} />
                <h2>대기질 · 미세먼지</h2>
              </div>
              <div
                className="air-status-badge"
                style={{ backgroundColor: airStatus.badgeColor }}
              >
                {airStatus.status}
              </div>
            </div>

            <div className="air-summary-box" style={{ borderColor: `${airStatus.badgeColor}40` }}>
              <div className="air-indicator-dot" style={{ backgroundColor: airStatus.badgeColor }}></div>
              <p className="air-summary-text">
                {airStatus.status === '좋음' && '공기가 매우 쾌적합니다. 야외 활동을 추천합니다!'}
                {airStatus.status === '보통' && '대기질이 무난합니다. 일상적인 야외 활동이 가능합니다.'}
                {airStatus.status === '나쁨' && '미세먼지 수치가 높습니다. 마스크 착용을 권장합니다.'}
                {airStatus.status === '매우 나쁨' && '대기질이 매우 나쁩니다. 가급적 실내에 머무르세요.'}
              </p>
            </div>

            <div className="air-metrics-grid">
              {/* PM10 미세먼지 */}
              <div className="air-metric-card">
                <div className="air-metric-top">
                  <span className="air-name">미세먼지 (PM10)</span>
                  <span
                    className="air-grade-pill"
                    style={{
                      color: pm10Grade.color,
                      backgroundColor: `${pm10Grade.color}15`,
                      borderColor: `${pm10Grade.color}40`,
                    }}
                  >
                    {pm10Grade.label}
                  </span>
                </div>
                <div className="air-metric-val">
                  <span className="num">{currentAir.pm10 ?? '-'}</span>
                  <span className="unit">μg/m³</span>
                </div>
                <div className="air-range-bar">
                  <div
                    className="air-range-fill"
                    style={{
                      width: `${Math.min(100, ((currentAir.pm10 || 0) / 150) * 100)}%`,
                      backgroundColor: pm10Grade.color,
                    }}
                  />
                </div>
              </div>

              {/* PM2.5 초미세먼지 */}
              <div className="air-metric-card">
                <div className="air-metric-top">
                  <span className="air-name">초미세먼지 (PM2.5)</span>
                  <span
                    className="air-grade-pill"
                    style={{
                      color: pm25Grade.color,
                      backgroundColor: `${pm25Grade.color}15`,
                      borderColor: `${pm25Grade.color}40`,
                    }}
                  >
                    {pm25Grade.label}
                  </span>
                </div>
                <div className="air-metric-val">
                  <span className="num">{currentAir.pm2_5 ?? '-'}</span>
                  <span className="unit">μg/m³</span>
                </div>
                <div className="air-range-bar">
                  <div
                    className="air-range-fill"
                    style={{
                      width: `${Math.min(100, ((currentAir.pm2_5 || 0) / 75) * 100)}%`,
                      backgroundColor: pm25Grade.color,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="air-footer">
              <span className="air-standard-notice">※ 한국 환경부 미세먼지 등급 기준 적용</span>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
