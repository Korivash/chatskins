/**
 * Browser module community-chat.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: createCommunityChat.
 * Invariant: preserve existing settings links and render chat content as text.
 */
import {createCommunityEmotes} from './emote-provider.js';

import {appendChatMessage} from './render.js';


/** create community chat.
 * @param {unknown} parameter1 Function input.
 * @param {unknown} append Function input.
 * @param {unknown} onUpdate Function input.
 * @returns {unknown} The function result.
 */
export function createCommunityChat({getSettings, append=appendChatMessage, onUpdate=()=>{}, onStatus=()=>{}, fetchImpl, interval}={}){
 let roomId='', map=new Map();
  
 const provider=createCommunityEmotes({getChannelId:()=>roomId,getEnabled:()=>getSettings()?.emotes||{},onUpdate:value=>{map=value;onUpdate(new Map(value));},onStatus,fetchImpl,interval});
  
 return{
  onRoomState(room){const next=String(room?.roomId||'');
      if(next&&next!==roomId){roomId=next;
        return provider.refresh();
        }},
  clearRoomId(){roomId='';
      return provider.refresh();
      },
  refresh(){return provider.refresh();
      },
  add(root,message){return append(root,message,getSettings(),map);
      },
  get map(){return new Map(map);
      },
  stop(){provider.stop();
      }
 };
  
}
