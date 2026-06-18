"use client";

import { CalendarDays, MapPin, Users, Mail, Phone, ShieldCheck, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { AssignTeamButton } from "@/components/internal/assign-team-button";
import { UploadDocumentButton } from "@/components/internal/upload-document-button";
import { formatDate } from "@/lib/utils";
import type { ClientAssignment } from "@/lib/store";

type TeamMemberSlim = { id: string; name: string; role: string };

function memberName(id: string, team: TeamMemberSlim[]) {
  return team.find((m) => m.id === id)?.name ?? id;
}

export function ClientCard({
  c,
  daysToEvent,
  teamMembers,
  documentCount = 0,
}: {
  c: ClientAssignment;
  daysToEvent: number;
  teamMembers: TeamMemberSlim[];
  documentCount?: number;
}) {
  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-line bg-paper shadow-soft">
      {/* Header strip */}
      <div className="flex items-center justify-between border-b border-line bg-ivory px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={c.name} size="md" className="shrink-0" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{c.name}</p>
            <p className="truncate text-xs text-ink-muted">{c.eventType}</p>
          </div>
        </div>
        <Badge variant="success">
          <ShieldCheck className="mr-1 size-3" />
          Portal active
        </Badge>
      </div>

      {/* Contact */}
      <div className="flex flex-col gap-1.5 border-b border-line px-5 py-3.5">
        <span className="flex items-center gap-2 text-xs text-ink-soft">
          <Mail className="size-3.5 shrink-0 text-ink-muted" />
          {c.email}
        </span>
        {c.phone && (
          <span className="flex items-center gap-2 text-xs text-ink-soft">
            <Phone className="size-3.5 shrink-0 text-ink-muted" />
            {c.phone}
          </span>
        )}
      </div>

      {/* Event info */}
      <div className="flex flex-col gap-2 px-5 py-4">
        <p className="font-serif text-base text-ink">{c.eventName}</p>
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 text-xs text-ink-soft">
            <MapPin className="size-3.5 shrink-0 text-gold" />
            {c.venue}, {c.location}
          </span>
          <span className="flex items-center gap-2 text-xs text-ink-soft">
            <CalendarDays className="size-3.5 shrink-0 text-gold" />
            {formatDate(c.eventDate)}
            <span className="font-medium text-gold-dark">· {daysToEvent} days to go</span>
          </span>
          {c.guestCount && (
            <span className="flex items-center gap-2 text-xs text-ink-soft">
              <Users className="size-3.5 shrink-0 text-ink-muted" />
              {c.guestCount} guests
              {c.budget && <span className="ml-1 font-medium text-ink">· {c.budget}</span>}
            </span>
          )}
        </div>
      </div>

      {/* Documents row */}
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <span className="flex items-center gap-1.5 text-xs text-ink-soft">
          <FileText className="size-3.5 text-ink-muted" />
          {documentCount === 0 ? "No documents yet" : `${documentCount} document${documentCount === 1 ? "" : "s"}`}
        </span>
        <UploadDocumentButton email={c.email} />
      </div>

      {/* Team assignment */}
      <div className="flex items-center justify-between border-t border-line px-5 py-3">
        <div className="flex items-center gap-1.5">
          {(c.assignedTeam ?? []).length > 0 ? (
            <div className="flex -space-x-1.5">
              {(c.assignedTeam ?? []).map((id) => (
                <Avatar
                  key={id}
                  name={memberName(id, teamMembers)}
                  size="sm"
                  className="ring-2 ring-paper"
                />
              ))}
            </div>
          ) : (
            <span className="text-xs text-ink-muted">No team assigned</span>
          )}
        </div>
        <AssignTeamButton
          email={c.email}
          currentTeamIds={c.assignedTeam ?? []}
          teamMembers={teamMembers}
        />
      </div>
    </div>
  );
}
