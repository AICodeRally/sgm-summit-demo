'use client';

import React, { useState, useMemo } from 'react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DotFilledIcon,
  ClockIcon,
  PersonIcon,
  CheckCircledIcon,
  FileTextIcon,
} from '@radix-ui/react-icons';
import {
  CALENDAR_EVENTS,
  EVENT_TYPE_INFO,
  CALENDAR_STATS,
  getEventsForDate,
  getEventsForMonth,
  CalendarEvent,
  EventType,
} from '@/lib/data/synthetic/calendar.data';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [filterEventType, setFilterEventType] = useState<string>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get events for current month
  const monthEvents = useMemo(() => getEventsForMonth(year, month + 1), [year, month]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (filterEventType === 'all') return monthEvents;
    return monthEvents.filter(event => event.type === filterEventType);
  }, [monthEvents, filterEventType]);

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Calendar helpers
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];

    // Empty cells before first day
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);
      days.push({ day, dateStr, events: dayEvents });
    }

    return days;
  }, [year, month, daysInMonth, firstDayOfMonth]);

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Get event type color
  const getEventColor = (type: EventType) => {
    return EVENT_TYPE_INFO[type]?.color || '#6b7280';
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-fuchsia-50 to-yellow-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-yellow-600 bg-clip-text text-transparent">
                Governance Calendar
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Unified timeline of governance events and deadlines
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="bg-purple-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-purple-700">{CALENDAR_STATS.upcomingEvents}</span>
                <span className="text-purple-600 ml-1">upcoming</span>
              </div>
              <div className="bg-red-100 px-3 py-1 rounded-full">
                <span className="font-semibold text-red-700">{CALENDAR_STATS.criticalEvents}</span>
                <span className="text-red-600 ml-1">critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Calendar */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Calendar Controls */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-purple-50 rounded transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
                  {monthNames[month]} {year}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-purple-50 rounded transition-colors"
                >
                  <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <button
                onClick={goToToday}
                className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Today
              </button>
            </div>

            {/* Event Type Filter */}
            <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
              <button
                onClick={() => setFilterEventType('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterEventType === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-purple-200'
                }`}
              >
                All Events ({monthEvents.length})
              </button>
              {Object.entries(EVENT_TYPE_INFO).map(([key, info]) => {
                const count = monthEvents.filter(e => e.type === key).length;
                if (count === 0) return null;
                return (
                  <button
                    key={key}
                    onClick={() => setFilterEventType(key)}
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                      filterEventType === key
                        ? 'text-white border-transparent'
                        : 'bg-white text-gray-700 hover:bg-purple-50 border-purple-200'
                    }`}
                    style={{
                      backgroundColor: filterEventType === key ? info.color : undefined,
                    }}
                  >
                    {info.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200 overflow-hidden">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-purple-200 bg-purple-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-3 text-center text-xs font-semibold text-purple-700 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((dayData, index) => {
                if (!dayData) {
                  return <div key={`empty-${index}`} className="min-h-[120px] border-r border-b border-purple-200 bg-gray-50"></div>;
                }

                const { day, dateStr, events } = dayData;
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const displayEvents = filterEventType === 'all'
                  ? events
                  : events.filter(e => e.type === filterEventType);

                return (
                  <div
                    key={dateStr}
                    className={`min-h-[120px] border-r border-b border-purple-200 p-2 cursor-pointer transition-all ${
                      isSelected ? 'bg-purple-100' : 'hover:bg-purple-50'
                    }`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday
                        ? 'w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white'
                        : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {displayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className="text-xs px-2 py-1 rounded text-white truncate"
                          style={{ backgroundColor: getEventColor(event.type) }}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {displayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 px-2">
                          +{displayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-purple-200 p-4 mt-6">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Event Types
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(EVENT_TYPE_INFO).map(([key, info]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: info.color }}
                  ></div>
                  <span className="text-xs text-gray-700">{info.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Selected Date Details */}
        {selectedDate && selectedDateEvents.length > 0 && (
          <div className="w-96 border-l border-purple-200 bg-white/90 backdrop-blur-sm overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateEvents.map(event => {
                  const eventInfo = EVENT_TYPE_INFO[event.type];
                  return (
                    <div
                      key={event.id}
                      className="bg-white border border-purple-200 rounded-lg p-4 hover:shadow-md transition-all"
                    >
                      {/* Event Type Badge */}
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: eventInfo.color }}
                        >
                          {eventInfo.name}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(event.priority)}`}
                        >
                          {event.priority}
                        </span>
                      </div>

                      {/* Event Title */}
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {event.title}
                      </h4>

                      {/* Event Time */}
                      {event.startTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <ClockIcon className="w-4 h-4" />
                          <span>{event.startTime} {event.endTime && `- ${event.endTime}`}</span>
                        </div>
                      )}

                      {/* Event Location */}
                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {/* Event Description */}
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                          {event.description}
                        </p>
                      )}

                      {/* Related Document */}
                      {event.relatedDocCode && (
                        <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
                          <FileTextIcon className="w-4 h-4" />
                          <span className="font-medium">{event.relatedDocCode}</span>
                        </div>
                      )}

                      {/* Attendees */}
                      {event.attendees && event.attendees.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <PersonIcon className="w-3 h-3" />
                            <span className="font-medium">Attendees ({event.attendees.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.attendees.map((attendee, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs"
                              >
                                {attendee}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Status Indicator */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {event.status === 'COMPLETED' ? (
                            <CheckCircledIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <DotFilledIcon className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-600">{event.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
