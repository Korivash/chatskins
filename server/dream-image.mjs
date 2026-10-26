/**
 * PNG inspection helpers for generated chat frames.
 * The image endpoint and the model prompt are both treated as untrusted input.
 */
import {inflateSync} from 'node:zlib';

/** Decode common 8-bit PNG color formats without external packages. */
export function decodePngRgba(buffer){
 const bytes=Buffer.from(buffer);if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error('Not a PNG image.');
 let width=0,height=0,colorType=-1,bitDepth=0,palette=null,transparency=null;const chunks=[];
 for(let offset=8;offset+12<=bytes.length;){const length=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8),data=bytes.subarray(offset+8,offset+8+length);if(offset+12+length>bytes.length)throw new Error('Truncated PNG.');
  if(type==='IHDR'){width=data.readUInt32BE(0);height=data.readUInt32BE(4);bitDepth=data[8];colorType=data[9];if(data[12]!==0)throw new Error('Unsupported PNG interlace.');}
  if(type==='PLTE')palette=Buffer.from(data);if(type==='tRNS')transparency=Buffer.from(data);if(type==='IDAT')chunks.push(data);if(type==='IEND')break;offset+=length+12;
 }
 if(!width||!height||bitDepth!==8||!chunks.length)throw new Error('Unsupported PNG dimensions or encoding.');
 const channels={0:1,2:3,3:1,4:2,6:4}[colorType];if(!channels)throw new Error('Unsupported PNG color type.');
 const stride=width*channels,raw=inflateSync(Buffer.concat(chunks));if(raw.length<(stride+1)*height)throw new Error('PNG pixel data is incomplete.');
 const scan=Buffer.alloc(stride*height);let src=0;
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c};
 for(let y=0;y<height;y++){const filter=raw[src++],row=y*stride;for(let x=0;x<stride;x++){const value=raw[src++],left=x>=channels?scan[row+x-channels]:0,up=y?scan[row-stride+x]:0,upperLeft=y&&x>=channels?scan[row-stride+x-channels]:0;let predictor=0;if(filter===1)predictor=left;else if(filter===2)predictor=up;else if(filter===3)predictor=Math.floor((left+up)/2);else if(filter===4)predictor=paeth(left,up,upperLeft);else if(filter!==0)throw new Error('Unsupported PNG filter.');scan[row+x]=(value+predictor)&255}}
 const rgba=Buffer.alloc(width*height*4);for(let i=0,p=0;i<width*height;i++){let r,g,b,a=255;if(colorType===6){r=scan[p++];g=scan[p++];b=scan[p++];a=scan[p++]}else if(colorType===2){r=scan[p++];g=scan[p++];b=scan[p++]}else if(colorType===0){r=g=b=scan[p++];if(transparency&&r===transparency.readUInt16BE(0))a=0}else if(colorType===4){r=g=b=scan[p++];a=scan[p++]}else{const index=scan[p++];if(!palette||index*3+2>=palette.length)throw new Error('Invalid PNG palette.');r=palette[index*3];g=palette[index*3+1];b=palette[index*3+2];if(transparency&&index<transparency.length)a=transparency[index]}const q=i*4;rgba[q]=r;rgba[q+1]=g;rgba[q+2]=b;rgba[q+3]=a}
 return{width,height,data:rgba};
}

/** Return the transparent fraction in the centered 40% × 40% inspection box. */
export function centerTransparency(rgba,width,height,{threshold=24,boxFraction=.4}={}){
 const x0=Math.floor(width*(1-boxFraction)/2),x1=Math.ceil(width*(1+boxFraction)/2),y0=Math.floor(height*(1-boxFraction)/2),y1=Math.ceil(height*(1+boxFraction)/2);let clear=0,total=0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){total++;if(rgba[(y*width+x)*4+3]<threshold)clear++}return total?clear/total:0;
}

/** Fail closed when pixel inspection cannot prove the center is transparent. */
export function needsTransparentCenterRetry(measurement){
 const fraction=measurement?.centerTransparency;
 return !Number.isFinite(fraction)||fraction<.95;
}

/** Remove tiny connected opaque specks from an alpha-derived art mask. */
function removeSmallSpecks(mask,width,height){
 const total=width*height,limit=Math.max(1,Math.floor(total*.0015)),seen=new Uint8Array(total),stack=[],component=[];
 for(let start=0;start<total;start++){if(!mask[start]||seen[start])continue;stack.length=0;component.length=0;stack.push(start);seen[start]=1;
  while(stack.length){const index=stack.pop();component.push(index);const x=index%width,y=(index/width)|0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const next=ny*width+nx;if(mask[next]&&!seen[next]){seen[next]=1;stack.push(next)}}}
  if(component.length<=limit)for(const index of component)mask[index]=0;
 }
}

