import { NavLink } from "react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-sm p-2", { "bg-blue-300": isActive });

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <nav className="flex flex-col gap-2 p-2">
          <NavLink to="/" className={navLinkStyles} end>
            Home
          </NavLink>
          <NavLink to="/clients" className={navLinkStyles} end>
            Clients
          </NavLink>
          <NavLink to="/mechanics" className={navLinkStyles} end>
            Mechanics
          </NavLink>
          <NavLink to="/vehicles" className={navLinkStyles} end>
            Vehicles
          </NavLink>
        </nav>
        <SidebarGroup />
        <NavLink to="/settings" className={navLinkStyles} end>
          Settings
        </NavLink>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
