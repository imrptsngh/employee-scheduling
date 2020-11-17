import Calendar, {ISchedule, TZDate} from 'tui-calendar';
import * as moment from 'moment';
import {CreationModal, DetailModal, InfoModal} from './modal';
import Ractive from "ractive";
import * as jq from "jquery";
import * as tui_timezone from "tui-calendar/src/js/common/timezone";


export class MyCalendar {
    calendarID: string;
    calendar: Calendar;
    template: string;
    templateID: string;
    target: string
    targetID: string;
    r: Ractive;
    landingSiteID: string;  // The ID of the element where Calendar will unpack itself and setup it's home :D
    roles: Array<string>;
    schedules: Array<ISchedule>;
    employees: Array<string>;

    employeeListEndpoint: string;
    roleListEndpoint: string;
    publishScheduleEndpoint: string;


    constructor() {
        console.debug("constructor called");

        this.employeeListEndpoint = "http://192.168.0.105:8000/employee/employee/json/";
        this.roleListEndpoint = "http://192.168.0.105:8000/employee/roles/json/";
        this.publishScheduleEndpoint = "http://192.168.0.105:8000/employee/publish_schedule/";

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
                    <button type="button" class="btn btn-secondary float-right" on-click="@.fire('publishCalendar')">Publish
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
               <div class="row">
               
                <div class="col-lg-2">
                {{ #each employees: num }}
                <div class="card text-center" style="">
                  <div class="card-body">
                    <h5 class="card-title">{{ employees[num] }}</h5>
                    <p class="card-text">DEPARTMENT</p>
                    <button type="button" class="btn btn-primary" on-click="@.fire('employeeScheduleCreate', employees[num])"> Add Schedule </button>
                  </div>
                </div>
                {{ /each }}
                    
                </div>
                
                
                <div class="col-lg-10">
                    <div id="calendar"></div>
                </div>
               
               </div>
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
                currentCalendarView: "Weekly",
                employees: this.employees ? [] : this.employees,
            }
        })


        this.calendar = new Calendar("#" + this.calendarID, {
            defaultView: 'week',
            taskView: false,
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
        this.updateRoles();
        this.updateEmployees();
        this.getSchedulesFromServer();
    }


    timeTemplate(schedule: ISchedule): string {
        let html = [];
        let start = moment((schedule.start as TZDate).toUTCString());
        let time = start.format("HH:mm");

        let template = `${time} <br/> 
                        ${schedule.title} <br/> 
                        ${schedule.raw.employee} <br/>
                        ${schedule.raw.role}
                        `;
        return template;
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
        this.r.on("publishCalendar", () => this.publishCalendar());
        this.r.on("employeeScheduleCreate", (context, employeeName) => this.employeeBasedSchedule(employeeName));
    }

    employeeBasedSchedule(employeeName): void {
        console.log("Here I'm supposed to show a schedule modal for ", employeeName);
        let startDate = new Date();
        let endDate = new Date(startDate.getTime() + 1*60*60*1000);

        let modal = new CreationModal(new tui_timezone.Date(startDate), new tui_timezone.Date(endDate));
        modal.r.set("employee", employeeName);
        modal.open();
    }

    publishCalendar(): void {
        let schedules = this.getAllSchedules();
        let modal = new InfoModal();

        fetch(this.publishScheduleEndpoint, {
            method: 'POST',
            mode: 'cors', // no-cors, *cors, same-origin
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(schedules) // body data type must match "Content-Type" header
        })
            .then(rawData => rawData.json())
            .then(data => {
                // Show success modal if everything went well.
                if (data.status === "ok") {
                    modal.setTitle("Success");
                    modal.setContent("Schedule information was saved successfully!");
                    modal.open()
                }
                // Show error modal if it did not go right.
                else {
                    modal.setTitle("Something went wrong");
                    modal.setContent("Unable to save schedule information on server.");
                    modal.open()
                }
            })
            .catch(reason => {
                modal.setTitle("Something went wrong");
                modal.setContent("Unable to save schedule information on server. Error: " + reason);
                modal.open()
            });

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

    render(immediate: boolean): void {
        console.debug("Rendering the calendar view");
        this.calendar.render(immediate);
    }

    createSchedules(schedules: Array<ISchedule>): void {
        console.debug("Adding schedules -> ", schedules);
        this.calendar.createSchedules(schedules);
    }

    updateSchedule(scheduleID, calendarID, schedule: ISchedule): void {
        this.calendar.updateSchedule(scheduleID, calendarID, schedule);
    }

    getAllSchedules(): Array<ISchedule> {

        let rawSchedules = (this.calendar as any)._controller.schedules.items;
        let schedules: Array<ISchedule> = [];

        // This is what rawSchedules variable content looks like
        // {
        //     "23":{
        //              "id":"4d8c4800-bc74-582b-b79f-ca9b3a465c0c",
        //                  "title":"Duck",
        //                  "body":""
        //               ....
        //          },
        //
        //     "30":{
        //             "id":"b891911e-8d04-5de9-b6f6-bd6de4143743",
        //                 "title":"Yewll ow",
        //                 "body":"",
        //                  ......
        //           },
        // }

        for (const value in rawSchedules) {
            schedules.push(rawSchedules[value])
        }
        console.debug("Schedules on calendar -> ", schedules);

        return schedules;
    }

    updateRoles() {
        fetch(this.roleListEndpoint, {
            mode: 'cors',
        })
            .then(response => response.json())
            .then(data => {
                this.roles = data;
                console.debug("Updated roles in calendar.");
            })
            .catch(reason => {
                let m = new InfoModal();
                m.setTitle("Roles update fail");
                m.setContent("Unable to update list of roles from server. Error: " + reason);
                m.open();
            });
    }


    updateEmployees() {
        fetch(this.employeeListEndpoint, {
            mode: 'cors',
        })
            .then(response => response.json())
            .then(data => {
                this.employees = data;
                this.r.set("employees", this.employees);
                console.debug("Updated list of employees");
            })
            .catch(reason => {
                let m = new InfoModal();
                m.setTitle("Employee update fail");
                m.setContent("Unable to update list of employees from server. Error: " + reason);
                m.open();
            });
    }

    getSchedulesFromServer(): void {
        fetch('http://192.168.0.105:8000/employee/publish_schedule/', {
            mode: 'cors',
        })
            .then(resp => resp.json())
            .then(data => {
                console.debug("Received schedules from server -> ", data);
                this.schedules = data;
                // Creating schedules
                this.calendar.createSchedules(this.schedules);
            });
    }

}


let cal = new MyCalendar();
export default cal;