import { Suspense } from 'react';
import { AppRouter } from '@/components/router';
export default function Page(){return <Suspense fallback={<div className="loading-state">Opening the arena…</div>}><AppRouter/></Suspense>;}
