import React from 'react';
import { Link } from 'react-router-dom';
import { Laptop, Baby, Utensils, MoreHorizontal } from 'lucide-react';

const CATEGORIES = [
  { name: 'Kids', icon: Baby, color: 'bg-blue-600' },
  { name: 'Laptop', icon: Laptop, color: 'bg-purple-600' },
  { name: 'Kitchen', icon: Utensils, color: 'bg-green-600' },
  { name: 'Other', icon: MoreHorizontal, color: 'bg-gray-600' },
];

export const CategoriesSection: React.FC = () => {
  return (
    <section className="py-12 px-4 md:px-12 space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold">Browse by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.name}
            href={`#${cat.name.toLowerCase()}`}
            className={`group relative h-32 md:h-40 rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 transition-all hover:scale-105 ${cat.color} shadow-lg shadow-black/20`}
          >
            <cat.icon className="w-8 h-8 md:w-12 md:h-12 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg md:text-xl">{cat.name}</span>
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </div>
    </section>
  );
};
