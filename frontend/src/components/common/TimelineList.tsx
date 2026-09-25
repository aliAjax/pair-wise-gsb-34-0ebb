import { formatDateTime } from "../../utils/formatters";

export interface TimelineItem {
  id: string | number;
  time: string | null;
  title: string;
  desc?: string;
}

export function TimelineList({ items }: { items: TimelineItem[] }) {
  if (!items.length) {
    return <div className="empty">暂无记录</div>;
  }
  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.id}>
          <span className="timeline-dot" />
          <div>
            <strong>{item.title}</strong>
            {item.desc && <p>{item.desc}</p>}
            <time>{formatDateTime(item.time)}</time>
          </div>
        </li>
      ))}
    </ul>
  );
}
