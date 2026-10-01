import type { Metadata } from 'next';
import { AuctionProvider } from '@/lib/client';
import { Shell } from '@/components/shell';
import './globals.css';
export const metadata:Metadata={title:'Pavilion — The Cricket Auction Arena',description:'Every bid begins a legacy. Live cricket player auctions, team bidding, and auction management.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AuctionProvider><Shell>{children}</Shell></AuctionProvider></body></html>;}
