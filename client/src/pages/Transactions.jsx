import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MoneyDisplay from '../components/MoneyDisplay';
import { format } from 'date-fns';
import { Search, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import TransactionModal from '../components/TransactionModal';
import { motion } from 'framer-motion';
import { useRefresh } from '../context/RefreshContext';
import { TransactionsSkeleton } from '../components/Skeleton';

export default function Transactions() {
  const { refreshTrigger } = useRefresh();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sort, setSort] = useState('desc');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setPage(1);
  }, [sort, selectedCategory]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let url = `/transactions?sort=${sort}&page=${page}&limit=10`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      if (selectedCategory !== 'all') url += `&categoryId=${selectedCategory}`;

      const [txRes, catRes] = await Promise.all([
        api.get(url),
        categories.length === 0 ? api.get('/categories') : Promise.resolve({ data: { data: categories } })
      ]);
      setTransactions(txRes.data.data);
      if (txRes.data.pagination) {
        setTotalPages(txRes.data.pagination.pages);
      }
      if (categories.length === 0) {
        setCategories(catRes.data.data);
      }
    } catch (err) {
      // Ignored
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [sort, selectedCategory, page, debouncedSearch, refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this entry?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (err) {
        // Ignored
      }
    }
  };

  const openEdit = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const closeAndRefresh = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    fetchTransactions();
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-cream-secondary pb-8 space-y-6 md:space-y-0">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-ink mb-4">
            Ledger.
          </h1>
          <p className="text-olive text-lg font-light tracking-wide">
            Your financial history, line by line.
          </p>
        </div>
      </header>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-6 items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive" />
            <input
              type="text"
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FDFCF8] border border-cream-secondary rounded-md focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink text-ink placeholder-olive transition-all interactive shadow-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-auto px-4 py-3 bg-[#FDFCF8] border border-cream-secondary rounded-md focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink text-ink transition-all appearance-none cursor-pointer interactive shadow-sm"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 text-xs font-medium uppercase tracking-widest rounded-full transition-all interactive ${
              selectedCategory === 'all' 
                ? 'bg-ink text-cream border border-ink' 
                : 'bg-transparent text-olive border border-cream-secondary hover:border-ink hover:text-ink'
            }`}
          >
            All
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-1.5 text-xs font-medium uppercase tracking-widest rounded-full transition-all interactive ${
                selectedCategory === c._id 
                  ? 'bg-ink text-cream border border-ink' 
                  : 'bg-transparent text-olive border border-cream-secondary hover:border-ink hover:text-ink'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-cream-secondary pt-4 min-h-[400px]">
        {loading && transactions.length === 0 ? (
          <TransactionsSkeleton />
        ) : transactions.length === 0 ? (
          <div className="py-24 text-center">
            <h3 className="font-serif text-2xl text-ink mb-2">No entries found</h3>
            <p className="text-olive font-light">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {transactions.map((tx, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={tx._id} 
                className={`grid grid-cols-12 py-6 border-b border-cream-secondary hover:bg-[#F2EFE6] transition-colors group cursor-pointer interactive px-2 -mx-2 rounded-sm ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                onClick={() => openEdit(tx)}
              >
                <div className="col-span-3 md:col-span-2 text-olive font-light self-center text-sm md:text-base">
                  {format(new Date(tx.date), 'MMM dd')}
                </div>
                
                <div className="col-span-5 md:col-span-6 pr-4 self-center">
                  <div className="font-medium font-serif text-ink group-hover:text-yellow transition-colors text-sm md:text-xl truncate">
                    {tx.description}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`text-[10px] uppercase tracking-widest font-medium ${tx.type === 'EXPENSE' ? 'text-coral' : tx.type === 'INCOME' ? 'text-olive' : 'text-ink'}`}>
                      {tx.type}
                    </span>
                    
                    {/* Mobile-only category and account info */}
                    <div className="md:hidden flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-olive border-l border-cream-secondary pl-2">
                      {tx.categoryId?.name && <span>{tx.categoryId.name}</span>}
                      {tx.categoryId?.name && tx.accountId?.name && <span>•</span>}
                      {tx.accountId?.name && <span>{tx.accountId.name}</span>}
                      {tx.accountId?.type === 'CREDIT_CARD' && (
                        <span className="flex items-center text-yellow ml-0.5">
                          <CreditCard className="w-3 h-3" />
                        </span>
                      )}
                      {tx.type === 'TRANSFER' && (
                        <span className="truncate max-w-[100px]">{tx.sourceAccountId?.name} → {tx.destinationAccountId?.name}</span>
                      )}
                    </div>

                    {tx.notes && (
                      <span className="text-[10px] uppercase tracking-widest text-olive truncate block border-l border-cream-secondary pl-2">{tx.notes}</span>
                    )}
                  </div>
                </div>
                
                <div className="hidden md:flex md:col-span-2 flex-col justify-center items-start text-sm pr-4">
                  {tx.categoryId?.name && (
                    <span className="inline-block px-2 py-1 bg-cream-secondary text-ink rounded-md text-[10px] uppercase tracking-widest font-medium mb-1">
                      {tx.categoryId.name}
                    </span>
                  )}
                  {tx.accountId?.name && (
                    <div className="flex items-center text-[10px] uppercase tracking-widest text-ink/70 flex-wrap gap-2">
                      <span>{tx.accountId.name}</span>
                      {tx.accountId.type === 'CREDIT_CARD' && (
                        <span className="flex items-center text-yellow">
                          <CreditCard className="w-3 h-3 mr-1" />
                          Credit
                        </span>
                      )}
                    </div>
                  )}
                  {tx.type === 'TRANSFER' && (
                    <div className="flex items-center text-[10px] uppercase tracking-widest text-ink/70 mt-1 truncate">
                      {tx.sourceAccountId?.name} → {tx.destinationAccountId?.name}
                    </div>
                  )}
                </div>
                
                <div className="col-span-4 md:col-span-2 flex flex-col items-end justify-center">
                  <div className={`font-serif text-xl md:text-2xl num-tabular ${tx.type === 'INCOME' ? 'text-olive' : 'text-ink'}`}>
                    {tx.type === 'INCOME' ? '+' : ''}₹{(tx.amount / 100).toLocaleString()}
                  </div>
                  <div className="flex items-center space-x-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase tracking-wider text-coral hover:text-red-700 interactive" onClick={(e) => { e.stopPropagation(); handleDelete(tx._id); }}>
                      Delete
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-cream-secondary pt-8 mt-8">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center px-4 py-2 border border-cream-secondary rounded-sm text-sm uppercase tracking-widest font-medium text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Prev
          </button>
          
          <div className="text-sm font-medium text-olive font-serif">
            Page {page} of {totalPages}
          </div>

          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center px-4 py-2 border border-cream-secondary rounded-sm text-sm uppercase tracking-widest font-medium text-ink hover:bg-ink hover:text-cream transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSaved={closeAndRefresh}
        transaction={editingTransaction}
      />
    </div>
  );
}
