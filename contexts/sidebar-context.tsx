"use client"

import * as React from "react"

export interface SidebarConfig {
  variant: "sidebar" | "floating" | "inset"
  collapsible: "offcanvas" | "icon" | "none"
  side: "left" | "right"
}

export interface SidebarContextValue {
  config: SidebarConfig
  updateConfig: (config: Partial<SidebarConfig>) => void
}


// ---------------------------------------------------------
// 2.在这里配置你的布局“固定值” (Configuration Zone)
// ---------------------------------------------------------
const FIXED_CONFIG: SidebarConfig = {
    // 决定侧边栏长什么样：
    // "sidebar": 标准侧边栏 (带有边框)
    // "inset":   嵌入式 (类似 macOS 风格，内容区像是浮在上面)
    // "floating": 浮动式
    variant: "inset",

    // 决定折叠行为：
    // "icon": 折叠时变成小图标
    // "offcanvas": 手机端常用，平时隐藏，划出来
    // "none": 永远不折叠
    collapsible: "icon",

    // 决定位置：
    side: "left"
}


export const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function SidebarConfigProvider({ children }: { children: React.ReactNode }) {
  // const [config, setConfig] = React.useState<SidebarConfig>({
  //   variant: "inset",
  //   collapsible: "offcanvas",
  //   side: "left"
  // })

  const updateConfig = React.useCallback((newConfig: Partial<SidebarConfig>) => {
    // setConfig(prev => ({ ...prev, ...newConfig }))
      console.log("Sidebar config is locked via code.", newConfig)
  }, [])

  return (
    <SidebarContext.Provider value={{ config: FIXED_CONFIG, updateConfig }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarConfig() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebarConfig must be used within a SidebarConfigProvider")
  }
  return context
}
