import { MapPin, Calendar, Thermometer, Droplets, Wind } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherInfo } from '../api/weather';

export default function CurrentWeather({ currentWeather, cityName }) {
  if (!currentWeather) return null;

  const weatherInfo = getWeatherInfo(currentWeather.weather_code);
  const formattedDate = new Date(currentWeather.time).toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });

  return (
    <section className="card weather-card">
      <div className="card-header">
        <div className="city-badge">
          <MapPin size={18} />
          <h2>{cityName}</h2>
        </div>
        <span className="time-tag">
          <Calendar size={14} />
          {formattedDate}
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
  );
}

