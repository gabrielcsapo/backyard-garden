"use client";

import React from "react";

type ApiEndpoint = {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  description: string;
  queryParams?: { name: string; description: string; required?: boolean }[];
  bodySchema?: Record<string, string>;
  responseExample: unknown;
};

type ApiGroup = {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
};

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  POST: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  PUT: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PATCH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  DELETE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function ApiDocs({ groups }: { groups: ApiGroup[] }) {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Quick nav */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm p-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Resources</p>
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.name}
              href={`#${g.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-earth-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-garden-50 hover:text-garden-700 dark:hover:bg-garden-900/30 dark:hover:text-garden-400 transition no-underline"
            >
              {g.name}
            </a>
          ))}
        </div>
      </div>

      {/* Groups */}
      {groups.map((group) => (
        <div
          key={group.name}
          id={group.name.toLowerCase().replace(/\s+/g, "-")}
          className="bg-white dark:bg-gray-800 rounded-xl border border-earth-200 dark:border-gray-700 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-earth-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{group.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{group.description}</p>
          </div>

          <div className="divide-y divide-earth-100 dark:divide-gray-700">
            {group.endpoints.map((ep) => {
              const key = `${ep.method}-${ep.path}`;
              const isExpanded = expanded === key;

              return (
                <div key={key}>
                  <button
                    type="button"
                    className="w-full px-5 py-3 flex items-center gap-3 hover:bg-earth-50/50 dark:hover:bg-gray-700/50 transition cursor-pointer text-left"
                    onClick={() => setExpanded(isExpanded ? null : key)}
                  >
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${METHOD_COLORS[ep.method]}`}>
                      {ep.method}
                    </span>
                    <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{ep.path}</code>
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto truncate max-w-[200px]">
                      {ep.description}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-5 py-4 bg-earth-50/30 dark:bg-gray-700/30 space-y-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{ep.description}</p>

                      {/* Query params */}
                      {ep.queryParams && ep.queryParams.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Query Parameters</p>
                          <div className="space-y-1">
                            {ep.queryParams.map((qp) => (
                              <div key={qp.name} className="flex items-center gap-2 text-xs">
                                <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-gray-700 dark:text-gray-300">
                                  {qp.name}
                                </code>
                                {qp.required && (
                                  <span className="text-red-500 text-[10px] font-medium">required</span>
                                )}
                                <span className="text-gray-500 dark:text-gray-400">{qp.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Request body */}
                      {ep.bodySchema && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Request Body (JSON)</p>
                          <pre className="text-xs font-mono bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
                            {JSON.stringify(ep.bodySchema, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Response example */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">Response Example</p>
                        <pre className="text-xs font-mono bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
                          {JSON.stringify(ep.responseExample, null, 2)}
                        </pre>
                      </div>

                      {/* Curl example */}
                      <div>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">curl Example</p>
                        <pre className="text-xs font-mono bg-gray-900 text-gray-100 rounded-lg p-3 overflow-x-auto">
                          {curlExample(ep)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function curlExample(ep: ApiEndpoint): string {
  const url = `http://localhost:3001${ep.path.replace(/:(\w+)/g, "1")}`;
  const parts = [`curl -s`];

  if (ep.method !== "GET") {
    parts.push(`-X ${ep.method}`);
  }

  if (ep.bodySchema) {
    const sample: Record<string, unknown> = {};
    for (const [key, desc] of Object.entries(ep.bodySchema)) {
      if (desc.includes("required") || Object.keys(ep.bodySchema).length <= 3) {
        if (desc.includes("number")) sample[key] = 1;
        else if (desc.includes("Array")) sample[key] = [];
        else sample[key] = "example";
      }
    }
    parts.push(`-H "Content-Type: application/json"`);
    parts.push(`-d '${JSON.stringify(sample)}'`);
  }

  parts.push(url);
  return parts.join(" \\\n  ");
}
