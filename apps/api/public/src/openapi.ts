export const openApiDocument = {
  openapi: "3.0.0",
  info: {
    title: "BanexReintegra Public API",
    version: "0.0.1",
    description:
      "Authenticated read API for BanexReintegra batches, accounts, transactions, results, and disbursements.",
  },
  servers: [{ url: "/", description: "Current public API origin" }],
  tags: [
    { name: "health", description: "Service status checks." },
    { name: "auth", description: "Authenticated session inspection." },
    { name: "batches", description: "Cashback batch read endpoints." },
    { name: "accounts", description: "Account and account-month read endpoints." },
    { name: "legacy", description: "Compatibility read endpoints." },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "not_found" },
              message: { type: "string", example: "route not found" },
            },
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          limit: { type: "integer", example: 50 },
          offset: { type: "integer", example: 0 },
        },
      },
      ServiceStatus: {
        type: "object",
        properties: {
          service: { type: "string", example: "banexcoin-public-api" },
          status: { type: "string", example: "ok" },
          role: { type: "string", example: "read-gateway" },
          version: { type: "string", example: "v1" },
        },
      },
      Account: {
        type: "object",
        properties: {
          accountNumber: { type: "integer", example: 10001 },
          alias: { type: "string", example: "banex_user_001" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Batch: {
        type: "object",
        properties: {
          id: { type: "string", example: "665f0f4547902fffe49c7092" },
          period: {
            type: "object",
            properties: {
              year: { type: "integer", example: 2026 },
              month: { type: "integer", example: 5 },
              label: { type: "string", example: "2026-05" },
            },
          },
          status: { type: "string", example: "approved" },
          totals: { type: "object" },
          validation: { type: "object" },
          payoutOracle: { type: "object" },
          approval: { type: "object" },
          export: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      Transaction: {
        type: "object",
        properties: {
          id: { type: "string" },
          transactionId: { type: "string", example: "trx-2026-0001" },
          accountNumber: { type: "integer", example: 10001 },
          alias: { type: "string", example: "banex_user_001" },
          createdAt: { type: "string", format: "date-time" },
          amounts: { type: "object" },
          validation: { type: "object" },
          anomaly: { type: "object" },
        },
      },
      MonthlyResult: {
        type: "object",
        properties: {
          id: { type: "string" },
          accountNumber: { type: "integer", example: 10001 },
          alias: { type: "string", example: "banex_user_001" },
          period: { type: "object" },
          totals: { type: "object" },
          tier: { type: "object" },
          cashback: { type: "object" },
          reviewState: { type: "string", example: "ready" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Disbursement: {
        type: "object",
        properties: {
          id: { type: "string" },
          accountNumber: { type: "integer", example: 10001 },
          alias: { type: "string", example: "banex_user_001" },
          tier: { type: "string", example: "gold" },
          cashbackUsdt: { type: "number", example: 4 },
          status: { type: "string", example: "pending" },
          exportReference: { type: "string", nullable: true },
          generatedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AccountMonth: {
        type: "object",
        properties: {
          id: { type: "string" },
          accountNumber: { type: "integer", example: 10001 },
          alias: { type: "string", example: "banex_user_001" },
          period: { type: "object" },
          qrCount: { type: "integer", example: 4 },
          consumedBs: { type: "number", example: 1392 },
          consumedUsdt: { type: "number", example: 200 },
          tier: { type: "string", example: "gold" },
          cashbackUsdt: { type: "number", example: 4 },
          reviewState: { type: "string", example: "ready" },
        },
      },
    },
  },
  paths: {
    "/": {
      get: {
        tags: ["health"],
        summary: "Get public API status",
        responses: {
          "200": {
            description: "Public API service status.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServiceStatus" },
              },
            },
          },
        },
      },
    },
    "/health": {
      get: {
        tags: ["health"],
        summary: "Get health status",
        responses: {
          "200": {
            description: "Public API health status.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ServiceStatus" },
              },
            },
          },
        },
      },
    },
    "/auth/session": {
      get: {
        tags: ["auth"],
        summary: "Get authenticated session",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Current Clerk session details." },
          "401": { description: "Missing or invalid bearer token." },
        },
      },
    },
    "/v1/batches": {
      get: {
        tags: ["batches"],
        summary: "List cashback batches",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": {
            description: "Paginated cashback batches.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: { type: "array", items: { $ref: "#/components/schemas/Batch" } },
                    pagination: { $ref: "#/components/schemas/Pagination" },
                  },
                },
              },
            },
          },
          "401": { description: "Missing or invalid bearer token." },
        },
      },
    },
    "/v1/batches/{id}": {
      get: {
        tags: ["batches"],
        summary: "Get a cashback batch",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Batch details." },
          "404": { description: "Batch not found." },
        },
      },
    },
    "/v1/batches/{id}/transactions": {
      get: {
        tags: ["batches"],
        summary: "List transactions for a batch",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": { description: "Batch transactions." },
          "404": { description: "Batch not found." },
        },
      },
    },
    "/v1/batches/{id}/results": {
      get: {
        tags: ["batches"],
        summary: "List monthly results for a batch",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Batch monthly results." },
          "404": { description: "Batch not found." },
        },
      },
    },
    "/v1/batches/{id}/disbursements": {
      get: {
        tags: ["batches"],
        summary: "List disbursements for a batch",
        security: [{ bearerAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Batch disbursements." },
          "404": { description: "Batch not found." },
        },
      },
    },
    "/v1/accounts/{account_number}": {
      get: {
        tags: ["accounts"],
        summary: "Get account details",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "account_number",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": { description: "Account details." },
          "404": { description: "Account not found." },
        },
      },
    },
    "/v1/accounts/{account_number}/months": {
      get: {
        tags: ["accounts"],
        summary: "List account monthly cashback results",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "account_number",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          "200": {
            description: "Account monthly results.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/AccountMonth" },
                    },
                  },
                },
              },
            },
          },
          "404": { description: "Account not found." },
        },
      },
    },
    "/users": {
      get: {
        tags: ["legacy"],
        summary: "List users (legacy)",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": { description: "Legacy users list." },
          "401": { description: "Missing or invalid bearer token." },
        },
      },
    },
    "/users/{account_number}": {
      get: {
        tags: ["legacy"],
        summary: "Get user by account number (legacy)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "account_number", in: "path", required: true, schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Account details." },
          "401": { description: "Missing or invalid bearer token." },
          "404": { description: "Account not found." },
        },
      },
    },
    "/transactions": {
      get: {
        tags: ["legacy"],
        summary: "List transactions (legacy)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "account_number", in: "query", schema: { type: "integer" } },
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": { description: "Legacy transactions list." },
          "401": { description: "Missing or invalid bearer token." },
        },
      },
    },
    "/monthly-aggregations": {
      get: {
        tags: ["legacy"],
        summary: "List monthly aggregations (legacy)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "account_number", in: "query", schema: { type: "integer" } },
        ],
        responses: {
          "200": { description: "Legacy monthly aggregations." },
          "401": { description: "Missing or invalid bearer token." },
        },
      },
    },
    "/cashback-runs": {
      get: {
        tags: ["legacy"],
        summary: "List cashback runs (legacy)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", default: 50 } },
          { name: "offset", in: "query", schema: { type: "integer", default: 0 } },
        ],
        responses: {
          "200": { description: "Legacy cashback runs." },
          "401": { description: "Missing or invalid bearer token." },
        },
      },
    },
    "/cashback-runs/{id}/disbursements": {
      get: {
        tags: ["legacy"],
        summary: "List disbursements for a cashback run (legacy)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "Legacy run disbursements." },
          "401": { description: "Missing or invalid bearer token." },
          "404": { description: "Run not found." },
        },
      },
    },
  },
} as const
