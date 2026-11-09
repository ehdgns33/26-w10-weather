import { Activity } from 'lucide-react';
import { getAirQualityStatus } from '../api/weather';

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

export default function AirQualityCard({ currentAir }) {
  if (!currentAir) return null;

  const airStatus = getAirQualityStatus(currentAir.pm10, currentAir.pm2_5);
  const pm10Grade = getPmGrade('pm10', currentAir.pm10);
  const pm25Grade = getPmGrade('pm25', currentAir.pm2_5);

  return (
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
          {airStatus.status === '좋음' && '공기가 매우 쾌적합니다. 야외 활동을 적극 추천합니다!'}
          {airStatus.status === '보통' && '대기질이 무난합니다. 일상적인 야외 활동이 가능합니다.'}
          {airStatus.status === '나쁨' && '미세먼지 농도가 높습니다. 외출 시 마스크를 착용하세요.'}
          {airStatus.status === '매우 나쁨' && '대기질이 매우 나쁩니다. 무리한 야외 활동을 피하세요.'}
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
  );
}

