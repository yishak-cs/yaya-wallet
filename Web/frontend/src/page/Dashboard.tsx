import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Transaction, User } from '@/types';
import { apiClient } from '../api/services';

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is selected
    const sessionId = apiClient.getSessionId();
    if (!sessionId) {
      navigate('/');
      return;
    }

    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getTransactions(currentPage);
      setCurrentUser(response.user);
      setTransactions(response.transactions.data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      // If session is invalid, redirect to user selection
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchTransactions();
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.searchTransactions(searchQuery);
      setTransactions(response.results.data || []);
    } catch (error) {
      console.error('Error searching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const isIncoming = (transaction: Transaction): boolean => {
    if (!currentUser) return false;
    return transaction.receiver.account === currentUser.Account ||
           transaction.receiver.name === currentUser.Name;
  };

  const handleUserChange = () => {
    apiClient.setSessionId('');
    localStorage.removeItem('yaya_session_id');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Transaction Dashboard
            </h1>
            {currentUser && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">{currentUser.Name}</div>
                  <div className="text-sm text-gray-500">@{currentUser.Account}</div>
                </div>
                <button
                  onClick={handleUserChange}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Switch User
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex space-x-4">
          <input
            type="text"
            placeholder="Search transactions by sender, receiver, cause, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchQuery('');
              fetchTransactions();
            }}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Direction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From/To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cause
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => {
                  const incoming = isIncoming(transaction);
                  return (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            incoming
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {incoming ? '← Incoming' : '→ Outgoing'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {incoming ? transaction.sender.name : transaction.receiver.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          @{incoming ? transaction.sender.account : transaction.receiver.account}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={incoming ? 'text-green-600' : 'text-red-600'}>
                          {incoming ? '+' : '-'}{transaction.amount_with_currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.cause}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.created_at_time * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;