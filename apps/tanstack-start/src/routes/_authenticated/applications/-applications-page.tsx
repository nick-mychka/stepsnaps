import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";

import { Button } from "@stepsnaps/ui/button";
import { Field, FieldLabel } from "@stepsnaps/ui/field";
import { Input } from "@stepsnaps/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Separator } from "@stepsnaps/ui/separator";
import { Switch } from "@stepsnaps/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stepsnaps/ui/tabs";

import { ApplicationsTable } from "./-components/applications-table";
import { EmptyState } from "./-components/empty-state";
import { HistoryTable } from "./-components/history-table";
import { InterviewsDialog } from "./-components/interviews-dialog";
import { PaginationControls } from "./-components/pagination-controls";
import { useActiveApplications } from "./-hooks/use-active-applications";
import { useClosedApplications } from "./-hooks/use-closed-applications";
import { useHeatmap } from "./-hooks/use-heatmap";

export function ApplicationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [interviewsAppId, setInterviewsAppId] = useState<string | null>(null);
  const { heatmap, setHeatmap } = useHeatmap();

  const goToNew = () => void navigate({ to: "/applications/new" });
  const goToView = (id: string) =>
    void navigate({
      to: "/applications/$applicationId",
      params: { applicationId: id },
    });

  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  const activeListInput = {
    page: activeTab === "active" ? page : 1,
    tab: "active" as const,
    ...(statusFilter !== "all"
      ? { status: statusFilter as "pending" | "interviewing" | "on_hold" }
      : {}),
    ...(activeTab === "active" && debouncedSearch.trim()
      ? { search: debouncedSearch.trim() }
      : {}),
  };

  const { data: activeData } = useActiveApplications(activeListInput);

  const { data: historyData } = useClosedApplications(
    {
      page: activeTab === "closed" ? page : 1,
      tab: "closed" as const,
      ...(activeTab === "closed" && debouncedSearch.trim()
        ? { search: debouncedSearch.trim() }
        : {}),
    },
    { enabled: activeTab === "closed" },
  );

  const currentData = activeTab === "active" ? activeData : historyData;
  const totalPages = currentData
    ? Math.max(1, Math.ceil(currentData.total / currentData.perPage))
    : 1;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "active" | "closed");
    setPage(1);
    setStatusFilter("all");
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications</h1>
        <Button onClick={goToNew}>Add Application</Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">History</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            {activeTab === "active" && (
              <>
                <Field orientation="horizontal" className="w-fit">
                  <Switch
                    id="heatmap-toggle"
                    checked={heatmap}
                    onCheckedChange={setHeatmap}
                  />
                  <FieldLabel htmlFor="heatmap-toggle">Heatmap</FieldLabel>
                </Field>
                <Separator orientation="vertical" className="mx-3" />
              </>
            )}
            <Input
              placeholder="Search by company..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-56"
            />
            {activeTab === "active" && (
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="active">
          {activeData ? (
            activeData.total === 0 &&
            !debouncedSearch &&
            statusFilter === "all" ? (
              <EmptyState onAdd={goToNew} />
            ) : (
              <>
                <ApplicationsTable
                  data={activeData.items}
                  onView={goToView}
                  onInterviews={setInterviewsAppId}
                  heatmap={heatmap}
                />
                {totalPages > 1 && (
                  <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                )}
              </>
            )
          ) : (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {historyData ? (
            <>
              <HistoryTable data={historyData.items} onView={goToView} />
              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <span className="text-muted-foreground text-sm">Loading...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <InterviewsDialog
        applicationId={interviewsAppId}
        onOpenChange={(open) => {
          if (!open) setInterviewsAppId(null);
        }}
      />
    </main>
  );
}
