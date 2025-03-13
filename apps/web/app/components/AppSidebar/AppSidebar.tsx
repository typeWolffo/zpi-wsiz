import { NavLink } from "react-router";
import { useLogoutUser } from "~/api/mutations/useLogoutUser";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { cn } from "~/lib/utils";
import { Button } from "../ui/button";
import { useCurrentUserStore } from "~/store/useCurrentUserStore";

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  cn("rounded-sm p-2", { "bg-primary text-primary-foreground": isActive });

export function AppSidebar() {
  const { mutate: logoutUser } = useLogoutUser();
  const currentUser = useCurrentUserStore((state) => state.currentUser);
  const isEmployee = currentUser?.role === "employee";

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <nav className="flex flex-col gap-2 p-2">
          <SidebarGroup>
            <NavLink to="/" className={navLinkStyles} end>
              Schedule
            </NavLink>

            {!isEmployee && (
              <>
                <NavLink to="/clients" className={navLinkStyles} end>
                  Clients
                </NavLink>
                <NavLink to="/mechanics" className={navLinkStyles} end>
                  Mechanics
                </NavLink>
                <NavLink to="/vehicles" className={navLinkStyles} end>
                  Vehicles
                </NavLink>
              </>
            )}
          </SidebarGroup>
        </nav>
      </SidebarContent>
      <SidebarFooter>
        <Button
          size="sm"
          onClick={() => {
            logoutUser();
          }}
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
