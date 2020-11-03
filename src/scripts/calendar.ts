import Calendar, {ISchedule, TZDate} from 'tui-calendar';
import * as moment from 'moment';
import {CreationModal, DetailModal} from './modal';
import Ractive from "ractive";
import * as jq from "jquery";


export class MyCalendar {
    calendarID: string;
    calendar: Calendar;
    template: string;
    templateID: string;
    target: string
    targetID: string;
    r: Ractive;
    landingSiteID: string;  // The ID of the element where Calendar will unpack itself and setup it's home :D

    constructor() {
        console.debug("constructor called");

        let outerThis = this;
        this.calendarID = "calendar";
        this.templateID = "calendar-template";
        this.targetID = "calendar-target";
        this.landingSiteID = "landing-site-for-calendar";

        this.template = `
        <script id="${this.templateID}" type="text/ractive">
            
            <!-- Publish schedule button -->
            <div class="row mt-2">
                <div class="col-sm">
                    <button type="button" class="btn btn-secondary float-right" id="publishCalendar">Publish
                        Schedule</button>
                </div>
            </div>
    
            <div class="row mt-2">
                <div class="mx-auto">
                    <h3 align="center">{{ currentlyRenderedRange }}</h3>
                </div>
            </div>
    
            <div class="row">
    
                <div class="col-sm d-flex justify-content-center">
    
                    <div class="btn-group" role="group" aria-label="Basic example">
                        <button type="button" class="btn btn-secondary" on-click="@.fire('calPrev')">&lt; Prev</button>
                        <button type="button" class="btn btn-secondary" on-click="@.fire('calNext')">Next &gt;</button>
                      </div>
    
                </div>
    
    
                <!-- Dropdown button -->
                <div class="col-sm d-flex justify-content-center">
    
                    <div class="dropdown">
                        <button class="btn btn-secondary dropdown-toggle" type="button" id="currentCalendarView"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                            {{ currentCalendarView }} <span class="caret"></span>
                        </button>
                        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <a class="dropdown-item" href="#" on-click="@.fire('dailyCalView')">Daily</a>
                            <a class="dropdown-item" href="#" on-click="@.fire('weeklyCalView')">Weekly</a>
                            <a class="dropdown-item" href="#" on-click="@.fire('monthCalView')">Monthly</a>
                        </div>
                    </div>
    
                </div>
    
                <!-- Today button -->
                <div class="col-sm d-flex justify-content-center">
                    <button type="button" class="btn btn-secondary" on-click="@.fire('calToday')">Today</button>
                </div>
    
            </div>
            <br />
    
            <!-- Place to render the calendar Application from JS -->
    
            <div id="calendar"></div>
        
        </script>
        `;

        this.target = `<div id="${this.targetID}"></div>`;

        jq("#" + this.landingSiteID).append(this.template);
        jq("#" + this.landingSiteID).append(this.target);


        this.r = new Ractive({
            target: "#" + this.targetID,
            template: "#" + this.templateID,
            data: {
                currentlyRenderedRange: "YYYY.MM",
                currentCalendarView: "Monthly",
            }
        })

        this.calendar = new Calendar("#" + this.calendarID, {
            defaultView: 'month',
            useCreationPopup: false,
            useDetailPopup: false,
            template: {
                time: function (schedule: ISchedule) {
                    return outerThis.timeTemplate(schedule);
                },
                allday: function (schedule) {
                    return outerThis.allDayTemplate(schedule);
                }
            }
        });

        this.registerCallbacks();
        this.updateCurrentlyRenderedRange();
    }


    timeTemplate(schedule: ISchedule): string {
        let html = [];

        // Add time of the event
        let start = moment((schedule.start as TZDate).toUTCString());
        html.push(start.format('HH:mm'));

        // Add title of the event
        html.push(' ' + schedule.title);

        return html.join('');
    }

    allDayTemplate(schedule: ISchedule): string {
        // implement all day time template here
        return schedule.title;
    }

    registerCallbacks(): void {

        let outerThis = this;

        // Setup Calendar Events
        this.calendar.on({
            // This gets called when a schedule is created.
            'beforeCreateSchedule': function (scheduleData: ISchedule) {
                console.log("beforeCreateSchedule: scheduleData -> ", scheduleData);
                let modal = new CreationModal(scheduleData.start as TZDate, scheduleData.end as TZDate);
                modal.open();
                (scheduleData as any).guide.clearGuideElement();
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

                outerThis.calendar.updateSchedule(schedule.id, schedule.calendarId, changes);
            },

            // This gets called when a scehdule is deleted.
            'beforeDeleteSchedule': function (e) {
                console.log('beforeDeleteSchedule', e);
                outerThis.calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
            },

            'clickSchedule': function (event) {
                let schedule = event.schedule;
                console.log("A schedule was clicked -> ", schedule);
                let detailModal = new DetailModal(schedule);
                detailModal.open();
                // scheduleDetailPopup(schedule);
            }
        });

        // Button callbacks
        this.r.on("calPrev", () => this.calendarPrevious());
        this.r.on("calNext", () => this.calendarNext());
        this.r.on("calToday", () => this.calendarToday());
        this.r.on("dailyCalView", () => this.setDailyView());
        this.r.on("weeklyCalView", () => this.setWeeklyView());
        this.r.on("monthCalView", () => this.setMonthlyView());
        this.r.on("publishCalendar", () => console.log("Publish calendar button still under construction"));

    }

    calendarToday(): void {
        this.calendar.today();
        this.updateCurrentlyRenderedRange();
    }

    setMonthlyView(): void {
        // Sets the calendar to monthly view
        this.calendar.changeView("month");
        this.updateCurrentlyRenderedRange();
        this.r.set("currentCalendarView", "Monthly");
    }

    setWeeklyView(): void {
        // Sets the calendar to weekly view
        this.calendar.changeView("week");
        this.updateCurrentlyRenderedRange();
        this.r.set("currentCalendarView", "Weekly");
    }

    setDailyView(): void {
        // Sets the calendar to daily view
        this.calendar.changeView("day");
        this.updateCurrentlyRenderedRange();
        this.r.set("currentCalendarView", "Daily");
    }

    calendarNext(): void {
        this.calendar.next();
        this.updateCurrentlyRenderedRange();
    }

    calendarPrevious(): void {
        this.calendar.prev();
        this.updateCurrentlyRenderedRange();
    }

    currentCalendarDate(format: string): string {
        let tempDate = this.calendar.getDate() as any;
        let currentDate = moment([tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()]);
        return currentDate.format(format);
    }

    updateCurrentlyRenderedRange(): void {
        let options = this.calendar.getOptions();
        let viewName = this.calendar.getViewName();

        if (viewName === "day") {
            this.r.set("currentlyRenderedRange", this.currentCalendarDate("Do MMM, YYYY"));
        } else if (viewName === "month") {
            this.r.set("currentlyRenderedRange", this.currentCalendarDate("MMMM, YYYY"));
        } else {
            let partOne = moment(this.calendar.getDateRangeStart().getTime()).format("Do");
            let partTwo = moment(this.calendar.getDateRangeEnd().getTime()).format(' Do MMM, YYYY')
            this.r.set("currentlyRenderedRange", partOne + " ~ " + partTwo);
        }
    }

    getAllSchedules(): Array<ISchedule> {
        return (this.calendar as any)._controller.schedules.items;
    }

}


let cal = new MyCalendar();
export default cal;