const swaggerUi = require("swagger-ui-express");
const authMiddleware = require("./middleware/auth");
require("dotenv").config();

const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "FlyRank Auth API is running" });
});

// POST /auth/signup
app.post("/auth/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  return res.status(201).json(data.user);
});

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required",
    });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({
      error: "Invalid login credentials",
    });
  }

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
});

const PORT = process.env.PORT || 3000;
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "FlyRank Auth API",
    version: "1.0.0",
    description: "Authentication API using Express and Supabase",
  },
  servers: [
    {
      url: "http://localhost:3000",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/": {
      get: {
        summary: "API status",
        responses: {
          200: {
            description: "API is running",
          },
        },
      },
    },

    "/auth/signup": {
      post: {
        summary: "Create a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    example: "test@example.com",
                  },
                  password: {
                    type: "string",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User created",
          },
          400: {
            description: "Invalid request",
          },
        },
      },
    },

    "/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    example: "test@example.com",
                  },
                  password: {
                    type: "string",
                    example: "password123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
          },
          401: {
            description: "Invalid credentials",
          },
        },
      },
    },

    "/auth/logout": {
      post: {
        summary: "Logout",
        security: [{ bearerAuth: [] }],
        responses: {
          204: {
            description: "Logout successful",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/public/info": {
      get: {
        summary: "Public information",
        responses: {
          200: {
            description: "Public endpoint",
          },
        },
      },
    },

    "/protected/profile": {
      get: {
        summary: "Get authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Authenticated user profile",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },

    "/protected/test": {
      get: {
        summary: "Protected test endpoint",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Protected endpoint",
          },
          401: {
            description: "Unauthorized",
          },
        },
      },
    },
  },
};

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.get("/public/info", (req, res) => {
  res.status(200).json({
    message: "This is a public endpoint",
  });
});

// GET /protected/profile
app.get("/protected/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    id: req.user.id,
    email: req.user.email,
  });
});

app.get("/protected/test", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected test route works",
    user_id: req.user.id,
  });
});

app.post("/auth/logout", authMiddleware, async (req, res) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return res.status(400).json({
      error: error.message,
    });
  }

  return res.status(204).send();
});