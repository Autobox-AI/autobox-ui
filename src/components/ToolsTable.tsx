import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChartIcon,
  CaretSortIcon,
  ChevronDownIcon,
  DotsHorizontalIcon,
  InfoCircledIcon,
  Pencil1Icon,
  TrashIcon,
} from '@radix-ui/react-icons'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useState } from 'react'

const statusOrder = { green: 1, yellow: 2, red: 3 }

const toolStatuses: { [key: string]: 'red' | 'yellow' | 'green' } = {
  'Internet Browser': 'green',
  'Google Maps': 'yellow',
  'Vacation Database': 'red',
  Agenda: 'green',
  'Google Drive': 'yellow',
  Weather: 'green',
  Wallet: 'red',
  'Email Client': 'green',
  Translator: 'yellow',
  'News Aggregator': 'green',
  'Stock Market Data': 'red',
  'Social Media Dashboard': 'green',
  'Maps and Navigation': 'green',
  'Task Manager': 'yellow',
  'Recipe Finder': 'green',
  'Music Streaming': 'yellow',
  'Cloud Storage': 'green',
  'Virtual Assistant': 'yellow',
  Calendar: 'green',
  'Fitness Tracker': 'green',
  'Shopping Assistant': 'green',
  'Weather Alerts': 'yellow',
  'AI-powered Search Engine': 'green',
  'File Converter': 'yellow',
  'Project Management': 'green',
  'Database Query Tool': 'green',
  'Knowledge Base': 'green',
}

const toolDescriptions: { [key: string]: string } = {
  'Internet Browser': 'A tool to browse the internet',
  'Google Maps': 'A mapping service for directions and locations',
  'Vacation Database': 'A database for storing vacation-related data',
  Agenda: 'A planner for managing tasks and events',
  'Google Drive': 'Cloud storage for file sharing and management',
  Weather: 'A tool to check weather forecasts',
  Wallet: 'A digital wallet for payments',
  'Email Client': 'A client to manage and send emails',
  Translator: 'A tool to translate languages',
  'News Aggregator': 'A service to collect news from various sources',
  'Stock Market Data': 'A tool to view and analyze stock market data',
  'Social Media Dashboard': 'A dashboard for managing social media accounts',
  'Maps and Navigation': 'A tool for maps and real-time navigation',
  'Task Manager': 'A tool to manage and track tasks',
  'Recipe Finder': 'A tool to find and save recipes',
  'Music Streaming': 'A service to stream music',
  'Cloud Storage': 'A service for storing and accessing files in the cloud',
  'Virtual Assistant': 'An AI-powered assistant for tasks and reminders',
  Calendar: 'A calendar for scheduling and managing events',
  'Fitness Tracker': 'A tool to track workouts and health metrics',
  'Shopping Assistant': 'An assistant for managing shopping lists and finding deals',
  'Weather Alerts': 'A tool to receive real-time weather alerts',
  'AI-powered Search Engine': 'A search engine enhanced by AI capabilities',
  'File Converter': 'A tool to convert file formats',
  'Project Management': 'A tool to manage and collaborate on projects',
  'Database Query Tool': 'A tool to query and manage databases',
  'Knowledge Base': 'A repository for storing and accessing knowledge',
}

