const LATITUDE = -34.77;
const LONGITUDE = 150.69;
const TIMEZONE = 'Australia/Sydney';

// WMO Weather interpretation codes
const WMO_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: 'Clear sky', icon: 'sun' },
  1: { description: 'Mainly clear', icon: 'sun' },
  2: { description: 'Partly cloudy', icon: 'cloud-sun' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Foggy', icon: 'fog' },
  48: { description: 'Rime fog', icon: 'fog' },
  51: { description: 'Light drizzle', icon: 'drizzle' },
  53: { description: 'Drizzle', icon: 'drizzle' },
  55: { description: 'Dense drizzle', icon: 'drizzle' },
  56: { description: 'Freezing drizzle', icon: 'drizzle' },
  57: { description: 'Heavy freezing drizzle', icon: 'drizzle' },
  61: { description: 'Slight rain', icon: 'rain' },
  63: { description: 'Moderate rain', icon: 'rain' },
  65: { description: 'Heavy rain', icon: 'rain-heavy' },
  66: { description: 'Freezing rain', icon: 'rain' },
  67: { description: 'Heavy freezing rain', icon: 'rain-heavy' },
  71: { description: 'Slight snow', icon: 'cloud' },
  73: { description: 'Moderate snow', icon: 'cloud' },
  75: { description: 'Heavy snow', icon: 'cloud' },
  77: { description: 'Snow grains', icon: 'cloud' },
  80: { description: 'Slight showers', icon: 'rain' },
  81: { description: 'Moderate showers', icon: 'rain' },
  82: { description: 'Violent showers', icon: 'rain-heavy' },
  85: { description: 'Slight snow showers', icon: 'cloud' },
  86: { description: 'Heavy snow showers', icon: 'cloud' },
  95: { description: 'Thunderstorm', icon: 'storm' },
  96: { description: 'Thunderstorm with hail', icon: 'storm' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'storm' },
};

function getCondition(code: number): { description: string; icon: string } {
  return WMO_CODES[code] ?? { description: 'Unknown', icon: 'cloud' };
}

export interface DailyWeather {
  date: string;
  precipitationSum: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
  condition: { description: string; icon: string };
  isForecast: boolean;
}

export interface WeatherData {
  current: {
    temperature: number;
    weatherCode: number;
    condition: { description: string; icon: string };
    humidity: number;
    windSpeed: number;
    precipitation: number;
  };
  daily: DailyWeather[];
  fetchedAt: string;
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    weather_code: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    precipitation: number;
  };
  daily: {
    time: string[];
    precipitation_sum: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
}

export async function fetchWeatherData(): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,weather_code&past_days=30&forecast_days=7&timezone=${TIMEZONE}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m,precipitation`;

  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new Error(`Open-Meteo API error: ${res.status}`);
  }

  const raw: OpenMeteoResponse = await res.json();

  // Today's date in AEST
  const today = new Date().toLocaleDateString('en-CA', { timeZone: TIMEZONE });

  const daily: DailyWeather[] = raw.daily.time.map((date, i) => ({
    date,
    precipitationSum: raw.daily.precipitation_sum[i],
    temperatureMax: raw.daily.temperature_2m_max[i],
    temperatureMin: raw.daily.temperature_2m_min[i],
    weatherCode: raw.daily.weather_code[i],
    condition: getCondition(raw.daily.weather_code[i]),
    isForecast: date > today,
  }));

  return {
    current: {
      temperature: raw.current.temperature_2m,
      weatherCode: raw.current.weather_code,
      condition: getCondition(raw.current.weather_code),
      humidity: raw.current.relative_humidity_2m,
      windSpeed: raw.current.wind_speed_10m,
      precipitation: raw.current.precipitation,
    },
    daily,
    fetchedAt: new Date().toISOString(),
  };
}
