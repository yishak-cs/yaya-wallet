import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowRight, Calendar, CreditCard, Hash, User, FileText, CheckCircle, ArrowLeft, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import AppLayout from "@/layout/AppLayout"
import type { Transaction } from "@/types"
import { formatCurrency, formatDate} from "@/lib/utils"

const TransactionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [currentUser, setCurrentUser] = useState<any | null>(null)

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      if (!id) return
      
      try {
        // Get current user info
        const userData = localStorage.getItem("yaya_current_user")
        if (userData) {
          setCurrentUser(JSON.parse(userData))
        }

        // First try to get the transaction from localStorage (if clicked from dashboard)
        const storedTransaction = localStorage.getItem("yaya_selected_transaction")
        if (storedTransaction) {
          const parsedTransaction = JSON.parse(storedTransaction)
          if (parsedTransaction.id === id) {
            setTransaction(parsedTransaction)
            localStorage.removeItem("yaya_selected_transaction") // Clean up
            return
          }
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error)
        navigate("/dashboard")
      } 
    }

    fetchTransactionDetails()
  }, [id, navigate])

  const getStatusIcon = (transaction: Transaction) => {
    if (transaction.is_topup) {
      return <CheckCircle className="w-4 h-4 text-green-500" />
    }
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getStatusVariant = (): "default" | "destructive" | "outline" | "secondary" => {
    return "default"
  }

  if (!transaction) {
    return (
      <AppLayout title="Transaction Details" subtitle="Transaction not found">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center py-12">
            <p className="text-gray-500">Transaction not found</p>
            <Button onClick={() => navigate("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const sender = transaction.sender
  const receiver = transaction.receiver

  return (
    <AppLayout title="Transaction Details" subtitle={`Reference: ${transaction.id}`}>
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-4">
        <div className="mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border-2 border-gray-100 shadow-lg">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500 mb-1">Transaction Amount</p>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words">
                      {formatCurrency(Number(transaction.amount), true, 'en-US', transaction.currency)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <Badge
                      variant={getStatusVariant()}
                      className="text-sm px-3 py-1 font-medium"
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(transaction)}
                        Completed
                      </span>
                    </Badge>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Date & Time</p>
                    <p className="font-medium break-words">{formatDate(transaction.created_at_time)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Transaction Type</p>
                    <p className="font-medium capitalize">{transaction.is_outgoing_transfer ? "Outgoing" : "Incoming"}</p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <p className="text-gray-500 mb-1">Reference</p>
                    <p className="font-medium font-mono text-xs break-all">{transaction.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Transaction Flow
                </h3>
                
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                          {sender?.name?.[0]}{sender?.name?.split(' ')[1]?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {sender?.name}
                        </p>
                        <p className="text-sm text-gray-500 break-all">{sender?.account}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 ml-13">Sender</p>
                  </div>
                  
                  <div className="flex justify-center lg:mx-4">
                    <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 lg:rotate-0" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                          {receiver?.name?.[0]}{receiver?.name?.split(' ')[1]?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">
                          {receiver?.name}
                        </p>
                        <p className="text-sm text-gray-500 break-all">{receiver?.account}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 ml-13">Receiver</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {transaction.cause && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed break-words">{transaction.cause}</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Transaction Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Transaction ID</p>
                    <p className="text-sm text-gray-600 font-mono break-all">{transaction.id}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Amount</p>
                    <p className="text-sm text-gray-600 break-words">{transaction.amount} {transaction.currency}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-600 break-words">{formatDate(transaction.created_at_time)}</p>
                  </div>
                </div>

                {transaction.is_topup && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Transaction Type</p>
                        <p className="text-sm text-green-600">Top-up Transaction</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default TransactionDetails
