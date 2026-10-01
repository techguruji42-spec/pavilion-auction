import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { PrismaClient, Prisma } from '@prisma/client';
import type { State } from '../src/lib/types';
import { createSeed } from './seed';
const json=(v:unknown)=>JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
export interface Store {read():Promise<State>; transact<T>(fn:(s:State)=>T|Promise<T>):Promise<T>; close():Promise<void>;}
// Demo writes are serialized and atomically renamed. Never used in production.
export class MemoryStore implements Store {
 protected state:State; private tail:Promise<unknown>=Promise.resolve();
 constructor(state:State,private file?:string){this.state=state;}
 async read(){await this.tail;return structuredClone(this.state);}
 async transact<T>(fn:(s:State)=>T|Promise<T>):Promise<T>{const pending=this.tail.then(async()=>{const draft=structuredClone(this.state);const result=await fn(draft);if(this.file){await writeFile(`${this.file}.tmp`,JSON.stringify(draft));await rename(`${this.file}.tmp`,this.file);}this.state=draft;return structuredClone(result);});this.tail=pending.catch(()=>{});return pending;}
 async close(){}
}
async function project(tx:Prisma.TransactionClient,s:State,old?:State){
 const changed=<T extends {id:string}>(items:T[],before:T[]|undefined)=>items.filter(x=>JSON.stringify(x)!==JSON.stringify(before?.find(y=>y.id===x.id)));
 for(const t of changed(s.teams,old?.teams)){const data={name:t.name,purse:t.purse,startingPurse:t.startingPurse,enabled:t.enabled,data:json(t)};await tx.team.upsert({where:{id:t.id},create:{id:t.id,...data},update:data});}
 for(const u of changed(s.users,old?.users)){const {teamId,...data}=u;await tx.user.upsert({where:{id:u.id},create:data,update:data});await tx.teamMember.deleteMany({where:{userId:u.id}});if(teamId)await tx.teamMember.create({data:{id:u.id,userId:u.id,teamId}});}
 for(const p of changed(s.players,old?.players)){const data={name:p.name,status:p.status,basePrice:p.basePrice,data:json(p)};await tx.player.upsert({where:{id:p.id},create:{id:p.id,...data},update:data});}
 for(const set of changed(s.sets,old?.sets))await tx.auctionSet.upsert({where:{id:set.id},create:{...set,auctionId:s.auction.id},update:set});
 for(const b of changed(s.bids,old?.bids)){const data={...b,createdAt:new Date(b.createdAt)};await tx.bid.upsert({where:{id:b.id},create:data,update:data});}
 for(const r of changed(s.results,old?.results)){const {basePrice,...rest}=r;const data={...rest,teamId:r.teamId??null,createdAt:new Date(r.createdAt)};await tx.auctionResult.upsert({where:{id:r.id},create:data,update:data});if(r.teamId)await tx.purchase.upsert({where:{id:r.id},create:{id:r.id,playerId:r.playerId,teamId:r.teamId,amount:r.amount,active:r.status==='SOLD',createdAt:new Date(r.createdAt)},update:{active:r.status==='SOLD'}});}
 for(const a of s.audit.slice(old?.audit.length??0))await tx.auditLog.create({data:{...a,before:json(a.before),after:json(a.after),createdAt:new Date(a.createdAt)}});
 for(const n of s.notifications.slice(old?.notifications.length??0))await tx.notification.create({data:{...n,createdAt:new Date(n.createdAt)}});
 if(JSON.stringify(s.queue)!==JSON.stringify(old?.queue)){await tx.auctionQueue.deleteMany({where:{auctionId:s.auction.id}});if(s.queue.length)await tx.auctionQueue.createMany({data:s.queue.map((playerId,order)=>({id:`queue-${playerId}`,playerId,order,auctionId:s.auction.id}))});}
 if(JSON.stringify(s.settings)!==JSON.stringify(old?.settings)){await tx.auctionSettings.upsert({where:{id:'settings'},create:{id:'settings',auctionId:s.auction.id,data:json(s.settings)},update:{data:json(s.settings)}});await tx.bidIncrementRule.deleteMany();await tx.bidIncrementRule.createMany({data:s.settings.increments.map((r,i)=>({id:`increment-${i}`,...r}))});}
 if(JSON.stringify(s.sessions)!==JSON.stringify(old?.sessions)){await tx.session.deleteMany();if(s.sessions.length)await tx.session.createMany({data:s.sessions.map(s=>({...s,expiresAt:new Date(s.expiresAt)}))});}
 if(JSON.stringify(s.shortlists)!==JSON.stringify(old?.shortlists)){await tx.teamShortlist.deleteMany();if(s.shortlists.length)await tx.teamShortlist.createMany({data:s.shortlists.map(s=>({id:s.id,teamId:s.teamId,playerId:s.playerId,data:json(s)}))});}
}
export class PostgresStore implements Store {
 private db=new PrismaClient();
 async init(){const existing=await this.db.auction.findUnique({where:{id:'auction-2027'}});if(!existing){const password=process.env.BOOTSTRAP_ADMIN_PASSWORD; if(!password||password.length<16||!process.env.BOOTSTRAP_ADMIN_EMAIL)throw new Error('Set BOOTSTRAP_ADMIN_EMAIL and a password of at least 16 characters for first initialization.');const s=createSeed(false,password);await this.db.$transaction(async tx=>{await tx.auction.create({data:{id:s.auction.id,revision:1,snapshot:json(s)}});await project(tx,s);},{timeout:60000});}}
 async read(){const row=await this.db.auction.findUniqueOrThrow({where:{id:'auction-2027'}});return row.snapshot as unknown as State;}
 async transact<T>(fn:(s:State)=>T|Promise<T>):Promise<T>{return this.db.$transaction(async tx=>{await tx.$queryRaw`SELECT id FROM "Auction" WHERE id = 'auction-2027' FOR UPDATE`;const row=await tx.auction.findUniqueOrThrow({where:{id:'auction-2027'}});const old=row.snapshot as unknown as State;const draft=structuredClone(old);const result=await fn(draft);await project(tx,draft,old);await tx.auction.update({where:{id:row.id},data:{revision:draft.auction.revision,snapshot:json(draft)}});return result;},{timeout:30000,maxWait:15000,isolationLevel:Prisma.TransactionIsolationLevel.ReadCommitted});}
 async close(){await this.db.$disconnect();}
}
export async function createStore(production:boolean):Promise<Store>{if(production){if(!process.env.DATABASE_URL)throw new Error('Production requires DATABASE_URL. Demo storage is forbidden.');const db=new PostgresStore();await db.init();return db;}await mkdir('data',{recursive:true});try{return new MemoryStore(JSON.parse(await readFile('data/demo.json','utf8')),'data/demo.json');}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;const password=randomBytes(15).toString('base64url');const state=createSeed(true,password);await writeFile('data/demo-credentials.json',JSON.stringify({password,accounts:state.users.map(({email,role})=>({email,role}))},null,2));await writeFile('data/demo.json',JSON.stringify(state));return new MemoryStore(state,'data/demo.json');}}
