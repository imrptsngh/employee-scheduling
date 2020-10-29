import Calendar from 'tui-calendar';
import moment from 'moment';
import Chance from 'chance';
import datetimepicker from 'pc-bootstrap4-datetimepicker/build/js/bootstrap-datetimepicker.min.js';

// All required CSS files
import "tui-calendar/dist/tui-calendar.css";
import 'pc-bootstrap4-datetimepicker/build/css/bootstrap-datetimepicker.min.css';

// Created by us
import { cal } from "./calendar";

let chance = new Chance();


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

function publishCalendar() {
    let schedules = cal._controller.schedules.items;
    console.log("Get the list of schedule -> ", schedules);

    // TODO Send this information back to our servers for processing.
}

function fillUpCalendarInitially() {
    console.log("Setup initial calendar. Using data from server.");
    // TODO Fetch values from Server
    // fetch('http://example.com/movies.json')
    //     .then(response => response.json())
    //     .then(function(data) {
    //         console.log("Received data from server: ");
    //         console.log(data);

    //         cal.createSchedules(data);
    //         cal.render(true);
    //     });

}


document.addEventListener("DOMContentLoaded", function () {

    // Callbacks for Next, Prev and Today buttons
    document.getElementById("calNext").addEventListener("click", calendarNext);
    document.getElementById("calPrev").addEventListener("click", calendarPrevious);
    document.getElementById("calToday").addEventListener("click", calendarToday);

    // Callbacks for changing calendar view
    document.getElementById("dailyCalView").addEventListener("click", dailyCalendarView);
    document.getElementById("weeklyCalView").addEventListener("click", weeklyCalendarView);
    document.getElementById("monthlyCalView").addEventListener("click", monthlyCalendarView);

    // Publish Button callback
    document.getElementById("publishCalendar").addEventListener("click", publishCalendar);

    // Update the text for the currently rendered range
    updateCurrentlyRenderedRange();
    fillUpCalendarInitially();

});