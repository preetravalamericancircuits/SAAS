# SAAS Application

This repository contains the source code for the SAAS Application, including a FastAPI backend and a Next.js frontend.

## 🚀 Getting Started

For detailed setup instructions, troubleshooting, and default user credentials, please refer to the **[Startup Guide](./docs/STARTUP_GUIDE.md)**.

### Quick Start

1.  **Start Backend**
    ```bash
    cd backend
    # Follow instructions in the Startup Guide to run
    ```

2.  **Start Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## Project Structure

-   `/backend`: FastAPI application, API endpoints, and database logic.
-   `/frontend`: Next.js/React user interface.
-   `/config`: Configuration for services like Grafana.
-   `/docs`: Project documentation, including setup guides and historical changelogs.

## 🧪 Testing

To run backend tests:

```bash
cd backend
pytest
```