/** Maximal mostly-transparent rectangle containing the exact image center. */
export function largestCenterEmptyRect(rgba,width,height,{alphaThreshold=24,margin=.015,opaqueTolerance=.015}={}){
 const mask=new Uint8Array(width*height);for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3]>=alphaThreshold?1:0;removeSmallSpecks(mask,width,height);
 const heights=new Int32Array(width),cx=Math.floor(width/2),cy=Math.floor(height/2);let best={area:0,left:0,right:width-1,top:0,bottom:height-1};
 for(let y=0;y<height;y++){for(let x=0;x<width;x++)heights[x]=mask[y*width+x]?0:heights[x]+1;const stack=[];
  for(let x=0;x<=width;x++){
   const current=x===width?0:heights[x];let start=x;
   while(stack.length&&stack.at(-1).height>current){
    const item=stack.pop(),left=item.start,right=x-1,top=y-item.height+1,bottom=y;
    if(left<=cx&&right>=cx&&top<=cy&&bottom>=cy){const area=(right-left+1)*(bottom-top+1);if(area>best.area)best={area,left,right,top,bottom}}
    start=item.start;
   }
   if(current>0&&(!stack.length||stack.at(-1).height<current))stack.push({start,height:current});
  }
 }
 if(!best.area)return{rect:{x:.15,y:.18,w:.70,h:.60},fallback:true};
 // Allow sparse alpha noise and thin decorative threads around the clear
 // opening. This is equivalent to requiring at least 98.5% empty pixels.
 const integral=new Uint32Array((width+1)*(height+1)),stride=width+1;
 for(let y=1;y<=height;y++){let row=0;for(let x=1;x<=width;x++){row+=mask[(y-1)*width+x-1];integral[y*stride+x]=integral[(y-1)*stride+x]+row}}
 const ink=(left,top,right,bottom)=>integral[(bottom+1)*stride+right+1]-integral[top*stride+right+1]-integral[(bottom+1)*stride+left]+integral[top*stride+left];
 for(let pass=0;pass<width+height;pass++){
  const options=[];for(const [side,rect] of [
   ['left',{...best,left:Math.max(0,best.left-1)}],['right',{...best,right:Math.min(width-1,best.right+1)}],
   ['top',{...best,top:Math.max(0,best.top-1)}],['bottom',{...best,bottom:Math.min(height-1,best.bottom+1)}]
  ]){if(rect.left===best.left&&rect.right===best.right&&rect.top===best.top&&rect.bottom===best.bottom)continue;const area=(rect.right-rect.left+1)*(rect.bottom-rect.top+1),occupied=ink(rect.left,rect.top,rect.right,rect.bottom);if(occupied/area<=opaqueTolerance)options.push({side,rect,area})}
  if(!options.length)break;options.sort((a,b)=>b.area-a.area);best=options[0].rect;
 }
 const mx=Math.round(width*margin),my=Math.round(height*margin),left=Math.min(width-1,best.left+mx),right=Math.max(left,best.right-mx),top=Math.min(height-1,best.top+my),bottom=Math.max(top,best.bottom-my);
 let x=left/width,y=top/height,w=(right-left+1)/width,h=(bottom-top+1)/height;
 if(w<.4||h<.4)return{rect:{x:.15,y:.18,w:.70,h:.60},fallback:true};
 if(w>.9){const shrink=(w-.9)/2;x+=shrink;w=.9}if(h>.9){const shrink=(h-.9)/2;y+=shrink;h=.9}
 return{rect:{x,y,w,h},fallback:false};
}

/** Find a solid, centered plaque band near the top and record its sampled color. */
export function measureTopPlaque(rgba,width,height){
 const yStart=Math.floor(height*.015),yEnd=Math.floor(height*.34),minW=Math.floor(width*.2),maxW=Math.floor(width*.78);let best=null;
 for(let y=yStart;y<yEnd;y++){let x=0;while(x<width){while(x<width&&rgba[(y*width+x)*4+3]<200)x++;const start=x;while(x<width&&rgba[(y*width+x)*4+3]>=200)x++;const span=x-start;if(span<minW||span>maxW||start>width*.4||x<width*.6)continue;
   let bottom=y;for(let yy=y+1;yy<Math.min(yEnd,y+Math.floor(height*.14));yy++){let opaque=0;for(let xx=start;xx<x;xx++)if(rgba[(yy*width+xx)*4+3]>=200)opaque++;if(opaque/(x-start)<.92)break;bottom=yy}
   const h=bottom-y+1;if(h<height*.025)continue;const area=span*h,score=area*(1-Math.abs((start+x)/(2*width)-.5));if(!best||score>best.score)best={x:start,y,w:span,h,score};
  }}
 if(!best)return{none:true};let rs=0,gs=0,bs=0,count=0,lums=[];for(let y=best.y;y<best.y+best.h;y++)for(let x=best.x;x<best.x+best.w;x++){const p=(y*width+x)*4;if(rgba[p+3]<200)continue;const r=rgba[p],g=rgba[p+1],b=rgba[p+2];rs+=r;gs+=g;bs+=b;count++;lums.push(.2126*r+.7152*g+.0722*b)}lums.sort((a,b)=>a-b);const fill=count?`#${[rs,gs,bs].map(v=>Math.round(v/count).toString(16).padStart(2,'0')).join('')}`:'#222222';return{x:best.x/width,y:best.y/height,w:best.w/width,h:best.h/height,none:false,painted:false,fill,tone:lums[Math.floor(lums.length/2)]>135?'light':'dark',medianLuminance:lums.length?lums[Math.floor(lums.length/2)]/255:.5};
}

/** Measure the reusable geometry directly from decoded RGBA pixels. */
export function measurePaintedRgba(data,width,height){const measured=largestCenterEmptyRect(data,width,height);return{width,height,centerTransparency:centerTransparency(data,width,height),inner:measured.rect,measureFallback:measured.fallback,plaque:measureTopPlaque(data,width,height),shape:'tall'};}

/** Measure generated PNG bytes without converting or resampling the source. */
export function measurePaintedFrame(png){const decoded=decodePngRgba(png);return measurePaintedRgba(decoded.data,decoded.width,decoded.height);}

/** Read dimensions from the PNG header for the optional ffmpeg retry path. */
export function pngDimensions(buffer){const bytes=Buffer.from(buffer);if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||bytes.toString('ascii',12,16)!=='IHDR')throw new Error('Invalid PNG header.');return{width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)}}
