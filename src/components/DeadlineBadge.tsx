interface DeadlineBadgeProps {
  daysRemaining: number;
  deadline: Date;
}

export function DeadlineBadge({ daysRemaining, deadline }: DeadlineBadgeProps) {
  const isUrgent = daysRemaining <= 5;
  const isWarning = daysRemaining <= 10;

  const color = isUrgent
    ? "bg-red-50 border-red-200 text-red-700"
    : isWarning
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : "bg-blue-50 border-blue-200 text-blue-700";

  const formattedDate = deadline.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

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