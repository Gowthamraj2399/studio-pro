import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getMyEvents, myEventsQueryKey } from "../../lib/event-access";

export const MyEventsView: React.FC = () => {
  const navigate = useNavigate();
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: myEventsQueryKey,
    queryFn: getMyEvents,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-16 flex items-center justify-center gap-2 text-slate-500">
        <span className="material-symbols-outlined animate-spin text-4xl">
          progress_activity
        </span>
        <span>Loading your events…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-16 text-center">
        <p className="text-red-600 dark:text-red-400 font-medium">
          {error instanceof Error ? error.message : "Failed to load events."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-black tracking-tight mb-2">My events</h1>
        <p className="text-slate-500 font-medium">
          Events you’ve joined via a link. Open one to view photos and build your album.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-slate-500 dark:text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-4 block">
            event_available
          </span>
          <p className="font-medium">No events yet</p>
          <p className="text-sm mt-1">
            Use a link shared by your photographer to join an event.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event) => (
            <div
              key={event.projectId}
              onClick={() => navigate(`/event/${event.token}`)}
              className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={event.thumbnail}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-4 text-slate-400 text-sm">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-base">
                      calendar_today
                    </span>
                    {event.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
