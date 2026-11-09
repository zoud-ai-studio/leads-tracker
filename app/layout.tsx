import './styles.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Leads Tracker' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><header><Link href="/">Leads Tracker</Link><Link href="/leads/new">Add lead</Link></header><main>{children}</main></body></html>; }
