import { Page, PageHeader } from '@/components/common/Page';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: IconName;
  planned: string[];
  targetVersion?: string;
}

/**
 * Generic "prepared but not built" module page. Every future module routes
 * here so navigation is complete and the roadmap is visible in-product.
 */
export function PlaceholderPage({ title, description, icon, planned, targetVersion }: PlaceholderPageProps) {
  return (
    <Page>
      <PageHeader title={title} subtitle={description} icon={<Icon name={icon} size={20} />} />

      <Card className="p-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/25 bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary">
            <Icon name="clock" size={12} />
            In Vorbereitung{targetVersion ? ` · ${targetVersion}` : ''}
          </span>
        </div>

        <p className="mt-4 max-w-lg text-sm text-content-muted">
          Dieses Modul ist architektonisch bereits vorbereitet (Typen, Routen und Platzhalter existieren), wird aber
          erst in einer späteren Version ausgebaut. So bleibt das Fundament sauber und erweiterbar.
        </p>

        <div className="mt-5">
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-content-faint">Geplant</p>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {planned.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-content-muted"
              >
                <Icon name="arrowRight" size={14} className="text-primary" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </Page>
  );
}
