"use client";

import { StoredImage } from "@/components/shared/StoredImage";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  title: string;
  description?: string;
  subtitle?: string;
  originalUrl?: string;
  previewUrl?: string;
}

export function SuggestionPreviewCard({
  title,
  description,
  subtitle,
  originalUrl,
  previewUrl,
}: Props) {
  return (
    <Card className="hover:border-[var(--gold)]/30 transition-colors overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="font-semibold text-sm">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--gold)] mt-1.5">{subtitle}</p>
          )}
        </div>

        {previewUrl ? (
          <div className={originalUrl ? "grid grid-cols-2 gap-2" : ""}>
            {originalUrl && (
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                  Your photo
                </p>
                <StoredImage
                  src={originalUrl}
                  alt="Original"
                  width={200}
                  height={240}
                  className="w-full aspect-[4/5] object-cover rounded-lg bg-muted"
                />
              </div>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                Suggested look
              </p>
              <StoredImage
                src={previewUrl}
                alt={title}
                width={200}
                height={240}
                className="w-full aspect-[4/5] object-cover rounded-lg bg-muted ring-1 ring-[var(--gold)]/30"
              />
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            Visual preview could not be generated — text recommendation still applies.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
