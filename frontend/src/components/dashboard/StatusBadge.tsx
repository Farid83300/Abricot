import { STATUS_LABELS, STATUS_STYLES } from "@/lib/utils";
import type { TaskStatus } from "@/types/api";

interface Props {
  status: TaskStatus;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
