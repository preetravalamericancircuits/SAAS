import * as Sentry from "@sentry/nextjs";

export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    beforeSend(event) {
      // Filter sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      if (event.request?.headers?.authorization) {
        event.request.headers.authorization = '[Filtered]';
      }
      return event;
    },
  });
}