/**
 * 기상 상태 코드 및 주야간(is_day), 테마 모드(light/dark)에 따른 동적 비주얼 테마 정의
 */

export function getWeatherTheme(code, isDay = 1, mode = 'light') {
  const isDark = mode === 'dark';

  // 1. 뇌우 (천둥번개)
  if (code === 95) {
    return {
      type: 'thunder',
      name: '뇌우 (천둥번개)',
      gradient: isDark
        ? 'linear-gradient(135deg, #1e0836 0%, #2e1065 50%, #090d16 100%)'
        : 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
      accentColor: '#a855f7',
      bgPattern: 'radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.25) 0%, transparent 50%)',
    };
  }

  // 2. 눈 (눈 / 싸락눈 / 폭설)
  if (code >= 71 && code <= 77) {
    return {
      type: 'snow',
      name: '눈 (설경)',
      gradient: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)'
        : 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #e0e7ff 100%)',
      accentColor: '#60a5fa',
      bgPattern: 'radial-gradient(circle at 20% 80%, rgba(96, 165, 250, 0.2) 0%, transparent 60%)',
    };
  }

  // 3. 비 / 소나기 / 이슬비
  if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) {
    return {
      type: 'rain',
      name: '비 (우천)',
      gradient: isDark
        ? 'linear-gradient(135deg, #041a2f 0%, #082f49 50%, #0f172a 100%)'
        : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #93c5fd 100%)',
      accentColor: '#0284c7',
      bgPattern: 'radial-gradient(circle at 70% 30%, rgba(2, 132, 199, 0.25) 0%, transparent 60%)',
    };
  }

  // 4. 안개
  if (code === 45 || code === 48) {
    return {
      type: 'fog',
      name: '안개',
      gradient: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)'
        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)',
      accentColor: '#64748b',
      bgPattern: 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.2) 0%, transparent 70%)',
    };
  }

  // 5. 구름 조금 / 흐림
  if (code === 2 || code === 3) {
    if (!isDay) {
      return {
        type: 'cloudy-night',
        name: '흐린 밤',
        gradient: isDark
          ? 'linear-gradient(135deg, #090d16 0%, #0f172a 60%, #1e293b 100%)'
          : 'linear-gradient(135deg, #334155 0%, #1e293b 100%)',
        accentColor: '#94a3b8',
        bgPattern: 'radial-gradient(circle at 30% 20%, rgba(148, 163, 184, 0.15) 0%, transparent 50%)',
      };
    }
    return {
      type: 'cloudy-day',
      name: '흐림 (주간)',
      gradient: isDark
        ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #283548 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 60%, #dbeafe 100%)',
      accentColor: '#3b82f6',
      bgPattern: 'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%)',
    };
  }

  // 6. 맑음 (0, 1)
  if (!isDay) {
    return {
      type: 'clear-night',
      name: '맑은 밤 (별밤)',
      gradient: isDark
        ? 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e1b4b 100%)'
        : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
      accentColor: '#818cf8',
      bgPattern: 'radial-gradient(circle at 80% 15%, rgba(129, 140, 248, 0.25) 0%, transparent 50%)',
    };
  }

  // 맑음 낮 (기본)
  return {
    type: 'clear-day',
    name: '화창한 맑음',
    gradient: isDark
      ? 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #1e293b 100%)'
      : 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 50%, #fef3c7 100%)',
    accentColor: '#f59e0b',
    bgPattern: 'radial-gradient(circle at 85% 15%, rgba(245, 158, 11, 0.22) 0%, transparent 55%)',
  };
}

