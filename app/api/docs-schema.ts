export type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  queryParams?: { name: string; description: string; required?: boolean }[];
  bodySchema?: Record<string, string>;
  responseExample: unknown;
};

export type ApiGroup = {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
};

export const apiGroups: ApiGroup[] = [
  {
    name: "Health",
    description: "Server health check",
    endpoints: [
      {
        method: "GET",
        path: "/api/health",
        description: "Returns server status",
        responseExample: { status: "ok" },
      },
    ],
  },
  {
    name: "Settings",
    description: "Application settings (zone, frost dates, location)",
    endpoints: [
      {
        method: "GET",
        path: "/api/settings",
        description: "Get current settings",
        responseExample: {
          id: 1,
          zipCode: "90210",
          zone: "10a",
          lastFrostDate: "2026-03-15",
          firstFrostDate: "2026-11-15",
          latitude: 34.09,
          longitude: -118.41,
          updatedAt: "2026-02-16T12:00:00.000Z",
        },
      },
      {
        method: "POST",
        path: "/api/settings",
        description: "Update settings (upserts)",
        bodySchema: {
          zipCode: "string | null",
          zone: "string | null",
          lastFrostDate: "string (YYYY-MM-DD) | null",
          firstFrostDate: "string (YYYY-MM-DD) | null",
          latitude: "number | null",
          longitude: "number | null",
        },
        responseExample: { id: 1, zipCode: "90210", zone: "10a" },
      },
    ],
  },
  {
    name: "Yards",
    description: "Yard layouts and their elements",
    endpoints: [
      {
        method: "GET",
        path: "/api/yards",
        description: "List all yards. Use ?detail=summary for element counts.",
        queryParams: [
          { name: "detail", description: "'summary' to include element/planting counts" },
        ],
        responseExample: [{ id: 1, name: "Backyard", widthFt: 40, heightFt: 30 }],
      },
      {
        method: "GET",
        path: "/api/yards/:id",
        description: "Get a yard with all its elements",
        responseExample: {
          id: 1,
          name: "Backyard",
          widthFt: 40,
          heightFt: 30,
          elements: [{ id: 1, shapeType: "rectangle", x: 5, y: 5, width: 4, height: 8 }],
        },
      },
      {
        method: "POST",
        path: "/api/yards",
        description: "Create a new yard",
        bodySchema: {
          name: "string (required)",
          widthFt: "number (required)",
          heightFt: "number (required)",
        },
        responseExample: { id: 2 },
      },
      {
        method: "PUT",
        path: "/api/yards/:id",
        description: "Update a yard",
        bodySchema: {
          name: "string",
          widthFt: "number",
          heightFt: "number",
        },
        responseExample: { id: 1, name: "Front Yard", widthFt: 30, heightFt: 20 },
      },
      {
        method: "DELETE",
        path: "/api/yards/:id",
        description: "Delete a yard (cascades to elements and plantings)",
        responseExample: { success: true },
      },
    ],
  },
  {
    name: "Elements",
    description: "Yard elements (beds, paths, structures)",
    endpoints: [
      {
        method: "GET",
        path: "/api/yards/:yardId/elements",
        description: "List all elements in a yard",
        responseExample: [
          {
            id: 1,
            yardId: 1,
            shapeType: "rectangle",
            x: 5,
            y: 5,
            width: 4,
            height: 8,
            label: "Raised Bed A",
            sunExposure: "full_sun",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/yards/:yardId/elements",
        description: "Add an element to a yard",
        bodySchema: {
          shapeType: "string (required): rectangle|circle|keyhole|spiral|hugelkultur|mandala|container|path|structure|water",
          x: "number (required)",
          y: "number (required)",
          width: "number (required)",
          height: "number (required)",
          label: "string | null",
          sunExposure: "string: full_sun|partial_sun|partial_shade|full_shade",
          rotation: "number (degrees)",
          seasonExtension: "string: none|cold_frame|row_cover|hoop_house|greenhouse",
          irrigationType: "string: none|drip|sprinkler|soaker_hose|hand",
          mulched: "0 | 1",
        },
        responseExample: { success: true },
      },
      {
        method: "PUT",
        path: "/api/elements/:id",
        description: "Update an element (partial update)",
        bodySchema: {
          x: "number",
          y: "number",
          width: "number",
          height: "number",
          label: "string | null",
          sunExposure: "string",
          shapeType: "string",
          rotation: "number",
          seasonExtension: "string",
          irrigationType: "string",
          mulched: "0 | 1",
        },
        responseExample: { id: 1, shapeType: "rectangle", x: 10, y: 10 },
      },
      {
        method: "DELETE",
        path: "/api/elements/:id",
        description: "Delete an element (cascades to plantings)",
        responseExample: { success: true },
      },
      {
        method: "POST",
        path: "/api/elements/:id/duplicate",
        description: "Duplicate an element offset by +1,+1",
        queryParams: [{ name: "yardId", description: "Yard ID for the copy", required: true }],
        responseExample: { id: 5 },
      },
    ],
  },
  {
    name: "Plants",
    description: "Plant library (read-only, seeded from plants.json)",
    endpoints: [
      {
        method: "GET",
        path: "/api/plants",
        description: "List all plants",
        responseExample: [
          {
            id: 1,
            name: "Tomato",
            category: "vegetable",
            family: "Solanaceae",
            daysToHarvest: 75,
          },
        ],
      },
      {
        method: "GET",
        path: "/api/plants/:id",
        description: "Get a single plant by ID",
        responseExample: {
          id: 1,
          name: "Tomato",
          category: "vegetable",
          waterNeeds: "high",
          gddToHarvest: 1300,
        },
      },
    ],
  },
  {
    name: "Plantings",
    description: "Plant instances placed in beds",
    endpoints: [
      {
        method: "GET",
        path: "/api/plantings",
        description: "List all plantings. Use ?detail=active for active plantings with joined data.",
        queryParams: [
          { name: "detail", description: "'active' for non-done plantings with plant/bed info" },
        ],
        responseExample: [
          {
            id: 1,
            plantId: 1,
            yardElementId: 1,
            status: "growing",
            quantity: 4,
            plantedDate: "2026-04-01",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/plantings",
        description: "Create a planting",
        bodySchema: {
          plantId: "number (required)",
          yardElementId: "number (required)",
          quantity: "number (default: 1)",
          status: "string (default: planned)",
          notes: "string | null",
          plantedDate: "string (YYYY-MM-DD) | null",
        },
        responseExample: { success: true },
      },
      {
        method: "PATCH",
        path: "/api/plantings/:id",
        description: "Update a planting (partial). Auto-sets plantedDate when status becomes seeded/transplanted.",
        bodySchema: {
          status: "string: planned|seeded|sprouted|transplanted|growing|harvesting|done",
          quantity: "number",
          notes: "string | null",
          plantedDate: "string | null",
        },
        responseExample: { id: 1, status: "growing", plantedDate: "2026-04-01" },
      },
      {
        method: "DELETE",
        path: "/api/plantings/:id",
        description: "Delete a planting",
        responseExample: { success: true },
      },
    ],
  },
  {
    name: "Log Entries",
    description: "Garden activity log",
    endpoints: [
      {
        method: "GET",
        path: "/api/log-entries",
        description: "List all log entries with plant and bed info",
        responseExample: [
          {
            id: 1,
            date: "2026-02-16",
            type: "watering",
            content: "Watered all beds",
            plantName: "Tomato",
            bedLabel: "Raised Bed A",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/log-entries",
        description: "Create a log entry",
        bodySchema: {
          type: "string (required): observation|watering|fertilizing|pest|disease|harvest|pruning|stage_change|weather",
          date: "string (YYYY-MM-DD, default: today)",
          content: "string | null",
          plantingId: "number | null",
          yardElementId: "number | null",
          yieldAmount: "number | null (for harvest type)",
          yieldUnit: "string | null (lbs|oz|count|bunches|cups)",
          stage: "string | null (for stage_change type)",
        },
        responseExample: { success: true },
      },
      {
        method: "DELETE",
        path: "/api/log-entries/:id",
        description: "Delete a log entry",
        responseExample: { success: true },
      },
    ],
  },
  {
    name: "Seed Inventory",
    description: "Seed packet tracking",
    endpoints: [
      {
        method: "GET",
        path: "/api/seed-inventory",
        description: "List all seeds with plant names",
        responseExample: [
          {
            id: 1,
            plantId: 1,
            plantName: "Tomato",
            variety: "Cherokee Purple",
            brand: "Baker Creek",
            quantityRemaining: 50,
            quantityUnit: "seeds",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/seed-inventory",
        description: "Add a seed packet",
        bodySchema: {
          plantId: "number | null",
          variety: "string | null",
          brand: "string | null",
          purchaseDate: "string (YYYY-MM-DD) | null",
          expirationDate: "string (YYYY-MM-DD) | null",
          quantityRemaining: "number | null",
          quantityUnit: "string: packets|grams|ounces|seeds",
        },
        responseExample: { success: true },
      },
      {
        method: "PUT",
        path: "/api/seed-inventory/:id",
        description: "Update a seed entry",
        bodySchema: {
          variety: "string | null",
          brand: "string | null",
          quantityRemaining: "number | null",
          notes: "string | null",
        },
        responseExample: { success: true },
      },
      {
        method: "DELETE",
        path: "/api/seed-inventory/:id",
        description: "Delete a seed entry",
        responseExample: { success: true },
      },
    ],
  },
  {
    name: "Tasks",
    description: "Garden tasks and to-dos",
    endpoints: [
      {
        method: "GET",
        path: "/api/tasks",
        description: "List all tasks with bed labels",
        responseExample: [
          {
            id: 1,
            title: "Start tomato seeds indoors",
            dueDate: "2026-03-01",
            completedAt: null,
            taskType: "indoor_start",
            bedLabel: "Raised Bed A",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/tasks",
        description: "Create a task",
        bodySchema: {
          title: "string (required)",
          description: "string | null",
          dueDate: "string (YYYY-MM-DD) | null",
          recurrence: "string: daily|weekly|biweekly|monthly | null",
          taskType: "string | null",
          plantingId: "number | null",
          yardElementId: "number | null",
        },
        responseExample: { success: true },
      },
      {
        method: "PUT",
        path: "/api/tasks/:id/complete",
        description: "Mark a task as completed",
        responseExample: { success: true },
      },
      {
        method: "PUT",
        path: "/api/tasks/:id/uncomplete",
        description: "Mark a task as not completed",
        responseExample: { success: true },
      },
      {
        method: "DELETE",
        path: "/api/tasks/:id",
        description: "Delete a task",
        responseExample: { success: true },
      },
    ],
  },
  {
    name: "Pests & Diseases",
    description: "IPM reference (read-only, seeded from pests.json)",
    endpoints: [
      {
        method: "GET",
        path: "/api/pests",
        description: "List all pests and diseases",
        responseExample: [
          {
            id: 1,
            name: "Aphids",
            type: "pest",
            description: "Small sap-sucking insects...",
          },
        ],
      },
      {
        method: "GET",
        path: "/api/pests/:id",
        description: "Get a single pest/disease by ID",
        responseExample: {
          id: 1,
          name: "Aphids",
          type: "pest",
          organicTreatments: ["Neem oil spray", "Insecticidal soap"],
          activeMonths: [3, 4, 5, 6, 7, 8, 9],
        },
      },
    ],
  },
  {
    name: "Soil Profiles",
    description: "Soil test results per bed",
    endpoints: [
      {
        method: "GET",
        path: "/api/soil-profiles",
        description: "List all soil profiles with bed labels",
        responseExample: [
          {
            id: 1,
            yardElementId: 1,
            bedLabel: "Raised Bed A",
            testDate: "2026-01-15",
            ph: 6.5,
            nitrogenLevel: "medium",
          },
        ],
      },
      {
        method: "POST",
        path: "/api/soil-profiles",
        description: "Add a soil test",
        bodySchema: {
          yardElementId: "number | null",
          testDate: "string (YYYY-MM-DD) | null",
          ph: "number (0-14) | null",
          nitrogenLevel: "string: low|medium|high | null",
          phosphorusLevel: "string: low|medium|high | null",
          potassiumLevel: "string: low|medium|high | null",
          organicMatterPct: "number (0-100) | null",
          soilType: "string: sandy|loam|clay|silt|peat|chalky | null",
          notes: "string | null",
        },
        responseExample: { success: true },
      },
      {
        method: "DELETE",
        path: "/api/soil-profiles/:id",
        description: "Delete a soil profile",
        responseExample: { success: true },
      },
    ],
  },
  {
    name: "Weather",
    description: "Weather forecast (proxies Open-Meteo API with caching)",
    endpoints: [
      {
        method: "GET",
        path: "/api/weather",
        description: "Get 7-day weather forecast. Falls back to settings lat/lon if no query params.",
        queryParams: [
          { name: "lat", description: "Latitude" },
          { name: "lon", description: "Longitude" },
        ],
        responseExample: {
          latitude: 34.09,
          longitude: -118.41,
          daily: { time: ["2026-02-16"], temperature_2m_max: [72], temperature_2m_min: [55] },
        },
      },
    ],
  },
  {
    name: "Sync",
    description: "Bi-directional sync protocol for iOS companion app",
    endpoints: [
      {
        method: "GET",
        path: "/api/sync",
        description: "Get all data updated since a timestamp (incremental sync). Omit ?since for full sync.",
        queryParams: [
          { name: "since", description: "ISO timestamp — only return rows updated after this time" },
        ],
        responseExample: {
          syncedAt: "2026-02-16T12:00:00.000Z",
          settings: [],
          yards: [],
          yardElements: [],
          plantings: [],
          logEntries: [],
          seedInventory: [],
          tasks: [],
          soilProfiles: [],
        },
      },
      {
        method: "POST",
        path: "/api/sync",
        description:
          "Push changes from client. Last-write-wins conflict resolution. Send same shape as GET response.",
        bodySchema: {
          settings: "Array of settings objects",
          yards: "Array of yard objects",
          yardElements: "Array of element objects",
          plantings: "Array of planting objects",
          logEntries: "Array of log entry objects",
          seedInventory: "Array of seed objects",
          tasks: "Array of task objects",
          soilProfiles: "Array of soil profile objects",
        },
        responseExample: { success: true, applied: 3, syncedAt: "2026-02-16T12:00:00.000Z" },
      },
    ],
  },
  {
    name: "Beds",
    description: "Convenience endpoint for bed dropdowns",
    endpoints: [
      {
        method: "GET",
        path: "/api/beds",
        description: "List all yard elements as {id, label} for dropdowns",
        responseExample: [{ id: 1, label: "Raised Bed A" }],
      },
    ],
  },
];
