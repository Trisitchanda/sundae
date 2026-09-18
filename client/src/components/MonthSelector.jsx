import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';

export default function MonthSelector({ currentDate, setCurrentDate }) {
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={handlePrevMonth} 
        className="p-1 hover:text-[#171717] text-[#62615D] transition-colors rounded"
      >
        <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
      </button>
      <div className="font-serif text-2xl tracking-tight text-[#171717] min-w-[140px] text-center">
        {format(currentDate, 'MMMM yyyy')}
      </div>
      <button 
        onClick={handleNextMonth} 
        className="p-1 hover:text-[#171717] text-[#62615D] transition-colors rounded"
      >
        <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
