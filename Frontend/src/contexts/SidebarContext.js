'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch (e) {
      console.error('Lỗi khi đọc trạng thái sidebar:', e);
    }
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const nextState = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(nextState));
      } catch (e) {
        console.error('Lỗi khi lưu trạng thái sidebar:', e);
      }
      return nextState;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar phải được sử dụng bên trong SidebarProvider');
  }
  return context;
}
