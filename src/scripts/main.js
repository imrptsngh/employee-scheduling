import Calendar from 'tui-calendar';
import moment from 'moment';
import Chance from 'chance';

// All required CSS files
import "tui-calendar/dist/tui-calendar.css";
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';
import WebpackDevServer from 'webpack-dev-server';

// To generate random IDs for schedules
let chance = new Chance();

// Creating calendar object
let cal;
cal = new Calendar('#calendar', {
    defaultView: 'month',
    useCreationPopup: true,
    useDetailPopup: true,
    template: {

        // Title to be shown in the calendar for a limited timed event
        time: function(schedule) {
            console.log("time template was called");

            let html = [];

            // Add time of the event
            let start = moment(schedule.start.toUTCString());
            html.push(start.format('HH:mm'));

            // Add title of the event
            html.push(' '+schedule.title);

            return html.join('');
        },

        // Title to be shown for an allday event
        allday: function(schedule) {
            console.log("allday template was called");
            return schedule.title;
        }
    }
});

// Callbacks for events that happen on the calendar
cal.on({

    // This gets called when a schedule is created.
    'beforeCreateSchedule': function (scheduleData) {
        console.log("before create schedule");

        var schedule = {
            id: String(chance.guid()),
            title: scheduleData.title,
            isAllDay: scheduleData.isAllDay,
            start: scheduleData.start,
            end: scheduleData.end,
            category: scheduleData.isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            color: calendar.color,
            bgColor: calendar.bgColor,
            dragBgColor: calendar.bgColor,
            borderColor: calendar.borderColor,
            location: scheduleData.location,
            raw: {
                class: scheduleData.raw['class']
            },
            state: scheduleData.state
        };

        cal.createSchedules([schedule]);
    },

    // This gets called when a schedule is updated.
    'beforeUpdateSchedule': function(e) {
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
    'beforeDeleteSchedule': function(e) {
        console.log('beforeDeleteSchedule', e);
        cal.deleteSchedule(e.schedule.id, e.schedule.calendarId);
    },
});


function currentCalendarDate(format) {
    var currentDate = moment([cal.getDate().getFullYear(), cal.getDate().getMonth(), cal.getDate().getDate()]);

    return currentDate.format(format);
}

function updateCurrentlyRenderedRange() {
    var renderRange = document.getElementById('currentlyRenderedRange');
    var options = cal.getOptions();
    var viewName = cal.getViewName();

    var html = [];
    if (viewName === 'day') {
        html.push(currentCalendarDate('Do MMM, YYYY'));
    } else if (viewName === 'month') {
        html.push(currentCalendarDate('MMMM, YYYY'));
    } else {
        html.push(moment(cal.getDateRangeStart().getTime()).format(' Do'));
        html.push(' ~ ');
        html.push(moment(cal.getDateRangeEnd().getTime()).format(' Do MMM, YYYY'));
    }
    renderRange.innerHTML = html.join('');
}


function calendarNext(e) {
    console.log("Calendar Next");
    cal.next();
    updateCurrentlyRenderedRange();
}

function calendarPrevious(e) {
    console.log("Calendar Previous");
    cal.prev();
    updateCurrentlyRenderedRange();
}

function calendarToday(e) {
    console.log("Calendar Today");
    cal.today();
    updateCurrentlyRenderedRange();
}

function dailyCalendarView() {
    console.log("Changing calendar view to daily.");
    cal.changeView('day');
    updateCurrentlyRenderedRange();

    var currentCalView = document.getElementById("currentCalendarView");
    currentCalView.innerHTML = 'Daily <span class="caret"></span>';
}

function weeklyCalendarView() {
    console.log("Changing calendar view to weekly.");
    cal.changeView('week');
    updateCurrentlyRenderedRange();

    var currentCalView = document.getElementById("currentCalendarView");
    currentCalView.innerHTML = 'Weekly <span class="caret"></span>';
}

function monthlyCalendarView() {
    console.log("Changing calendar view to monthly.");
    cal.changeView('month');
    updateCurrentlyRenderedRange();

    var currentCalView = document.getElementById("currentCalendarView");
    currentCalView.innerHTML = 'Monthly <span class="caret"></span>';
}


// Callbacks for Next, Prev and Today buttons
document.getElementById("calNext").addEventListener("click", calendarNext);
document.getElementById("calPrev").addEventListener("click", calendarPrevious);
document.getElementById("calToday").addEventListener("click", calendarToday);

// Callbacks for changing calendar view
document.getElementById("dailyCalView").addEventListener("click", dailyCalendarView);
document.getElementById("weeklyCalView").addEventListener("click", weeklyCalendarView);
document.getElementById("monthlyCalView").addEventListener("click", monthlyCalendarView);


// Update the text for the currently rendered range
updateCurrentlyRenderedRange();


function listOfSchedules() {
    let schedules = cal._controller.schedules.items;
    console.log("Get the list of schedule.");
    for(let x in schedules) {
        document.getElementById("scheduleList").innerHTML = x + "<br>";
    }
    console.log(schedules);
    // TODO Send this information back to our servers for processing.
}

document.getElementById("getScheduleBtn").addEventListener("click", listOfSchedules);