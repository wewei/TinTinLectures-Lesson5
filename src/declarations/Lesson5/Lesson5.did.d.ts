import type { Principal } from '@dfinity/principal';
export interface Message {
  'content' : string,
  'time' : Time,
  'author' : Principal,
}
export type Time = bigint;
export interface _SERVICE {
  'claim_owner' : () => Promise<undefined>,
  'clear' : () => Promise<undefined>,
  'follow' : (arg_0: Principal) => Promise<undefined>,
  'follows' : () => Promise<Array<Principal>>,
  'get_name' : () => Promise<string>,
  'get_owner' : () => Promise<[] | [Principal]>,
  'post' : (arg_0: string) => Promise<undefined>,
  'posts' : (arg_0: Time) => Promise<Array<Message>>,
  'reset' : () => Promise<undefined>,
  'set_name' : (arg_0: string) => Promise<undefined>,
  'timeline' : (arg_0: Time) => Promise<Array<Message>>,
}
