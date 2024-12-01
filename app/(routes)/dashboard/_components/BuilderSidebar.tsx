"use client";

import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { FileTextIcon, Home } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import FormSettings from "./_common/FormSettings";
import FormBlockBox from "./_common/FormBlocks";
import { cn } from "@/lib/utils";

export function BuilderSidebar({
  formName,
  rest,
}: {
  formName: string;
  rest?: React.ComponentProps<typeof Sidebar>;
}) {
  const [tab, setTab] = useState<"blocks" | "settings">("blocks");
  return (
    <Sidebar className="border-r left-12 pt-16" {...rest}>
      <SidebarHeader className="bg-[#fcfcfc]">
        <header className="border-b w-full pt-1 pb-2 flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <Home className="-ml-1 w-4 h-4" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center gap-1">
                    <FileTextIcon className="w-4 h-4 mb-[3px]" />
                    <h5 className="truncate flex w-[110px] text-sm">
                      {formName}
                    </h5>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
      </SidebarHeader>
      <SidebarContent className="pt-2 px-5 bg-[#fcfcfc]">
        <div className="w-full">
          <div className="w-full flex flex-row gap-1 h-[39px] rounded-full bg-gray-100 p-1">
            <button
              className={cn(
                "p-[5px] flex-1 bg-transparent transition-colors ease-in-out rounded-full text-center font-medium text-sm",
                {
                  "bg-white": tab === "blocks",
                }
              )}
              onClick={() => setTab("blocks")}
            >
              Blocks
            </button>
            <button
              className={cn(
                "p-[5px] flex-1 bg-transparent transition-colors ease-in-out rounded-full text-center font-medium text-sm",
                {
                  "bg-white": tab === "settings",
                }
              )}
              onClick={() => setTab("settings")}
            >
              Settings
            </button>
          </div>
          {/* {Form Blocks} */}
          {tab === "blocks" && <FormBlockBox />}
          {/* {Form Settings} */}
          {tab === "settings" && <FormSettings />}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}