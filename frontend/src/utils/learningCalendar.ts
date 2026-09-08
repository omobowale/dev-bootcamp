import type { CalendarEvent, ReminderPreferences } from "../api/student/workspace";
const slash=String.fromCharCode(92),crlf=String.fromCharCode(13,10);
const escapeText=(text:string)=>text.split(slash).join(slash+slash).replace(/\r?\n/g,slash+"n").replace(/;/g,slash+";").replace(/,/g,slash+",");
const stamp=(value:string|Date)=>new Date(value).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
// RFC 5545: fold at 75 UTF-8 octets without splitting a code point.
function fold(line:string){let result="",size=0;const encoder=new TextEncoder();for(const char of line){const bytes=encoder.encode(char).length;if(size+bytes>75){result+=crlf+" ";size=1;}result+=char;size+=bytes;}return result;}
export function calendarText(events:CalendarEvent[],preferences:ReminderPreferences,origin:string,now=new Date()){
 const lines=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//DevTraining//Learning Planner//EN","CALSCALE:GREGORIAN"];
 for(const e of events){lines.push("BEGIN:VEVENT",`UID:${e.id}@${new URL(origin).host}`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(e.startsAt)}`,`SUMMARY:${escapeText((e.kind==="ASSIGNMENT"?"Due: ":"")+e.title)}`,`DESCRIPTION:${escapeText(e.courseTitle+". Open the portal for the latest schedule and access details.")}`,`URL:${new URL(e.path,origin).href}`);
  if(preferences.enabled&&new Date(e.startsAt)>now)lines.push("BEGIN:VALARM",`TRIGGER:-PT${preferences.hoursBefore}H`,"ACTION:DISPLAY",`DESCRIPTION:${escapeText(e.title)}`,"END:VALARM");
  lines.push("END:VEVENT");
 }
 lines.push("END:VCALENDAR");return lines.map(fold).join(crlf)+crlf;
}
export function downloadCalendar(events:CalendarEvent[],preferences:ReminderPreferences){
 const url=URL.createObjectURL(new Blob([calendarText(events,preferences,window.location.origin)],{type:"text/calendar;charset=utf-8"}));const link=document.createElement("a");link.href=url;link.download="my-learning-week.ics";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
