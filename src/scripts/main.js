import Calendar from 'tui-calendar';
import moment from 'moment';

// All required CSS files
import "tui-calendar/dist/tui-calendar.css";


// Creating calendar object
let cal;
cal = new Calendar('#calendar', {
    defaultView: 'month',
    useCreationPopup: true,
    useDetailPopup: true,
    template: {
        milestone: function (model) {
            return '<span class="calendar-font-icon ic-milestone-b"></span> <span style="background-color: ' + model.bgColor + '">' + model.title + '</span>';
        },
        allday: function (schedule) {
            return getTimeTemplate(schedule, true);
        },
        time: function (schedule) {
            return getTimeTemplate(schedule, false);
        }
    }
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
    cal.changeView('day');
    updateCurrentlyRenderedRange();

    var currentCalView = document.getElementById("currentCalendarView");
    currentCalView.innerHTML = 'Daily <span class="caret"></span>';
}

function weeklyCalendarView() {
    cal.changeView('week');
    updateCurrentlyRenderedRange();

    var currentCalView = document.getElementById("currentCalendarView");
    currentCalView.innerHTML = 'Weekly <span class="caret"></span>';
}

function monthlyCalendarView() {
    cal.changeView('month');
    updateCurrentlyRenderedRange();

    var currentCalView = document.getElementById("currentCalendarView");
    currentCalView.innerHTML = 'Monthly <span class="caret"></span>';
}


// Registering event listeners for next, prev, and today
document.getElementById("calNext").addEventListener("click", calendarNext);
document.getElementById("calPrev").addEventListener("click", calendarPrevious);
document.getElementById("calToday").addEventListener("click", calendarToday);

// Callback for changing calendar view
document.getElementById("dailyCalView").addEventListener("click", dailyCalendarView);
document.getElementById("weeklyCalView").addEventListener("click", weeklyCalendarView);
document.getElementById("monthlyCalView").addEventListener("click", monthlyCalendarView);


// Update the text for the currently rendered range
updateCurrentlyRenderedRange();