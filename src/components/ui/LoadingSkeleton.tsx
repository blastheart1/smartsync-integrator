"use client";

interface LoadingSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function LoadingSkeleton({ rows = 5, columns = 4 }: LoadingSkeletonProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        
        {/* Search bar skeleton */}
        <div className="h-10 bg-gray-200 rounded mb-6"></div>
        
        {/* Table skeleton */}
        <div className="space-y-4">
          {/* Table header */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="animate-pulse">
        <div className="grid md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
