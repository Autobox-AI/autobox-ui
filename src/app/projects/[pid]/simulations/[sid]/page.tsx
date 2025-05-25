'use client';

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { use, useEffect, useState } from "react";

interface Worker {
  id: string;
  name: string;
}

interface Run {
  id: string;
  simulation_id: string;
  status: string;
  progress: number;
  started_at: string;
  finished_at?: string;
  updated_at: string;
  summary?: string;
  orchestrator_id: string;
  evaluator_id: string;
  planner_id: string;
  reporter_id: string;
  workers: Worker[];
}

interface SimulationRunsResponse {
  total: number;
  runs: Run[];
}

async function getProject(projectId: string) {
  const response = await fetch(`http://localhost:8888/api/projects/${projectId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch project');
  }

  return response.json();
}

async function getSimulation(projectId: string, simulationId: string) {
  const response = await fetch(`http://localhost:8888/api/simulations/${simulationId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch simulation');
  }

  return response.json();
}

async function getSimulationRuns(simulationId: string): Promise<SimulationRunsResponse> {
  const response = await fetch(
    `http://localhost:8888/api/simulations/${simulationId}/runs`,
    {
      next: { revalidate: 10 },
      cache: 'no-store'
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch simulation runs");
  }

  return response.json();
}

type SortDirection = 'asc' | 'desc';
type SortField = 'status' | 'progress' | 'started_at' | 'finished_at' | 'workers' | 'summary';

export default function SimulationRunsPage({
  params,
}: {
  params: Promise<{ pid: string; sid: string }>;
}) {
  const { pid, sid } = use(params);
  const [project, setProject] = useState<any>(null);
  const [simulation, setSimulation] = useState<any>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [sortField, setSortField] = useState<SortField>('started_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      const [projectData, simulationData, runsData] = await Promise.all([
        getProject(pid),
        getSimulation(pid, sid),
        getSimulationRuns(sid),
      ]);
      setProject(projectData);
      setSimulation(simulationData);
      setRuns(runsData.runs);
    };
    fetchData();
  }, [pid, sid]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedRuns = [...runs]
    .filter(run => statusFilter === 'all' || run.status === statusFilter)
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'progress':
          comparison = a.progress - b.progress;
          break;
        case 'started_at':
          comparison = new Date(a.started_at).getTime() - new Date(b.started_at).getTime();
          break;
        case 'finished_at':
          comparison = (a.finished_at ? new Date(a.finished_at).getTime() : 0) -
                      (b.finished_at ? new Date(b.finished_at).getTime() : 0);
          break;
        case 'workers':
          comparison = a.workers.map(w => w.name).join(', ').localeCompare(b.workers.map(w => w.name).join(', '));
          break;
        case 'summary':
          comparison = (a.summary || '').localeCompare(b.summary || '');
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (!project || !simulation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="sticky top-0 z-10 w-full bg-background px-6 py-4 border-b border-zinc-800 ml-[var(--sidebar-width-icon)] md:ml-[220px]">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1">
                  <BreadcrumbEllipsis className="h-4 w-4" />
                  <span className="sr-only">Toggle menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Documentation</DropdownMenuItem>
                  <DropdownMenuItem>Examples</DropdownMenuItem>
                  <DropdownMenuItem>Usage</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${pid}/simulations`}>
                {project.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/projects/${pid}/simulations/${sid}`}>
                {simulation.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Runs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
        <div className="mb-4 flex justify-end">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {sortField === 'status' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('progress')}
                >
                  <div className="flex items-center gap-1">
                    Progress
                    {sortField === 'progress' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('started_at')}
                >
                  <div className="flex items-center gap-1">
                    Started At
                    {sortField === 'started_at' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('finished_at')}
                >
                  <div className="flex items-center gap-1">
                    Finished At
                    {sortField === 'finished_at' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('workers')}
                >
                  <div className="flex items-center gap-1">
                    Workers
                    {sortField === 'workers' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => handleSort('summary')}
                >
                  <div className="flex items-center gap-1">
                    Summary
                    {sortField === 'summary' && (
                      <ArrowUpDown className="h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell>
                    <Badge
                      variant={
                        run.status === "completed"
                          ? "success"
                          : run.status === "in progress"
                          ? "default"
                          : "destructive"
                      }
                      className={run.status === "in progress" ? "animate-pulse" : ""}
                    >
                      {run.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={run.progress * 100} className="w-[100px]" />
                      <span>{Math.round(run.progress * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(run.started_at), "PPp")}
                  </TableCell>
                  <TableCell>
                    {run.finished_at
                      ? format(new Date(run.finished_at), "PPp")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {run.workers.map((worker) => worker.name).join(", ")}
                  </TableCell>
                  <TableCell>{run.summary || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
