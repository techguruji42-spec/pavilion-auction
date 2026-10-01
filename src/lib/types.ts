export type Role = 'SUPER_ADMIN' | 'AUCTION_ADMIN' | 'TEAM_OWNER' | 'TEAM_MANAGER' | 'VIEWER';
export type PlayerRole = 'Batsman' | 'Wicketkeeper' | 'All-rounder' | 'Fast bowler' | 'Spin bowler';
export interface Player { id:string; name:string; dob:string; age:number; country:string; state:string; city:string; role:PlayerRole; batting:string; bowling:string; basePrice:number; category:string; setId:string; order:number; previousTeam:string; previousPrice:number; photo:string; bio:string; matches:number; runs:number; average:number; strikeRate:number; highestScore:number; wickets:number; economy:number; bowlingAverage:number; status:'UPCOMING'|'BIDDING'|'SOLD'|'UNSOLD'|'ARCHIVED'; }
export interface Team { id:string; name:string; short:string; color:string; logo:string; owner:string; manager:string; email:string; phone:string; startingPurse:number; purse:number; minSquad:number; maxSquad:number; maxOverseas:number; enabled:boolean; }
export interface User {id:string; name:string; email:string; passwordHash:string; role:Role; teamId?:string; enabled:boolean;}
export type SafeUser = Omit<User,'passwordHash'>;
export interface Bid {id:string; auctionId:string; playerId:string; teamId:string; userId:string; amount:number; bidType:'ONLINE'|'ADMIN_MANUAL'; status:'ACCEPTED'|'SUPERSEDED'|'WINNING'|'VOID'; createdAt:number; requestId:string;}
export interface Result {id:string; playerId:string; teamId?:string; amount:number; basePrice:number; status:'SOLD'|'UNSOLD'|'REVERSED'; round:number; createdAt:number;}
export interface Audit {id:string; userId:string; action:string; entity:string; before:unknown; after:unknown; createdAt:number; ip:string;}
export interface Settings {name:string; season:number; date:string; venue:string; currency:string; startingPurse:number; minSquad:number; maxSquad:number; timerSeconds:number; timerEnabled:boolean; confirmation:boolean; publicVisible:boolean; maintenance:boolean; rules:string; categories:string[]; increments:{from:number; increment:number}[];}
export interface Shortlist {id:string; teamId:string; playerId:string; notes:string; target:number; maximum:number; priority:'HIGH'|'MEDIUM'|'LOW';}
export interface AuctionSet {id:string; name:string; order:number;}
export interface AuctionState {id:string; revision:number; status:'UPCOMING'|'LIVE'|'PAUSED'|'COMPLETED'; currentPlayerId:string|null; currentBid:number; highestBidderId:string|null; biddingOpen:boolean; timerEndsAt:number|null; timerRemaining:number|null; round:number; frozen:boolean; demo:boolean;}
export interface Session {id:string; tokenHash:string; userId:string; csrf:string; expiresAt:number;}
export interface Notification {id:string; teamId:string; message:string; createdAt:number;}
export interface State {auction:AuctionState; players:Player[]; teams:Team[]; users:User[]; bids:Bid[]; results:Result[]; audit:Audit[]; settings:Settings; sets:AuctionSet[]; queue:string[]; shortlists:Shortlist[]; sessions:Session[]; notifications:Notification[]; requests:{key:string; userId:string; fingerprint:string; bidId:string}[];}
export interface Snapshot {auction:AuctionState; players:Player[]; teams:Team[]; bids:Bid[]; results:Result[]; settings:Settings; sets:AuctionSet[]; queue:string[]; nextBid:number; serverTime:number; onlineTeams:string[];}
export const money = (value:number) => '₹' + value.toLocaleString('en-IN');
export const lakh = (value:number) => '₹' + (value/100000).toLocaleString('en-IN',{maximumFractionDigits:2}) + 'L';
