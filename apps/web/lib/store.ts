import { proxy } from "valtio";

export const uiStore = proxy({
  sidebarCollapsed: false,
  theme: "light" as "light" | "dark",
});
