import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Photo } from "@/components/ui/photo";
import { Reveal } from "@/components/ui/reveal";
import { cookies } from "next/headers";
import { moodboard } from "@/lib/portal-data";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getClientAssignment } from "@/lib/store";

export const metadata: Metadata = { title: "Mood Board" };

export default async function MoodboardPage() {
  const session = await verifySessionToken(
    (await cookies()).get(SESSION_COOKIE)?.value,
  );

  let eventType = "event";
  if (session?.role === "client" && session.email) {
    const assignment = await getClientAssignment(session.email);
    if (assignment) eventType = assignment.eventType.toLowerCase();
  }

  return (
    <div className="space-y-7">
      <Card>
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-dark">
              <Sparkles className="size-[18px]" />
            </span>
            <div>
              <h2 className="font-serif text-xl font-medium text-ink">
                Your approved concept
              </h2>
              <p className="mt-0.5 text-sm text-ink-soft">
                The visual direction we&rsquo;re bringing to life for your {eventType}.
              </p>
            </div>
          </div>
          <Badge variant="gold" dot>
            {moodboard.length} visuals
          </Badge>
        </CardContent>
      </Card>

      {/* Masonry-style columns */}
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
        {moodboard.map((item, i) => (
          <Reveal key={item.seed} delay={(i % 3) * 60} className="break-inside-avoid">
            <Card hover className="overflow-hidden">
              <Photo
                seed={item.seed}
                aspect={i % 3 === 1 ? "3/4" : i % 2 === 0 ? "4/3" : "square"}
                rounded="rounded-none"
                label={item.label}
              />
              {item.note && (
                <CardContent className="px-4 py-3">
                  <p className="text-sm text-ink-soft">{item.note}</p>
                </CardContent>
              )}
            </Card>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
