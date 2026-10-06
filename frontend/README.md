# Frontend

React + Vite + Bootstrap single-page application for the Tours and Travels Management project. For setup, API configuration, full-stack local development, Postman, and Docker deployment instructions, see the [project README](../README.md).

## Development

```powershell
npm ci
npm run dev
npm run lint
npm run build
```

Set `VITE_API_BASE_URL` to the backend origin when it is not `http://localhost:8080`. Vite embeds this value during build; set it before building a production image.
