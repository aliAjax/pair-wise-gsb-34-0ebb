export interface TimelineItem {
  id: number | string;
  title: string;
  sub?: string;
  time?: string;
}

export function TimelineList({ items, empty = "暂无动态" }: { items: TimelineItem[]; empty?: string }) {
  if (items.length === 0) {
    return <div className="empty">{empty}</div>;
  }
  return (
    <ul className="timeline">
      {items.map((item) => (
        <li key={item.id}>
          <i />
          <div>
            <strong>{item.title}</strong>
            {item.sub ? <span>{item.sub}</span> : null}
          </div>
          {item.time ? <time>{item.time}</time> : null}
        </li>
      ))}
    </ul>
  );
}
