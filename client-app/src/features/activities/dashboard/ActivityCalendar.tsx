
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../../app/stores/store';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { Activity } from '../../../app/models/activity';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default observer(function ActivityCalendar() {
    const { activityStore } = useStore();
    const { activityRegistry } = activityStore;

    const localizer = momentLocalizer(moment);

    const events = Array.from(activityRegistry.values()).map((activity: Activity) => ({
        id: activity.id,
        title: activity.title,
        start: moment(activity.date).toDate(),
        end: moment(activity.date).add(2, 'hours').toDate(),
    }));

    const [ selectedEvent, setSelectedEvent ] = useState(events[0]);

    const navigate = useNavigate();

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        navigate(`/activities/${event.id}`);
    };

    const isEventInPast = (eventDate: Date): boolean => {
        const today = new Date();
        return eventDate < today;
    };

    const isEventInFuture = (eventDate: Date): boolean => {
        const today = new Date();
        return eventDate > today;
    };

    const isEventToday = (eventDate: Date): boolean => {
        const today = new Date();
        return eventDate.getDate() === today.getDate() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getFullYear() === today.getFullYear();
    };

    const eventStyleGetter = (event: any) => {
        let style: React.CSSProperties = {
            //check is event is in past, future or today
            backgroundColor: isEventInPast(event.start) ? '#e0e0e0' : isEventInFuture(event.start) ? '#1b5e20' : '#f57f17',
        };
        return {
            className: "",
            style: style
        };
    };

    return (
        <div style={{ backgroundColor: 'white', paddingTop: '10px', paddingBottom: '10px'}}>
            <h1 style={{ textAlign: 'center', color: 'black' }}>Activities Calendar</h1>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{
                    height: 500,
                    margin: "30px auto",
                    maxWidth: 800,
                    borderRadius: "5px",
                    overflow: "hidden",
                    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                    backgroundColor: "white"
                }}
                views={['month', 'week', 'day']}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
            />
            <div style={{ textAlign: 'center', color: 'red', marginTop: '10px', marginBottom: '10px' }}> *Click on an activity to view details </div>
        </div>
    );
});
