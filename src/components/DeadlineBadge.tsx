interface DeadlineBadgeProps {
  daysRemaining: number;
  deadline: Date;
}

export function DeadlineBadge({ daysRemaining, deadline }: DeadlineBadgeProps) {
  const formattedDate = deadline.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (daysRemaining < 0) {
    return (
      <div className="inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium bg-red-50 border-red-200 text-red-700">
        <span>Frist abgelaufen — {formattedDate}</span>
      </div>
    );
  }

  const color = daysRemaining <= 5
    ? "bg-red-50 border-red-200 text-red-700"
    : daysRemaining <= 10
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  return (
    <div className={`inline-flex items-center gap-2 border rounded-lg px-4 py-2 text-sm font-medium ${color}`}>
      <span className="text-lg font-bold">{daysRemaining}</span>
      <span>
        {daysRemaining === 1 ? "Tag verbleibend" : "Tage verbleibend"} —
        Frist: {formattedDate}
      </span>
    </div>
  );
}