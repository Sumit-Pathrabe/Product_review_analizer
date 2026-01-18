import { Upload, MessageSquare, Brain, BarChart3, Swords } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useReviewStore } from "@/stores/reviewStore";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const navigationItems = [
  { title: "Upload & Source", url: "/upload", icon: Upload },
  { title: "Reviews", url: "/reviews", icon: MessageSquare },
  { title: "Analysis", url: "/analysis", icon: Brain },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "VS Compare", url: "/comparison", icon: Swords },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { reviews, analysisResult, competitor } = useReviewStore();

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center glow-primary">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">ReviewIQ</span>
              <span className="text-xs text-muted-foreground">Intelligence Dashboard</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed && "sr-only")}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink
                        to={item.url}
                        className={cn(
                          "flex items-center gap-3 transition-colors",
                          isActive && "bg-accent text-accent-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {!collapsed && <span>{item.title}</span>}
                        {!collapsed && item.url === "/reviews" && reviews.length > 0 && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {reviews.length.toLocaleString()}
                          </Badge>
                        )}
                        {!collapsed && item.url === "/insights" && analysisResult && (
                          <Badge className="ml-auto text-xs gradient-primary">
                            Ready
                          </Badge>
                        )}
                        {!collapsed && item.url === "/comparison" && competitor?.analysisResult && (
                          <Badge className="ml-auto text-xs bg-warning text-warning-foreground">
                            VS
                          </Badge>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          {!collapsed && <span className="text-xs text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
