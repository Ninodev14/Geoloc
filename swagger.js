const path = require("path");
const fs = require("fs");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const serverUrl =
  process.env.NODE_ENV === "production"
    ? "https://galio-a9c7f612fd32.herokuapp.com"
    : "http://localhost:5000";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API REST Documentation",
      version: "1.0.0",
      description: "Documentation de l'API REST avec Swagger",
    },
    servers: [{ url: serverUrl }],
  },
  apis: ["server.js"],
};

const specs = swaggerJsdoc(options);

const swaggerSetup = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
};

const saveDocs = () => {
  const docDir = path.join(__dirname, "/doc");
  if (!fs.existsSync(docDir)) {
    fs.mkdirSync(docDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(docDir, "swagger.json"),
    JSON.stringify(specs, null, 2)
  );

  const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Documentation</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css">
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.min.js"></script>
    <script>
        window.onload = () => {
            const ui = SwaggerUIBundle({
                url: "swagger.json",
                dom_id: "#swagger-ui"
            });
        };
    </script>
</body>
</html>`;

  fs.writeFileSync(path.join(docDir, "swagger.html"), htmlContent);
};

saveDocs();

module.exports = swaggerSetup;
