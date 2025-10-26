import type { OrmApi } from './orm';
import { ORM } from './orm';
import { migrations } from './migrations';

let ormPromise: Promise<OrmApi> | null = null;

type Platform = 'electron' | 'capacitor' | 'web';

function detectPlatform(): Platform {
  if (typeof window !== 'undefined' && (window as unknown as { electronAPI?: unknown }).electronAPI) {
    return 'electron';
  }

  if (typeof window !== 'undefined' && (window as unknown as { Capacitor?: unknown })) {
    return 'capacitor';
  }

  return 'web';
}

async function createOrm(): Promise<OrmApi> {
  const platform = detectPlatform();

  if (platform === 'electron') {
    const { createRendererBridge } = await import('../electron/bridge');
    return createRendererBridge();
  }

  if (platform === 'capacitor') {
    try {
      const { createCapacitorAdapter } = await import('./adapters/capacitor');
      const adapter = await createCapacitorAdapter();
      const orm = new ORM(adapter, migrations);
      await orm.init();
      await orm.seedDefaults();
      return orm;
    } catch (error) {
      console.warn('Falling back to web adapter because Capacitor SQLite is unavailable', error);
    }
  }

  const { createWebAdapter } = await import('./adapters/web');
  const adapter = createWebAdapter();
  const orm = new ORM(adapter, migrations);
  await orm.init();
  await orm.seedDefaults();
  return orm;
}

export function getORM(): Promise<OrmApi> {
  if (!ormPromise) {
    ormPromise = createOrm();
  }
  return ormPromise;
}
