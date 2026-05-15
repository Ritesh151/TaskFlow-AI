'use client';
import { motion } from 'framer-motion';
import {
  LogIn, LogOut, Coffee, Brain, CheckCircle2, Play, Pause,
} from 'lucide-react';
import type { TimelineEntry, TimelineAction } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface SessionTimelineProps {
  timeline: TimelineEntry[];
}

const actionConfig: Record<TimelineAction, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  'check-in': { label: 'Checked In', icon: LogIn, color: 'text-green-600', bg: 'bg-green-50' },
  'check-out': { label: 'Checked Out', icon: LogOut, color: 'text-red-600', bg: 'bg-red-50' },
  'break-start': { label: 'Break Started', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
  'break-end': { label: 'Break Ended', icon: Play, color: 'text-blue-600', bg: 'bg-blue-50' },
  'task-completed': { label: 'Task Completed', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
  'deep-work-start': { label: 'Deep Work Started', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  'deep-work-end': { label: 'Deep Work Ended', icon: Pause, color: 'text-gray-600', bg: 'bg-gray-50' },
};

export function SessionTimeline({ timeline }: SessionTimelineProps) {
  if (timeline.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-gray-800">Session Timeline</h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Play className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No activity yet today.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-gray-800">Session Timeline</h3>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-100" />

          <div className="space-y-3">
            {[...timeline].reverse().map((entry, i) => {
              const cfg = actionConfig[entry.action] ?? {
                label: entry.action,
                icon: Play,
                color: 'text-gray-500',
                bg: 'bg-gray-50',
              };
              const Icon = cfg.icon;
              const time = new Date(entry.time).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit',
              });

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 pl-1"
                >
                  {/* Dot */}
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 z-10 ${cfg.bg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{cfg.label}</span>
                    <span className="text-xs text-gray-400 font-mono">{time}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
