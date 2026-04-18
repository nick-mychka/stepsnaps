import { useRef, useState } from "react";

import { Button } from "@stepsnaps/ui/button";
import { Input } from "@stepsnaps/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@stepsnaps/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@stepsnaps/ui/tabs";

import { AddApplicationDialog } from "./-components/add-application-dialog";
import { ApplicationsTable } from "./-components/applications-table";
import { CloseApplicationDialog } from "./-components/close-application-dialog";
import { EditApplicationDialog } from "./-components/edit-application-dialog";
import { EmptyState } from "./-components/empty-state";
import { HistoryTable } from "./-components/history-table";
import { InterviewsDialog } from "./-components/interviews-dialog";
import { PaginationControls } from "./-components/pagination-controls";
import { useActiveApplications } from "./-hooks/use-active-applications";
import { useClosedApplications } from "./-hooks/use-closed-applications";

export function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<"active" | "closed">("active");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [closingAppId, setClosingAppId] = useState<string | null>(null);
  const [interviewsAppId, setInterviewsAppId] = useState<string | null>(null);

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
        <Button onClick={() => setShowAddDialog(true)}>Add Application</Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="closed">History</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
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
          {activeData.total === 0 &&
          !debouncedSearch &&
          statusFilter === "all" ? (
            <EmptyState onAdd={() => setShowAddDialog(true)} />
          ) : (
            <>
              <ApplicationsTable
                data={activeData.items}
                onEdit={setEditingAppId}
                onInterviews={setInterviewsAppId}
              />
              {totalPages > 1 && (
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="closed">
          {historyData ? (
            <>
              <HistoryTable data={historyData.items} />
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

      <AddApplicationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      <EditApplicationDialog
        applicationId={editingAppId}
        onOpenChange={(open) => {
          if (!open) setEditingAppId(null);
        }}
        onClose={(id) => {
          setEditingAppId(null);
          setClosingAppId(id);
        }}
      />

      <CloseApplicationDialog
        applicationId={closingAppId}
        onOpenChange={(open) => {
          if (!open) setClosingAppId(null);
        }}
      />

      <InterviewsDialog
        applicationId={interviewsAppId}
        onOpenChange={(open) => {
          if (!open) setInterviewsAppId(null);
        }}
      />
    </main>
  );
}
