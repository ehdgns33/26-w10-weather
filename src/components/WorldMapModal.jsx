import { useState, useEffect } from 'react';
import { X, Globe, Thermometer, Droplets, Wind, ArrowRight, Loader2 } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { fetchWeatherData, getWeatherInfo } from '../api/weather';

// 세계 주요 국가 및 랜드마크 도시 데이터 (경위도 포함)
const WORLD_COUNTRIES = [
  { id: 'kr', name: '대한민국', city: '서울', flag: '🇰🇷', lat: 37.5665, lon: 126.9780, continent: '아시아' },
  { id: 'jp', name: '일본', city: '도쿄', flag: '🇯🇵', lat: 35.6895, lon: 139.6917, continent: '아시아' },
  { id: 'cn', name: '중국', city: '베이징', flag: '🇨🇳', lat: 39.9042, lon: 116.4074, continent: '아시아' },
  { id: 'sg', name: '싱가포르', city: '싱가포르', flag: '🇸🇬', lat: 1.3521, lon: 103.8198, continent: '아시아' },
  { id: 'in', name: '인도', city: '뉴델리', flag: '🇮🇳', lat: 28.6139, lon: 77.2090, continent: '아시아' },
  { id: 'ae', name: 'UAE', city: '두바이', flag: '🇦🇪', lat: 25.2048, lon: 55.2708, continent: '아시아' },

  { id: 'gb', name: '영국', city: '런던', flag: '🇬🇧', lat: 51.5074, lon: -0.1278, continent: '유럽' },
  { id: 'fr', name: '프랑스', city: '파리', flag: '🇫🇷', lat: 48.8566, lon: 2.3522, continent: '유럽' },
  { id: 'de', name: '독일', city: '베를린', flag: '🇩🇪', lat: 52.5200, lon: 13.4050, continent: '유럽' },
  { id: 'it', name: '이탈리아', city: '로마', flag: '🇮🇹', lat: 41.9028, lon: 12.4964, continent: '유럽' },

  { id: 'us-ny', name: '미국', city: '뉴욕', flag: '🇺🇸', lat: 40.7128, lon: -74.0060, continent: '아메리카' },
  { id: 'us-la', name: '미국', city: '로스앤젤레스', flag: '🇺🇸', lat: 34.0522, lon: -118.2437, continent: '아메리카' },
  { id: 'ca', name: '캐나다', city: '밴쿠버', flag: '🇨🇦', lat: 49.2827, lon: -123.1207, continent: '아메리카' },
  { id: 'br', name: '브라질', city: '상파울루', flag: '🇧🇷', lat: -23.5505, lon: -46.6333, continent: '아메리카' },

  { id: 'au', name: '호주', city: '시드니', flag: '🇦🇺', lat: -33.8688, lon: 151.2093, continent: '오세아니아' },
  { id: 'eg', name: '이집트', city: '카이로', flag: '🇪🇬', lat: 30.0444, lon: 31.2357, continent: '아프리카' },
  { id: 'za', name: '남아공', city: '케이프타운', flag: '🇿🇦', lat: -33.9249, lon: 18.4241, continent: '아프리카' },
];

const CONTINENTS = ['전체', '아시아', '유럽', '아메리카', '오세아니아', '아프리카'];

// 경위도를 SVG 좌표계(900 x 480)로 변환
function coordsToSvg(lat, lon) {
  const mapW = 900;
  const mapH = 480;
  const x = ((lon + 180) / 360) * mapW;
  const y = ((90 - lat) / 180) * mapH;
  return { x, y };
}

