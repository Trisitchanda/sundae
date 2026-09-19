import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatCurrency } from '../utils/format';
import { format, subYears, addYears } from 'date-fns';
import {
  BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useRefresh } from '../context/RefreshContext';
import AiAnalyst from '../components/AiAnalyst';
import { Sparkles, ArrowRight, AlertCircle } from 'lucide-react';
import MagneticButton from '../components/MagneticButton';
import { AnalyticsSkeleton } from '../components/Skeleton';

// Curated premium Warm Money aesthetic colors for charts
const CHART_COLORS = ['#171714', '#E8D75A', '#C87855', '#7C8060', '#A2AA8A', '#D4AC83', '#EEE8D8'];

export default function Analytics() {
  const { refreshTrigger } = useRefresh();
  const [currentYearDate, setCurrentYearDate] = useState(new Date());
  const year = currentYearDate.getFullYear();
  const month = new Date().getMonth() + 1;

  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiGeneratedAt, setAiGeneratedAt] = useState(null);
  const [savingsGoal, setSavingsGoal] = useState('50%');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [trendRes, categoryRes] = await Promise.all([
          api.get(`/analytics/monthly-trend?year=${year}`),
          api.get(`/analytics/category?year=${year}&month=${month}`)
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedTrend = trendRes.data.data.map(d => ({
          ...d,
          name: months[d.month - 1],
          spentRaw: d.spent / 100,
          incomeRaw: d.income / 100
        }));

        setMonthlyTrend(formattedTrend);
        setCategoryBreakdown(categoryRes.data.data.map(d => ({ ...d, totalRaw: d.total / 100 })));
      } catch (err) {
        // Ignored
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [year, month, refreshTrigger]);

  const fetchAi = async (forceRefresh = false) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post('/ai/analyze', { period: 'current_month', forceRefresh, savingsGoal });
      setAiInsight({
        ...res.data.data,
        budgetSnapshot: res.data.budgetSnapshot
      });
      setAiGeneratedAt(res.data.generatedAt);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to fetch AI insights.');
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchAi();
    }
  }, [loading, refreshTrigger]);

  const handlePrevYear = () => setCurrentYearDate(subYears(currentYearDate, 1));
  const handleNextYear = () => setCurrentYearDate(addYears(currentYearDate, 1));

  const totalMonthlySpend = categoryBreakdown.reduce((sum, item) => sum + item.totalRaw, 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cream border border-cream-secondary p-4 shadow-xl">
          <p className="text-olive text-xs uppercase tracking-widest mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-6 mb-1">
              <div className="flex items-center">
                {entry.payload && entry.payload.fill && (
                   <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.payload.fill }}></span>
                )}
                <span className="text-ink font-medium">{entry.name}</span>
              </div>
              <span className="num-tabular text-ink font-serif text-lg">₹{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-16 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-cream-secondary pb-8 space-y-6 md:space-y-0">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-ink mb-4">
            Analytics.
          </h1>
          <p className="text-olive text-lg font-light tracking-wide">
            Detailed breakdown of your financial flow.
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevYear} className="text-olive hover:text-ink transition-colors uppercase tracking-widest text-xs font-medium interactive">Prev</button>
          <span className="font-serif text-2xl tracking-tight text-ink">{year}</span>
          <button onClick={handleNextYear} className="text-olive hover:text-ink transition-colors uppercase tracking-widest text-xs font-medium interactive">Next</button>
        </div>
      </header>

      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <div className="space-y-24">
          
          <AiAnalyst insight={aiInsight} loading={aiLoading} error={aiError} generatedAt={aiGeneratedAt} />

          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-serif text-3xl tracking-tight text-ink">Annual Trend</h3>
              <div className="flex space-x-4 text-xs font-medium uppercase tracking-widest text-olive">
                <div className="flex items-center"><span className="w-3 h-3 bg-[#E8D75A] mr-2"></span>Income</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-[#171714] mr-2"></span>Spend</div>
              </div>
            </div>
            
            <div className="h-[400px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend} margin={{ top: 20, right: 0, left: 0, bottom: 24 }} barGap={4}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#EEE8D8', strokeWidth: 1 }} 
                    tickLine={false} 
                    tick={{ fill: '#7C8060', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }} 
                    dy={16} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F7F3E8', opacity: 0.8 }} />
                  <Bar dataKey="incomeRaw" name="Income" fill="#E8D75A" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="spentRaw" name="Expenses" fill="#171714" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid md:grid-cols-2 gap-16 border-t border-cream-secondary pt-16">
            <div>
              <h3 className="font-serif text-3xl tracking-tight text-ink mb-8">Current Month</h3>
              <div className="space-y-6">
                {categoryBreakdown.length > 0 ? (
                  categoryBreakdown.map((cat, idx) => {
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    return (
                      <div key={idx} className="border-b border-cream-secondary pb-4 group">
                        {(() => {
                          const snapshotCategory = aiInsight?.budgetSnapshot?.categories?.find(c => c.categoryId.toString() === cat.categoryId.toString());
                          const isHardLimit = cat.budgetLimit != null;
                          const displayLimitRaw = isHardLimit ? (cat.budgetLimit / 100) : snapshotCategory?.recommendedBudget;
                          const hasLimit = displayLimitRaw != null;
                          const actualPercent = hasLimit ? (displayLimitRaw > 0 ? Math.round((cat.totalRaw / displayLimitRaw) * 100) : (cat.totalRaw > 0 ? 100 : 0)) : 0;
                          const progressPercent = Math.min(100, actualPercent);
                          const overLimit = hasLimit && cat.totalRaw > displayLimitRaw;
                          
                          return (
                            <>
                              <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center space-x-3">
                                  <span 
                                    className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" 
                                    style={{ backgroundColor: color }}
                                  ></span>
                                  <span className="text-olive group-hover:text-ink transition-colors font-medium tracking-wide uppercase text-sm">{cat.categoryName}</span>
                                </div>
                                <div className="text-right">
                                  {hasLimit ? (
                                    <div className="text-sm text-olive mb-1">
                                      <span className="font-medium text-ink">₹{cat.totalRaw.toLocaleString()}</span> / ₹{displayLimitRaw.toLocaleString()}
                                    </div>
                                  ) : (
                                    <span className="num-tabular text-ink font-serif text-2xl group-hover:text-yellow transition-colors">₹{cat.totalRaw.toLocaleString()}</span>
                                  )}
                                </div>
                              </div>
                              
                              {hasLimit && (
                                <div className="flex items-center space-x-4 mb-2 pl-6 pr-4">
                                  <div className="flex-1 h-2 bg-cream-secondary rounded-full overflow-hidden relative">
                                    <div 
                                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${overLimit ? 'bg-coral' : 'bg-ink'}`}
                                      style={{ width: `${progressPercent}%` }}
                                    >
                                      {overLimit && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                      )}
                                    </div>
                                  </div>
                                  <span className={`text-xs font-medium num-tabular ${overLimit ? 'text-coral' : 'text-ink'}`}>
                                    {actualPercent}%
                                  </span>
                                </div>
                              )}
                              
                              {hasLimit && overLimit && (
                                <div className="pl-6 pr-4 mb-3 mt-1">
                                  <span className="inline-flex items-center px-2.5 py-1 bg-coral/10 text-coral border border-coral/20 rounded-md text-[10px] font-semibold tracking-wider uppercase shadow-sm">
                                    <AlertCircle className="w-3 h-3 mr-1.5" />
                                    ₹{(cat.totalRaw - displayLimitRaw).toLocaleString()} over {isHardLimit ? 'limit' : 'recommended'}
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                        
                        {/* Category Insight UI */}
                        {aiLoading && (
                          <div className="text-olive/70 text-xs font-light flex items-center mt-2 animate-pulse pl-6">
                            <Sparkles className="w-3 h-3 mr-2" /> Analyzing your spending...
                          </div>
                        )}
                        
                        {aiInsight && !aiLoading && aiInsight.categoryInsights && (
                          aiInsight.categoryInsights.find(insight => insight.categoryId === cat.categoryId.toString()) && (
                            <div className="text-olive text-sm font-light mt-2 pl-6 leading-relaxed pr-4">
                              <span className="text-ink font-medium mr-2">✦</span>
                              {aiInsight.categoryInsights.find(insight => insight.categoryId === cat.categoryId.toString()).suggestion}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-olive font-light">No categorical data this month.</p>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              {categoryBreakdown.length > 0 ? (
                <div className="relative w-full aspect-square max-w-sm">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="80%"
                        paddingAngle={2}
                        dataKey="totalRaw"
                        nameKey="categoryName"
                        stroke="none"
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs uppercase tracking-widest text-olive mb-1">Total</span>
                    <span className="font-serif text-4xl tracking-tight text-ink num-tabular">
                      ₹{totalMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="w-full aspect-square max-w-sm rounded-full border border-cream-secondary flex items-center justify-center text-olive">
                  No Data
                </div>
              )}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
