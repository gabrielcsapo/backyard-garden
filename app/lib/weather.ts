import { db } from "../db/index.ts";
import { weatherCache, settings } from "../db/schema.ts";
import { eq, and } from "drizzle-orm";

export type DailyWeather = {
  date: string;
  tempMaxF: number;
  tempMinF: number;
  precipitationMm: number;
  precipitationProbability: number;
  weatherCode: number;
};

export type WeatherForecast = {
  daily: DailyWeather[];
  currentTempF: number;
  todayHigh: number;
  todayLow: number;
  todayPrecipMm: number;
  frostAlert: boolean;
  frostAlertDays: string[];
};

const CACHE_HOURS = 3;

function celsiusToFahrenheit(c: number): number {
  return Math.round(c * 9 / 5 + 32);
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
): Promise<WeatherForecast | null> {
  const today = new Date().toISOString().split("T")[0];

  // Check cache
  const cached = db
    .select()
    .from(weatherCache)
    .where(
      and(
        eq(weatherCache.latitude, latitude),
        eq(weatherCache.longitude, longitude),
        eq(weatherCache.date, today),
      ),
    )
    .get();

  if (cached) {
    const fetchedAt = new Date(cached.fetchedAt);
    const hoursAgo = (Date.now() - fetchedAt.getTime()) / (1000 * 60 * 60);
    if (hoursAgo < CACHE_HOURS) {
      return cached.data as unknown as WeatherForecast;
    }
  }

  // Fetch from Open-Meteo
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set(
      "daily",
      "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code",
    );
    url.searchParams.set("current", "temperature_2m");
    url.searchParams.set("temperature_unit", "celsius");
    url.searchParams.set("forecast_days", "7");
    url.searchParams.set("timezone", "auto");

    const res = await fetch(url.toString());
    if (!res.ok) return null;

    const data = await res.json();

    const daily: DailyWeather[] = data.daily.time.map(
      (date: string, i: number) => ({
        date,
        tempMaxF: celsiusToFahrenheit(data.daily.temperature_2m_max[i]),
        tempMinF: celsiusToFahrenheit(data.daily.temperature_2m_min[i]),
        precipitationMm: data.daily.precipitation_sum[i],
        precipitationProbability:
          data.daily.precipitation_probability_max[i],
        weatherCode: data.daily.weather_code[i],
      }),
    );

    const frostAlertDays = daily
      .filter((d) => d.tempMinF <= 32)
      .map((d) => d.date);

    const forecast: WeatherForecast = {
      daily,
      currentTempF: celsiusToFahrenheit(data.current.temperature_2m),
      todayHigh: daily[0]?.tempMaxF ?? 0,
      todayLow: daily[0]?.tempMinF ?? 0,
      todayPrecipMm: daily[0]?.precipitationMm ?? 0,
      frostAlert: frostAlertDays.length > 0,
      frostAlertDays,
    };

    // Upsert cache
    if (cached) {
      db.update(weatherCache)
        .set({
          data: forecast as any,
          fetchedAt: new Date().toISOString(),
        })
        .where(eq(weatherCache.id, cached.id))
        .run();
    } else {
      db.insert(weatherCache)
        .values({
          latitude,
          longitude,
          date: today,
          data: forecast as any,
          fetchedAt: new Date().toISOString(),
        })
        .run();
    }

    return forecast;
  } catch {
    return null;
  }
}

export function getWeatherDescription(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 86) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return "sun";
  if (code <= 3) return "cloud-sun";
  if (code <= 48) return "cloud-fog";
  if (code <= 67) return "cloud-rain";
  if (code <= 77) return "snowflake";
  if (code <= 86) return "snowflake";
  if (code <= 99) return "cloud-lightning";
  return "cloud";
}

export async function getSettingsWithCoords() {
  const userSettings = db.select().from(settings).limit(1).get();
  return userSettings ?? null;
}
