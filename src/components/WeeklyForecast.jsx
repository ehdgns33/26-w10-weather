import { CalendarDays, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function WeeklyForecast({ daily }) {
  if (!daily || !daily.time || !daily.time.length) return null;

  // 전체 7일 중 최저/최고 기온 (온도 바 상대적 너비 계산용)
  const allMins = daily.temperature_2m_min.map((v) => Math.round(v));
  const allMaxs = daily.temperature_2m_max.map((v) => Math.round(v));
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const globalRange = Math.max(1, globalMax - globalMin);

  const daysList = daily.time.map((dateStr, i) => {
    const dateObj = new Date(dateStr);
    const isToday = i === 0;
    const weekday = isToday
      ? '오늘'
      : dateObj.toLocaleDateString('ko-KR', { weekday: 'short' });
    const formattedDate = `${dateObj.getMonth() + 1}.${dateObj.getDate()}`;
    const weatherInfo = getWeatherInfo(daily.weather_code[i]);
    const minTemp = allMins[i];
    const maxTemp = allMaxs[i];
    const rainProb = daily.precipitation_probability_max?.[i] ?? 0;

    // 기온 바 위치 계산
    const leftPercent = ((minTemp - globalMin) / globalRange) * 100;
    const widthPercent = Math.max(10, ((maxTemp - minTemp) / globalRange) * 100);

    return {
      dateStr,
      weekday,
      formattedDate,
      weatherInfo,
      minTemp,
      maxTemp,
      rainProb,
      leftPercent,
      widthPercent,
      isToday,
    };
  });

  return (
    <section className="card weekly-card">
      <div className="card-header">
        <div className="card-title-group">
          <CalendarDays size={18} />
          <h2>7일간 주간 일기예보</h2>
        </div>
        <span className="weekly-sub-notice">향후 일주일 기온 및 날씨 전망</span>
      </div>

      <div className="weekly-list">
        {daysList.map((day) => (
          <div key={day.dateStr} className={`weekly-item ${day.isToday ? 'today' : ''}`}>
            {/* 요일 및 날짜 */}
            <div className="weekly-day-group">
              <span className="weekly-day-name">{day.weekday}</span>
              <span className="weekly-date-sub">{day.formattedDate}</span>
            </div>

            {/* 날씨 아이콘 & 강수확률 */}
            <div className="weekly-condition">
              <WeatherIcon
                name={day.weatherInfo.icon}
                size={22}
                color={day.weatherInfo.color}
              />
              <span className="weekly-weather-label">{day.weatherInfo.label}</span>
              {day.rainProb > 0 ? (
                <span className="weekly-rain-prob" title={`강수 확률: ${day.rainProb}%`}>
                  <Droplets size={12} />
                  {day.rainProb}%
                </span>
              ) : (
                <span className="weekly-rain-prob zero">-</span>
              )}
            </div>

            {/* 기온 범위 바 */}
            <div className="weekly-temp-range">
              <span className="temp-min">{day.minTemp}°</span>
              <div className="temp-bar-track">
                <div
                  className="temp-bar-fill"
                  style={{
                    left: `${day.leftPercent}%`,
                    width: `${day.widthPercent}%`,
                  }}
                />
              </div>
              <span className="temp-max">{day.maxTemp}°</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

