import { NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getInbox } from "../api/student/workspace";
import { Icon } from "./Icon";
import "../workspace.css";
export function StudentTools(){
 const inbox=useQuery({queryKey:["student","workspace","notifications"],queryFn:getInbox,refetchInterval:60000});
 return <nav className="container student-tools" aria-label="Learning tools">
  <NavLink to="/student" end><Icon name="book" size={17}/>My learning</NavLink>
  <NavLink to="/student/planner"><Icon name="calendar" size={17}/>Planner</NavLink>
  <NavLink to="/student/notifications"><Icon name="mail" size={17}/>Updates{Boolean(inbox.data?.unreadCount)&&<span className="workspace-count" aria-label={`${inbox.data?.unreadCount} unread`}>{inbox.data?.unreadCount}</span>}</NavLink>
 </nav>;
}
