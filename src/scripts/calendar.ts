
// TODO Unable to import ISchedule and TZDate fix it.
import Calendar, {ISchedule, TZDate} from 'tui-calendar';
import * as moment from 'moment';
import {CreationModal, scheduleDetailPopup} from './modal';

// Creating calendar object
var cal;
cal = new Calendar('#calendar', {
    defaultView: 'month',
    useCreationPopup: false,
    useDetailPopup: false,
    template: {

        // Title to be shown in the calendar for a limited timed event
        time: function (schedule: ISchedule) {
            console.log("time template was called");

            let html = [];

            // Add time of the event
            let start = moment((schedule.start as TZDate).toUTCString());
            html.push(start.format('HH:mm'));

            // Add title of the event
            html.push(' ' + schedule.title);

            return html.join('');
        },

        // Title to be shown for an allday event
        allday: function (schedule) {
            console.log("allday template was called");
            return schedule.title;
        }
    }
});

// Callbacks for events that happen on the calendar
cal.on({
    // This gets called when a schedule is created.
    'beforeCreateSchedule': function (scheduleData) {
        console.log("beforeCreateSchedule: scheduleData -> ", scheduleData);
        let modal = new CreationModal(scheduleData.start, scheduleData.end);
        modal.open();
        scheduleData.guide.clearGuideElement();
    },

    // This gets called when a schedule is updated.
    'beforeUpdateSchedule': function (e) {
        var schedule = e.schedule;
        var changes = e.changes;

        console.log('beforeUpdateSchedule event called.');

        // If the schedule is no longer an allday event, mark it accordingly
        if (changes && !changes.isAllDay && schedule.category === 'allday') {
            changes.category = 'time';
        }

        cal.updateSchedule(schedule.id, schedule.calendarId, changes);
    },

    // This gets called when a scehdule is deleted.
    'beforeDeleteSchedule': function (e) {
        console.log('beforeDeleteSchedule', e);
        cal.deleteSchedule(e.schedule.id, e.schedule.calendarId);
    },

    'clickSchedule': function (event) {
        let schedule = event.schedule;
        console.log("A schedule was clicked -> ", schedule);

        scheduleDetailPopup(schedule);
    }
});

export {cal};