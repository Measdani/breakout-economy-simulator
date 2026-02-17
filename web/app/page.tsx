import Simulator from '@/components/Simulator';
import { getActiveConfig } from '@/app/actions/config';

export const dynamic = 'force-dynamic'

export default async function Home() {
  let initialConfig = undefined;

  try {
    initialConfig = await getActiveConfig();
  } catch (err) {
    console.error('Failed to fetch global config:', err);
    // Fall back to default config in Simulator if fetch fails
  }

  return <Simulator initialConfig={initialConfig} />;
}
