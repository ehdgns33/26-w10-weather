import { Clock } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function HourlyChart({ hourly, currentTime }) {
  if (!hourly || !hourly.time || !hourly.time.length) return null;

  // 현재 시각 인덱스 탐색 (전달받은 currentTime 기준, 없으면 0)
  const nowIsoHour = currentTime ? currentTime.slice(0, 13) : '';
  let startIndex = nowIsoHour ? hourly.time.findIndex((t) => t.startsWith(nowIsoHour)) : 0;
  if (startIndex === -1) {
    startIndex = 0;
  }

  // 24개 시간 데이터 슬라이스
  let sliceEnd = startIndex + 24;
  if (sliceEnd > hourly.time.length) {
    startIndex = Math.max(0, hourly.time.length - 24);
    sliceEnd = hourly.time.length;
  }

  const hoursData = [];
  for (let i = startIndex; i < sliceEnd; i++) {
    hoursData.push({
      time: hourly.time[i],
      temp: hourly.temperature_2m[i],
      weatherCode: hourly.weather_code[i],
      isNow: i === startIndex,
    });
  }

  if (hoursData.length === 0) return null;

  const step = 56;
  const chartWidth = hoursData.length * step;
  const chartHeight = 120;
  const paddingTop = 26;
  const paddingBottom = 20;

  const temps = hoursData.map((d) => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = Math.max(1, maxTemp - minTemp);

  const points = hoursData.map((d, i) => {
    const x = i * step + step / 2;
    const y = chartHeight - paddingBottom - ((d.temp - minTemp) / range) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, temp: Math.round(d.temp) };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const areaPolygonStr = `${polylineStr} ${lastPoint.x},${chartHeight} ${firstPoint.x},${chartHeight}`;

  return (
    <section className="card hourly-chart-card">
      <div className="card-header">
        <div className="card-title-group">
          <Clock size={18} />
          <h2>24시간 기온 예보</h2>
        </div>
        <span className="hourly-hint">좌우로 스크롤하여 시간별 기온 확인</span>
      </div>

      <div className="hourly-scroll-container">
        <div className="hourly-track" style={{ width: chartWidth }}>
          {/* SVG 꺾은선 차트 */}
          <svg
            className="hourly-svg"
            width={chartWidth}
            height={chartHeight}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          >
            <defs>
              <linearGradient id="hourlyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 영역 그라데이션 */}
            <polygon points={areaPolygonStr} fill="url(#hourlyGradient)" />

            {/* 꺾은선 */}
            <polyline
              points={polylineStr}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* 각 데이터 포인트 및 기온 레이블 */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoursData[idx].isNow ? 5 : 3.5}
                  fill={hoursData[idx].isNow ? '#3b82f6' : '#ffffff'}
                  stroke="#3b82f6"
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="hourly-temp-text"
                >
                  {p.temp}°
                </text>
              </g>
            ))}
          </svg>

          {/* 하단 날씨 아이콘 & 시간 레이블 행 */}
          <div className="hourly-labels-row">
            {hoursData.map((d, idx) => {
              const info = getWeatherInfo(d.weatherCode);
              const dateObj = new Date(d.time);
              const hourNum = dateObj.getHours();
              const hourLabel = d.isNow ? '지금' : `${hourNum}시`;

              return (
                <div key={idx} className={`hourly-col ${d.isNow ? 'active' : ''}`} style={{ width: step }}>
                  <div className="hourly-icon-wrap" title={info.label}>
                    <WeatherIcon name={info.icon} size={18} color={info.color} />
                  </div>
                  <span className="hourly-time-label">{hourLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
