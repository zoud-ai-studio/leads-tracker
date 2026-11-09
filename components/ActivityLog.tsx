'use client';

import { useState } from 'react';
import type { Activity } from '@/lib/types';

export function ActivityLog({ activities, onAdd }: { activities: Activity[]; onAdd: (body: string) => void }) {
  const [body, setBody] = useState('');
  const sorted = [...activities].sort((left, right) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id));
  return <section className="activity-log"><h2>Activity log</h2><form onSubmit={(event) => { event.preventDefault(); if (body.trim()) { onAdd(body); setBody(''); } }}><label htmlFor="activity-note">Add a note</label><textarea id="activity-note" value={body} onChange={(event) => setBody(event.target.value)} /><button type="submit">Add note</button></form>{sorted.length ? <ol>{sorted.map((activity) => <li key={activity.id}><time dateTime={activity.occurredOn}>{activity.occurredOn}</time><p>{activity.body}</p></li>)}</ol> : <p>No activity yet.</p>}</section>;
}
