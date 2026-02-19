import { Hono } from "hono";
import { getWeatherForecast } from "../../lib/weather.ts";
import { getAllSettings } from "../../db/queries.ts";

export const weatherRoutes = new Hono();

weatherRoutes.get("/weather", async (c) => {
  const lat = c.req.query("lat");
  const lon = c.req.query("lon");

  let latitude: number | null = lat ? Number(lat) : null;
  let longitude: number | null = lon ? Number(lon) : null;

  // Fall back to settings if no query params
  if (latitude == null || longitude == null) {
    const settings = await getAllSettings();
    latitude = settings?.latitude ?? null;
    longitude = settings?.longitude ?? null;
  }

  if (latitude == null || longitude == null) {
    return c.json({ error: "No location configured. Set lat/lon in settings or pass ?lat=&lon= query params." }, 400);
  }

  const forecast = await getWeatherForecast(latitude, longitude);
  return c.json(forecast);
});
