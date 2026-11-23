import type { ReactNode } from 'react';

export type BadgeTone = 'blue' | 'green' | 'amber' | 'gray';

export function Badge({ tone = 'blue', children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}