const toolObservations: { [key: string]: string } = {
  'Internet Browser': 'Ready to use: The browser is functioning perfectly.',
  'Google Maps': 'Minor delays: Some mapping features may be temporarily unavailable.',
  'Vacation Database':
    'Critical error: Unable to access vacation data, requires immediate attention.',
  Agenda: 'Ready to use: All tasks are synced and functioning.',
  'Google Drive': 'Limited access: Some files may not sync, but core features are operational.',
  Weather: 'Ready to use: Real-time weather data available.',
  Wallet: 'System failure: Wallet service is down and cannot process transactions.',
  'Email Client': 'Ready to use: All emails are synced and accessible.',
  Translator: 'Minor issues: Translation accuracy may vary due to API delays.',
  'News Aggregator': 'Ready to use: News updates are being fetched regularly.',
  'Stock Market Data': 'Service disruption: Stock data unavailable, awaiting fix.',
  'Social Media Dashboard': 'Ready to use: Social media management tools are online.',
  'Maps and Navigation': 'Ready to use: Navigation tools are fully functional.',
  'Task Manager': 'Minor sync issues: Some tasks may not appear immediately.',
  'Recipe Finder': 'Ready to use: Recipe search and suggestions are active.',
  'Music Streaming': 'Minor buffering: Some streaming services may be slow.',
  'Cloud Storage': 'Ready to use: All files are securely stored and accessible.',
  'Virtual Assistant': 'Slight lag: The assistant may take longer to respond.',
  Calendar: 'Ready to use: All events and schedules are up to date.',
  'Fitness Tracker': 'Ready to use: Health metrics and tracking are functioning correctly.',
  'Shopping Assistant': 'Ready to use: Shopping recommendations are updated.',
  'Weather Alerts': 'Minor alert delays: Some real-time alerts may be slow.',
  'AI-powered Search Engine': 'Ready to use: AI search is responsive and accurate.',
  'File Converter': 'Conversion delays: Files may take longer to process.',
  'Project Management': 'Ready to use: All project tools are fully operational.',
  'Database Query Tool': 'Ready to use: Queries are running smoothly.',
  'Knowledge Base': 'Ready to use: All documentation is up to date and accessible.',
}

const tools = [
  {
    tool: 'Internet Browser',
    description: toolDescriptions['Internet Browser'],
    status: toolStatuses['Internet Browser'],
    observation: toolObservations['Internet Browser'],
  },
  {
    tool: 'Google Maps',
    description: toolDescriptions['Google Maps'],
    status: toolStatuses['Google Maps'],
    observation: toolObservations['Google Maps'],
  },
  {
    tool: 'Vacation Database',
    description: toolDescriptions['Vacation Database'],
    status: toolStatuses['Vacation Database'],
    observation: toolObservations['Vacation Database'],
  },
  {
    tool: 'Agenda',
    description: toolDescriptions['Agenda'],
    status: toolStatuses['Agenda'],
    observation: toolObservations['Agenda'],
  },
  {
    tool: 'Google Drive',
    description: toolDescriptions['Google Drive'],
    status: toolStatuses['Google Drive'],
    observation: toolObservations['Google Drive'],
  },
  {
    tool: 'Weather',
    description: toolDescriptions['Weather'],
    status: toolStatuses['Weather'],
    observation: toolObservations['Weather'],
  },
  {
    tool: 'Wallet',
    description: toolDescriptions['Wallet'],
    status: toolStatuses['Wallet'],
    observation: toolObservations['Wallet'],
  },
  {
    tool: 'Email Client',
    description: toolDescriptions['Email Client'],
    status: toolStatuses['Email Client'],
    observation: toolObservations['Email Client'],
  },
  {
    tool: 'Translator',
    description: toolDescriptions['Translator'],
    status: toolStatuses['Translator'],
    observation: toolObservations['Translator'],
  },
  {
    tool: 'News Aggregator',
    description: toolDescriptions['News Aggregator'],
    status: toolStatuses['News Aggregator'],
    observation: toolObservations['News Aggregator'],
  },
  {
    tool: 'Stock Market Data',
    description: toolDescriptions['Stock Market Data'],
    status: toolStatuses['Stock Market Data'],
    observation: toolObservations['Stock Market Data'],
  },
  {
    tool: 'Social Media Dashboard',
    description: toolDescriptions['Social Media Dashboard'],
    status: toolStatuses['Social Media Dashboard'],
    observation: toolObservations['Social Media Dashboard'],
  },
  {
    tool: 'Maps and Navigation',
    description: toolDescriptions['Maps and Navigation'],
    status: toolStatuses['Maps and Navigation'],
    observation: toolObservations['Maps and Navigation'],
  },
  {
    tool: 'Task Manager',
    description: toolDescriptions['Task Manager'],
    status: toolStatuses['Task Manager'],
    observation: toolObservations['Task Manager'],
  },
  {
    tool: 'Recipe Finder',
    description: toolDescriptions['Recipe Finder'],
    status: toolStatuses['Recipe Finder'],
    observation: toolObservations['Recipe Finder'],
  },
  {
    tool: 'Music Streaming',
    description: toolDescriptions['Music Streaming'],
    status: toolStatuses['Music Streaming'],
    observation: toolObservations['Music Streaming'],
  },
  {
    tool: 'Cloud Storage',
    description: toolDescriptions['Cloud Storage'],
    status: toolStatuses['Cloud Storage'],
    observation: toolObservations['Cloud Storage'],
  },
  {
    tool: 'Virtual Assistant',
    description: toolDescriptions['Virtual Assistant'],
    status: toolStatuses['Virtual Assistant'],
    observation: toolObservations['Virtual Assistant'],
  },
  {
    tool: 'Calendar',
    description: toolDescriptions['Calendar'],
    status: toolStatuses['Calendar'],
    observation: toolObservations['Calendar'],
  },
  {
    tool: 'Fitness Tracker',
    description: toolDescriptions['Fitness Tracker'],
    status: toolStatuses['Fitness Tracker'],
    observation: toolObservations['Fitness Tracker'],
  },
  {
    tool: 'Shopping Assistant',
    description: toolDescriptions['Shopping Assistant'],
    status: toolStatuses['Shopping Assistant'],
    observation: toolObservations['Shopping Assistant'],
  },
  {
    tool: 'Weather Alerts',
    description: toolDescriptions['Weather Alerts'],
    status: toolStatuses['Weather Alerts'],
    observation: toolObservations['Weather Alerts'],
  },
  {
    tool: 'AI-powered Search Engine',
    description: toolDescriptions['AI-powered Search Engine'],
    status: toolStatuses['AI-powered Search Engine'],
    observation: toolObservations['AI-powered Search Engine'],
  },
  {
    tool: 'File Converter',
    description: toolDescriptions['File Converter'],
    status: toolStatuses['File Converter'],
    observation: toolObservations['File Converter'],
  },
  {
    tool: 'Project Management',
    description: toolDescriptions['Project Management'],
    status: toolStatuses['Project Management'],
    observation: toolObservations['Project Management'],
  },
  {
    tool: 'Database Query Tool',
    description: toolDescriptions['Database Query Tool'],
    status: toolStatuses['Database Query Tool'],
    observation: toolObservations['Database Query Tool'],
  },
  {
    tool: 'Knowledge Base',
    description: toolDescriptions['Knowledge Base'],
    status: toolStatuses['Knowledge Base'],
    observation: toolObservations['Knowledge Base'],
  },
]

