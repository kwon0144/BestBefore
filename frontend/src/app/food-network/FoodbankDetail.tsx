'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './(components)/ui/card';
import { Badge } from './(components)/ui/badge';
import { Clock, MapPin, Calendar, ArrowRight } from 'lucide-react';

interface Foodbank {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  hours_of_operation: string;
  operation_schedule: {
    is_24_hours: boolean;
    days: string[];
    hours: string | null;
    raw_text: string;
    daily_schedule: {
      [key: string]: {
        is_open: boolean;
        hours: string | null;
      }
    }
  };
}

interface FoodbankDetailProps {
  foodbank: Foodbank | null;
}

const FoodbankDetail: React.FC<FoodbankDetailProps> = ({ foodbank }) => {
  if (!foodbank) {
    return null;
  }

  const formatDays = (days: string[]) => {
    if (days.length === 7) return 'Daily';
    if (days.length === 0) return 'Closed';
    
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekend = ['saturday', 'sunday'];
    
    if (days.length === 5 && weekdays.every(day => days.map(d => d.toLowerCase()).includes(day))) {
      return 'Weekdays';
    }
    
    if (days.length === 2 && weekend.every(day => days.map(d => d.toLowerCase()).includes(day))) {
      return 'Weekends';
    }
    
    return days.map(day => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()).join(', ');
  };

  const daySchedule = [
    { day: 'Monday', key: 'monday' },
    { day: 'Tuesday', key: 'tuesday' },
    { day: 'Wednesday', key: 'wednesday' },
    { day: 'Thursday', key: 'thursday' },
    { day: 'Friday', key: 'friday' },
    { day: 'Saturday', key: 'saturday' },
    { day: 'Sunday', key: 'sunday' },
  ];

  // Format the hours for display
  const formatHours = (hoursString: string | null) => {
    if (!hoursString) return "Hours not specified";
    
    // If hours are in a format like "8:30-16:30", convert to "8:30 AM - 4:30 PM"
    if (hoursString.includes('-')) {
      const [start, end] = hoursString.split('-');
      
      // Parse start time
      const startParts = start.split(':');
      let startHour = parseInt(startParts[0], 10);
      const startMin = startParts.length > 1 ? startParts[1] : '00';
      const startAmPm = startHour >= 12 ? 'PM' : 'AM';
      startHour = startHour > 12 ? startHour - 12 : (startHour === 0 ? 12 : startHour);
      
      // Parse end time
      const endParts = end.split(':');
      let endHour = parseInt(endParts[0], 10);
      const endMin = endParts.length > 1 ? endParts[1] : '00';
      const endAmPm = endHour >= 12 ? 'PM' : 'AM';
      endHour = endHour > 12 ? endHour - 12 : (endHour === 0 ? 12 : endHour);
      
      return `${startHour}:${startMin} ${startAmPm} - ${endHour}:${endMin} ${endAmPm}`;
    }
    
    return hoursString;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle>{foodbank.name}</CardTitle>
          <Badge variant={foodbank.operation_schedule.is_24_hours ? "default" : "outline"}>
            {foodbank.operation_schedule.is_24_hours ? "Open 24 Hours" : formatDays(foodbank.operation_schedule.days)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 mr-2 mt-0.5 text-gray-500" />
            <div>
              <h4 className="font-semibold">Location</h4>
              <p>{foodbank.address || "Address not available"}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Clock className="w-5 h-5 mr-2 mt-0.5 text-gray-500" />
            <div className="flex-1">
              <h4 className="font-semibold">Opening Hours</h4>
              
              {foodbank.operation_schedule.is_24_hours ? (
                <p className="text-green-600 font-medium">Open 24 hours, every day</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {daySchedule.map((item) => {
                    const daySchedule = foodbank.operation_schedule.daily_schedule[item.key];
                    const isOpen = daySchedule?.is_open || false;
                    const hours = daySchedule?.hours || null;
                    
                    return (
                      <div key={item.day} className="flex items-center justify-between border-b border-gray-100 pb-1">
                        <span className="font-medium">{item.day}</span>
                        <span className={isOpen ? "text-green-600" : "text-gray-400"}>
                          {isOpen ? formatHours(hours) : "Closed"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center"
              onClick={() => {
                // Use address for directions if available, otherwise fall back to coordinates
                const destination = foodbank.address ? 
                  encodeURIComponent(foodbank.address) : 
                  `${foodbank.latitude},${foodbank.longitude}`;
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
              }}
            >
              Get Directions
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodbankDetail;