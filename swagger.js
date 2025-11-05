// swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// ชี้ base URL อัตโนมัติ (ปรับได้ผ่าน .env)
const SERVER_URL =
  process.env.SWAGGER_SERVER_URL || "http://localhost:5000"; // เช่น https://booked-golf-1.onrender.com

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "The Eden Golf Club API",
      version: "1.0.0",
      description: "API เอกสารสำหรับระบบจองกอล์ฟ + จัดการแคดดี้/สินทรัพย์/หลุม",
    },
    servers: [
      { url: `${SERVER_URL}/api`, description: "Current server" },
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
    security: [{ bearerAuth: [] }],
  },
  // ✅ โหลดทั้งไฟล์ route และไฟล์เอกสารที่เราแยกไว้
  apis: ["./routes/**/*.js", "./docs/**/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
  // JSON spec (ช่วยเวลา debug หรือใช้กับเครื่องมืออื่น)
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // UI พร้อม explorer และจำ token ไว้เวลารีเฟรช
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      swaggerOptions: { persistAuthorization: true },
    })
  );
};
