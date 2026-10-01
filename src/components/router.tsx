'use client';
import { usePathname } from 'next/navigation';
import { LivePage,DisplayPage } from './live';
import { PlayersPage,PlayerProfile,TeamsPage,ResultsPage,RulesPage,SchedulePage } from './directory';
import { Protected,LoginPage,TeamDashboard,BiddingPage,SquadPage,ShortlistPage,TeamHistory,ProfilePage } from './team';
import { AdminDashboard,ControlRoom,PlayerManagement,TeamManagement,QueueManagement,UserManagement,AuditPage,SettingsPage,AnalyticsPage,AdminDeletionPanel } from './admin';
import { BulkDeletePanel } from './bulk-delete';
import { Empty } from './ui';
import Link from 'next/link';
export function AppRouter(){const path=usePathname();if(path==='/')return <LivePage home/>;if(path==='/auction/live')return <LivePage/>;if(path==='/auction/display')return <DisplayPage/>;if(path==='/players')return <PlayersPage/>;if(path.startsWith('/players/'))return <PlayerProfile id={path.split('/')[2]}/>;if(path==='/teams')return <TeamsPage/>;if(path.startsWith('/teams/'))return <TeamsPage id={path.split('/')[2]}/>;if(path==='/auction/results')return <ResultsPage/>;if(path==='/schedule')return <SchedulePage/>;if(path==='/rules')return <RulesPage/>;if(path==='/team/login')return <LoginPage/>;if(path==='/admin/login')return <LoginPage admin/>;
const team:Record<string,React.ReactNode>={'/team/dashboard':<TeamDashboard/>,'/team/bidding':<BiddingPage/>,'/team/squad':<SquadPage/>,'/team/shortlist':<ShortlistPage/>,'/team/history':<TeamHistory/>,'/team/profile':<ProfilePage/>};if(team[path])return <Protected>{team[path]}</Protected>;
const admin:Record<string,React.ReactNode>={'/admin/dashboard':<AdminDashboard/>,'/admin/auction':<ControlRoom/>,'/admin/players':<><PlayerManagement/><BulkDeletePanel kind="players"/></>,'/admin/teams':<><TeamManagement/><BulkDeletePanel kind="teams"/></>,'/admin/users':<UserManagement/>,'/admin/queue':<QueueManagement/>,'/admin/sets':<QueueManagement sets/>,'/admin/results':<ResultsPage/>,'/admin/analytics':<AnalyticsPage/>,'/admin/audit':<AuditPage/>,'/admin/settings':<SettingsPage/>};if(admin[path])return <Protected admin superOnly={['/admin/users','/admin/settings'].includes(path)}>{admin[path]}</Protected>;
return <Empty title="This part of the arena doesn’t exist"><Link href="/">Back to the auction</Link></Empty>;}
