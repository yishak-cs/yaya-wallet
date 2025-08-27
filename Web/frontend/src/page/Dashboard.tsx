import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Transaction } from "@/types"
import { apiClient } from "../api/services"
import PaginationDataTable from "@/components/ui/paginationdatatable"
import type { ColumnDef } from "@tanstack/react-table"
import DataTableColumnHeader from "@/components/ui/datatableheader"
import AppLayout from "@/layout/AppLayout"
import { formatDate } from "@/lib/utils"

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentUser, setCurrentUser] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Define columns for the datatable
  const columns: ColumnDef<Transaction>[] = [
  
    {
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
    },

    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const transaction = row.original
        const isReceiver = !!currentUser && (
          transaction.receiver.account === currentUser.Account ||
          transaction.receiver.name === currentUser.Name
        )
        const isSender = !!currentUser && (
          transaction.sender.account === currentUser.Account ||
          transaction.sender.name === currentUser.Name
        )

        if (!isSender && !isReceiver) {
          return <span>Not your transaction</span>
        }

        const incoming = isReceiver

        return (
          <Badge
            variant={incoming ? "default" : "secondary"}
            className={`gap-1 ${
              incoming
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
          >
            {incoming ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
            {incoming ? "In" : "Out"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "contact",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From/To" />
      ),
      cell: ({ row }) => {
        const transaction = row.original
        const incoming = isIncoming(transaction)
        const contact = incoming ? transaction.sender : transaction.receiver
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {(contact.name || "?")
                  .split(" ")
                  .map((n: string) => n.charAt(0))
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 justify-start">
              <div className="font-medium text-slate-900 truncate">{contact.name}</div>
              <div className="text-sm text-slate-500 truncate">@{contact.account}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "amount_with_currency",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const transaction = row.original
        const isReceiver = !!currentUser && (
          transaction.receiver.account === currentUser.Account ||
          transaction.receiver.name === currentUser.Name
        )
        const isSender = !!currentUser && (
          transaction.sender.account === currentUser.Account ||
          transaction.sender.name === currentUser.Name
        )

        if (!isSender && !isReceiver) {
          return <span>{transaction.amount_with_currency}</span>
        }

        const incoming = isReceiver
        return (
          <div className={`font-semibold ${incoming ? "text-emerald-600" : "text-orange-600"}`}>
            {incoming ? "+" : "-"}
            {transaction.amount_with_currency}
          </div>
        )
      },
    },
    {
      accessorKey: "cause",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Cause" />
      ),
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="text-slate-600 truncate max-w-xs" title={transaction.cause}>
            {transaction.cause}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const transaction = row.original
        return (
          <div className="text-slate-500 text-sm">
            {formatDate(transaction.created_at_time)}
          </div>
        )
      },
    },
  ]

  useEffect(() => {
    const sessionId = apiClient.getSessionId()
    if (!sessionId) {
      navigate("/")
      return
    }
    window.dispatchEvent(new CustomEvent('yaya:user-changed'))
    fetchTransactions()
  }, [currentPage])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const response = await apiClient.getTransactions(currentPage)
      setCurrentUser(response.user)
      setTransactions(response.transactions.data || [])
      
      if (response.user) {
        localStorage.setItem("yaya_current_user", JSON.stringify(response.user))
      }
    } catch (error) {
      console.error("Error fetching transactions:", error)
      navigate("/")
    } finally {
      setLoading(false)
    }
  }

  const handleRowClick = (row: any) => {
    const transaction = row.original
    // Store the transaction in localStorage so TransactionDetails can access it
    localStorage.setItem("yaya_selected_transaction", JSON.stringify(transaction))
    navigate(`/transaction/${transaction.id}`)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTransactions()
      return
    }

    setLoading(true)
    try {
      const response = await apiClient.searchTransactions(searchQuery)
      setTransactions(response.results.data || [])
    } catch (error) {
      console.error("Error searching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const isIncoming = (transaction: Transaction): boolean => {
    if (!currentUser) return false
    return transaction.receiver.account === currentUser.Account || transaction.receiver.name === currentUser.Name
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search Section */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search transactions by sender, receiver, cause, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} className="flex-1 sm:flex-none">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    fetchTransactions()
                  }}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <PaginationDataTable
              columns={columns}
              data={transactions}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              loading={loading}
              onRowClick={handleRowClick}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

export default Dashboard
