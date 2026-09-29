import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableSkeleton from '../ui/TableSkeleton';

const Transaction = ({ isVsreOwner, subTab, setSubTab }) => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    count: 0,
    totalPages: 0,
    currentPage: 1,
    next: null,
    previous: null,
  });

  // Fetch transactions from API
  const fetchTransactions = async (url = null) => {
    setIsLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('access_token');
      if (!accessToken) {
        setError('Authorization token missing. Please log in again.');
        setIsLoading(false);
        return;
      }

      // If URL is provided, use it directly; otherwise use base URL
      const apiUrl = url || `${import.meta.env.VITE_BASEURL}`.replace(/\/$/, '') + '/payroll/salary-transactions/';
      
      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data) {
        setTransactions(response.data.results || []);
        setPagination({
          count: response.data.count || 0,
          totalPages: response.data.total_pages || 1,
          currentPage: response.data.current_page || 1,
          next: response.data.next,
          previous: response.data.previous,
        });
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to fetch transactions. Please try again.';
      setError(errorMessage);
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next page
  const handleNext = () => {
    if (pagination.next) {
      fetchTransactions(pagination.next);
    }
  };

  // Handle previous page
  const handlePrevious = () => {
    if (pagination.previous) {
      fetchTransactions(pagination.previous);
    }
  };

  useEffect(() => {
    if (isVsreOwner) {
      fetchTransactions();
    }
  }, [isVsreOwner]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isVsreOwner) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 border-2 border-gray-200 text-center">
        <p className="text-gray-700 text-lg font-medium mb-2">Only VSRE_OWNERs can access this section.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">My Transactions</h3>
          {pagination.count > 0 && (
            <span className="text-xs text-gray-600">
              Total Transactions: {pagination.count}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-3">
            <p className="text-red-700 text-xs font-medium">{error}</p>
          </div>
        )}

        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 text-center">
            <p className="text-gray-600 text-sm">No transaction records found.</p>
            <p className="text-xs text-gray-500 mt-1">Transaction data will appear here once records are available.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Amount Paid
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Processed At
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs font-mono font-medium text-gray-900">
                          {transaction.transaction_id}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-900">{transaction.employee_name}</span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-900">
                          <div>{formatDate(transaction.start_date)}</div>
                          <div className="text-[10px] text-gray-500">to {formatDate(transaction.end_date)}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-right">
                        <span className="text-xs font-semibold text-green-700">
                          ₹{parseFloat(transaction.amount_paid || 0).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                          {transaction.payment_method || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            transaction.status === 'SUCCESS'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : transaction.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {transaction.status || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="text-xs text-gray-600">
                          {formatDateTime(transaction.processed_at)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-xs text-gray-600">
                          {transaction.note || '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {transactions.length > 0 && (
              <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages || 1}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrevious}
                    disabled={!pagination.previous}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      !pagination.previous
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!pagination.next}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                      !pagination.next
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transaction;

