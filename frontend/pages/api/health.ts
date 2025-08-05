import type { NextApiRequest, NextApiResponse } from 'next';

type HealthResponse = {
  status: string;
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'saas-frontend',
      version: '1.0.0',
      uptime: process.uptime()
    });
  }

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'saas-frontend',
    version: '1.0.0',
    uptime: process.uptime()
  });
}