const renderStatusCircle = (status: 'red' | 'yellow' | 'green') => {
  const colorMap = {
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
  }
  return <span className={`inline-block w-4 h-4 rounded-full ${colorMap[status]}`} />
}

const columns: ColumnDef<(typeof tools)[0]>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="px-2 w-8">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="px-2 w-8">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'tool',
    header: ({ column }) => (
      <div className="flex items-center space-x-2 px-2">
        {' '}
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0"
        >
          Tool
          <CaretSortIcon className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => <div className="text-left px-2">{row.original.tool}</div>,
    enableSorting: true,
  },
  {
    accessorKey: 'description',
    header: () => <div className="text-left px-2">Description</div>,
    cell: ({ row }) => <div className="text-left px-2">{row.original.description}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <div className="flex items-center space-x-2 px-2">
        {' '}
        <Button
          variant="ghost"
          className="p-0"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Status
          <CaretSortIcon className="h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-left px-2">{renderStatusCircle(row.original.status)}</div>
    ),
    enableSorting: true,
    sortingFn: (rowA, rowB) =>
      statusOrder[rowA.original.status] - statusOrder[rowB.original.status],
  },
  {
    accessorKey: 'observation',
    header: () => <div className="text-left px-2">Observation</div>,
    cell: ({ row }) => <div className="text-left px-2">{row.original.observation}</div>,
    enableSorting: false,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-left px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <DotsHorizontalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => console.log('Update tool')}>
              <Pencil1Icon className="mr-2 h-4 w-4" /> Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Remove tool')}>
              <TrashIcon className="mr-2 h-4 w-4" /> Remove
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('View usage')}>
              <BarChartIcon className="mr-2 h-4 w-4" /> View Usage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('View details')}>
              <InfoCircledIcon className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

const ToolsTable = () => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data: tools,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter tools..."
          value={(table.getColumn('tool')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('tool')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ToolsTable
