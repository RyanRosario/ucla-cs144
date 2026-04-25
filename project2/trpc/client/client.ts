// USE THIS CLIENT TO TEST YOUR TRPC ENDPOINT

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRoute } from '../index.ts';

async function main() {
  const client = createTRPCProxyClient<AppRoute>({
    links: [
      httpBatchLink({
        url: 'http://localhost:1919/trpc',
      }),
    ],
  });


  // Example of calling getByName
  const lift = await client.lift.getByName.query({ name: 'Broadway Express 1' });
  const trail = await client.trail.getByName.query({ name: 'Wazoo' });
  const allLifts = await client.lift.getLatest.query();
  const allTrails = await client.trail.getLatest.query();
  console.log('Lift by Name:', lift);
  console.log('Trail by Name:', trail);
  console.log('Lifts by Name:', allLifts);
  console.log('Trails by Name:', allTrails);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
