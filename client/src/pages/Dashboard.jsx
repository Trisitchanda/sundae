import React, { useState, useEffect } from 'react';
import api from '../services/api';
import MonthSelector from '../components/MonthSelector';
import MoneyDisplay from '../components/MoneyDisplay';
import AnimatedNumber from '../components/AnimatedNumber';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useRefresh } from '../context/RefreshContext';
import { CreditCard } from 'lucide-react';

export default function Dashboard() {
  const { refreshTrigger } = useRefresh();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/summary?year=${year}&month=${month}`);
        setSummary(res.data.data);
      } catch (err) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [year, month, refreshTrigger]);

  return (
    <div className="space-y-24 animate-in fade-in duration-700 pb-24">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-cream-secondary pb-8 space-y-6 md:space-y-0">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-ink mb-4">
            Overview.
          </h1>
        </div>
        <MonthSelector currentDate={currentDate} setCurrentDate={setCurrentDate} />
      </header>

      {/* Main Financial Position */}
      {loading ? (
        <div className="animate-pulse flex flex-col space-y-8">
          <div className="h-24 bg-cream-secondary/50 rounded-sm w-full md:w-2/3"></div>
          <div className="h-32 bg-cream-secondary/30 rounded-sm w-full"></div>
        </div>
      ) : (
        <section className="space-y-16">
          
          <div className="flex flex-col space-y-12">
            <div>
              <div className="text-xs tracking-widest uppercase text-olive font-medium mb-6">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              <div className="font-serif text-6xl md:text-8xl tracking-tight text-ink flex flex-col md:flex-row md:items-baseline gap-4 md:gap-6">
                <AnimatedNumber 
                  value={Math.abs(summary?.remaining || 0) / 100} 
                  prefix={(summary?.remaining || 0) < 0 ? "-₹" : "₹"} 
                />
                <span className={`text-4xl md:text-6xl font-light italic ${(summary?.remaining || 0) < 0 ? 'text-coral' : 'text-olive'}`}>
                  {(summary?.remaining || 0) < 0 ? 'overspent.' : 'still yours.'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-cream-secondary max-w-3xl">
              <div>
                 <AnimatedNumber value={(summary?.totalIncome || 0) / 100} prefix="₹" className="text-3xl text-ink font-serif block mb-1" />
                 <span className="text-sm uppercase tracking-widest text-olive font-medium">earned</span>
              </div>
              <div>
                 <AnimatedNumber value={(summary?.totalSpent || 0) / 100} prefix="₹" className="text-3xl text-ink font-serif block mb-1" />
                 <span className="text-sm uppercase tracking-widest text-coral font-medium">spent</span>
              </div>
              <div>
                 <AnimatedNumber value={(summary?.outstandingCredit || 0) / 100} prefix="₹" className="text-3xl text-ink font-serif block mb-1" />
                 <span className="text-sm uppercase tracking-widest text-yellow font-medium block">credit bill</span>
                 <span className="text-[10px] uppercase tracking-widest text-olive block mt-0.5 opacity-80">due next month</span>
              </div>
            </div>

            {/* Progress Bar replaced by minimalist line */}
            <div className="mt-8 h-1 w-full bg-cream-secondary rounded-full overflow-hidden flex max-w-3xl">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(summary?.spendingPercentage || 0, 100)}%` }}
                transition={{ duration: 1, type: "spring", bounce: 0 }}
                className="h-full bg-coral" 
              />
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(100 - (summary?.spendingPercentage || 0), 0)}%` }}
                transition={{ duration: 1, type: "spring", bounce: 0 }}
                className="h-full bg-olive" 
              />
            </div>
          </div>
          
        </section>
      )}

      {/* Recent Ledger Preview */}
      {!loading && (
        <section className="pt-16">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-xs uppercase tracking-widest text-olive font-medium">Recent Entries</h3>
          </div>

          <div className="border-t border-cream-secondary">
            {summary?.recentTransactions?.length === 0 ? (
              <div className="py-12 text-center text-olive font-light">
                No entries recorded for this month yet.
              </div>
            ) : (
              summary?.recentTransactions?.map((tx, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={tx._id} 
                  className="grid grid-cols-12 py-6 border-b border-cream-secondary hover:bg-[#F2EFE6] transition-colors group px-2 -mx-2 rounded-sm cursor-pointer interactive"
                >
                  <div className="col-span-3 md:col-span-2 text-olive font-light text-sm md:text-base self-center">
                    {format(new Date(tx.date), 'MMM dd')}
                  </div>
                  <div className="col-span-5 md:col-span-6 pr-4 self-center">
                    <div className="font-medium font-serif text-ink group-hover:text-yellow transition-colors text-sm md:text-lg truncate">
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
                  <div className="col-span-4 md:col-span-2 text-right self-center num-tabular text-ink font-serif text-lg">
                     ₹{(tx.amount / 100).toLocaleString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      )}

    </div>
  );
}
