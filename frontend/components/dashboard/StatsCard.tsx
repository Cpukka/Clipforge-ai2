'use client'

import { ElementType } from 'react'

interface StatsCardProps {
  title: string
  value: number
  icon: ElementType
  trend: string
  color: 'blue' | 'purple' | 'green' | 'yellow'
}

const colorClasses = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
}

export default function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <span className="text-green-400 text-sm">{trend}</span>
      </div>
      <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
    </div>
  )
}