import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SRC_DIR = path.resolve(__dirname, '../../..');

describe('Data Freshness - Supabase Cache Bypass', () => {
  it('supabase admin client uses cache: no-store', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/lib/supabase/admin.ts'),
      'utf-8'
    );
    expect(content).toContain("cache: 'no-store'");
  });

  it('admin client wraps global fetch with no-store', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/lib/supabase/admin.ts'),
      'utf-8'
    );
    // Should have a custom fetch wrapper in the Supabase client config
    expect(content).toContain('global:');
    expect(content).toContain('fetch:');
  });
});

describe('Data Freshness - No-Cache Headers', () => {
  it('middleware adds no-cache headers to all responses', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/middleware.ts'),
      'utf-8'
    );
    expect(content).toContain('Cache-Control');
    expect(content).toContain('no-store');
    expect(content).toContain('no-cache');
    expect(content).toContain('must-revalidate');
  });

  it('noCacheHeaders function exists in middleware', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/middleware.ts'),
      'utf-8'
    );
    expect(content).toContain('noCacheHeaders');
  });

  it('all middleware paths get no-cache headers', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/middleware.ts'),
      'utf-8'
    );
    // Every return path should call noCacheHeaders
    const returnStatements = content.match(/return\s+noCacheHeaders/g);
    expect(returnStatements).not.toBeNull();
    expect(returnStatements!.length).toBeGreaterThanOrEqual(3); // public, protected, error
  });
});

describe('Data Freshness - User List (Login Page)', () => {
  it('login page fetches users with cache: no-store', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/app/page.tsx'),
      'utf-8'
    );
    expect(content).toContain("cache: 'no-store'");
  });

  it('login page busts cache with timestamp parameter', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/app/page.tsx'),
      'utf-8'
    );
    // Uses _t= parameter to bust browser cache
    expect(content).toContain('_t=');
  });
});

describe('Data Freshness - Weather Caching', () => {
  it('weather data has revalidation configured', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/lib/weather.ts'),
      'utf-8'
    );
    expect(content).toContain('revalidate');
  });

  it('current weather uses no-store for fresh data', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/lib/weather.ts'),
      'utf-8'
    );
    expect(content).toContain("cache: 'no-store'");
  });

  it('archive weather revalidates daily (86400s)', () => {
    const content = fs.readFileSync(
      path.join(SRC_DIR, 'src/lib/weather.ts'),
      'utf-8'
    );
    expect(content).toContain('revalidate: 86400');
  });
});