export default function WorldMapModal({ isOpen, onClose, onSelectCity }) {
  const [selectedContinent, setSelectedContinent] = useState('전체');
  const [activeCountry, setActiveCountry] = useState(WORLD_COUNTRIES[0]);
  const [previewWeather, setPreviewWeather] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // 선택된 국가 날씨 미리보기 비동기 호출
  useEffect(() => {
    if (!activeCountry) return;

    let isCancelled = false;
    async function loadCountryWeather() {
      setIsLoadingPreview(true);
      try {
        const data = await fetchWeatherData(activeCountry.lat, activeCountry.lon);
        if (!isCancelled) {
          setPreviewWeather(data?.current || null);
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('국가 날씨 미리보기 로드 실패:', err);
          setPreviewWeather(null);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPreview(false);
        }
      }
    }

    loadCountryWeather();

    return () => {
      isCancelled = true;
    };
  }, [activeCountry]);

  // ESC 키 닫기 이벤트
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCountries = selectedContinent === '전체'
    ? WORLD_COUNTRIES
    : WORLD_COUNTRIES.filter((c) => c.continent === selectedContinent);

  const weatherInfo = previewWeather ? getWeatherInfo(previewWeather.weather_code) : null;

  const handleApplyCity = () => {
    onSelectCity({
      name: `${activeCountry.name} (${activeCountry.city})`,
      lat: activeCountry.lat,
      lon: activeCountry.lon,
    });
    onClose();
  };

  return (
    <div className="world-map-backdrop" onClick={onClose}>
      <div className="world-map-modal" onClick={(e) => e.stopPropagation()}>
        {/* 모달 상단 헤더 */}
        <div className="world-map-header">
          <div className="map-title-group">
            <Globe size={22} className="globe-icon" />
            <div>
              <h3>인터랙티브 세계 날씨 맵 (지구본 모드)</h3>
              <p>원하는 나라의 핀을 클릭하여 실시간 기상 상태를 확인하고 대시보드로 이동하세요.</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="닫기">
            <X size={20} />
          </button>
        </div>

        {/* 대륙별 필터 탭 */}
        <div className="continent-filters">
          {CONTINENTS.map((continent) => (
            <button
              key={continent}
              type="button"
              className={`continent-btn ${selectedContinent === continent ? 'active' : ''}`}
              onClick={() => setSelectedContinent(continent)}
            >
              {continent}
            </button>
          ))}
        </div>

        {/* 메인 지도 및 미리보기 분할 뷰 */}
        <div className="world-map-body">
          {/* 인터랙티브 SVG 세계지도 */}
          <div className="map-canvas-container">
            <svg
              className="world-map-svg"
              viewBox="0 0 900 480"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* 위도 및 경도 가이드 격자선 */}
              <defs>
                <pattern id="gridPattern" width="75" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 75 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.12" />
                </pattern>
              </defs>
              <rect width="900" height="480" fill="url(#gridPattern)" />

              {/* 세계 지도 대륙 실루엣 간략화 path */}
              <g className="continent-paths" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2">
                {/* 북미 */}
                <path d="M 120,60 Q 200,80 250,140 Q 210,210 160,180 Q 110,130 120,60 Z" />
                {/* 남미 */}
                <path d="M 230,220 Q 300,260 270,380 Q 220,410 210,320 Q 210,240 230,220 Z" />
                {/* 유럽 */}
                <path d="M 430,80 Q 520,70 540,140 Q 470,180 430,130 Z" />
                {/* 아프리카 */}
                <path d="M 430,180 Q 520,200 500,340 Q 440,360 410,250 Z" />
                {/* 아시아 */}
                <path d="M 520,70 Q 750,60 760,200 Q 640,240 540,160 Z" />
                {/* 호주 */}
                <path d="M 680,290 Q 790,290 770,370 Q 680,380 680,290 Z" />
              </g>

              {/* 각 국가별 인터랙티브 핀 */}
              {filteredCountries.map((c) => {
                const { x, y } = coordsToSvg(c.lat, c.lon);
                const isSelected = activeCountry.id === c.id;

                return (
                  <g
                    key={c.id}
                    className={`country-pin-group ${isSelected ? 'selected' : ''}`}
                    transform={`translate(${x}, ${y})`}
                    onClick={() => setActiveCountry(c)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* 펄스 애니메이션 서클 */}
                    <circle r={isSelected ? 14 : 9} className="pin-pulse" />
                    <circle r={isSelected ? 6 : 4} className="pin-core" />
                    <text
                      y={-10}
                      textAnchor="middle"
                      className="pin-label"
                    >
                      {c.flag} {c.city}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* 우측 실시간 날씨 미리보기 카드 */}
          <div className="country-preview-card">
            <div className="preview-top">
              <span className="preview-flag">{activeCountry.flag}</span>
              <div>
                <h4>{activeCountry.name}</h4>
                <span className="preview-city">{activeCountry.city} · {activeCountry.continent}</span>
              </div>
            </div>

            {isLoadingPreview ? (
              <div className="preview-loading">
                <Loader2 size={24} className="spinning" />
                <span>날씨 데이터 수신 중...</span>
              </div>
            ) : previewWeather && weatherInfo ? (
              <div className="preview-details">
                <div className="preview-main-metric">
                  <WeatherIcon name={weatherInfo.icon} size={38} color={weatherInfo.color} />
                  <div>
                    <span className="preview-temp">{Math.round(previewWeather.temperature_2m)}°C</span>
                    <span className="preview-desc" style={{ color: weatherInfo.color }}>
                      {weatherInfo.label}
                    </span>
                  </div>
                </div>

                <div className="preview-sub-grid">
                  <div className="preview-sub-item">
                    <Thermometer size={14} color="#ef4444" />
                    <span>체감 {Math.round(previewWeather.apparent_temperature)}°C</span>
                  </div>
                  <div className="preview-sub-item">
                    <Droplets size={14} color="#3b82f6" />
                    <span>습도 {previewWeather.relative_humidity_2m}%</span>
                  </div>
                  <div className="preview-sub-item">
                    <Wind size={14} color="#10b981" />
                    <span>풍속 {previewWeather.wind_speed_10m} km/h</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="preview-empty">기상 데이터를 불러올 수 없습니다.</div>
            )}

            <button
              type="button"
              className="preview-select-btn"
              onClick={handleApplyCity}
            >
              <span>{activeCountry.city} 대시보드로 이동</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
