import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  isCollapsed: boolean;
  isHovered: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setHovered: (hovered: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isHovered: false,
      toggleCollapsed: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
      setHovered: (hovered) => set({ isHovered: hovered }),
    }),
    {
      name: "sellokart-sidebar-storage",
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
