import cal from './calendar';
import * as moment from 'moment';
import * as chance from 'chance';
import Ractive from "ractive";
import 'pc-bootstrap4-datetimepicker/build/js/bootstrap-datetimepicker.min.js';
import * as jq from 'jquery';
import {ISchedule, TZDate} from "tui-calendar";

export function getListOfEmployees() {
    // TODO Send a request to the server to get the list of employees
    // fetch('http://example.com/movies.json')
    //     .then(response => response.json())
    //     .then(function(data) {
    //         console.log("Received data from server: ");
    //         console.log(data);

    //         cal.createSchedules(data);
    //         cal.render(true);
    //     });

    let employees = ['Emp A', 'Emp B', 'Emp C', 'Emp D'];
    return employees;
}


export class CreationModal {
    title: string;
    eventName: string;
    roles: Array<string>;
    role: string;
    employees: Array<string>;
    employee: string;
    startDate: TZDate;
    endDate: TZDate;
    allDay: boolean;

    template: string;
    output: string;
    templateID: string;
    targetID: string;
    generatedID: string;
    startDateTimePickerID: string;
    startDateTimeSelector: any;
    endDateTimePickerID: string;
    endDateTimeSelector: any;
    modalID: string;
    modalSelector: any;
    r: Ractive;
    ch: any;    // Instance variable for Chance

    constructor(startDate:TZDate, endDate:TZDate) {
        // Store parameters
        this.startDate = startDate;
        this.endDate = endDate;

        // Generate a unique ID here
        this.ch = new chance.Chance();
        this.generatedID = this.ch.guid();
        this.templateID = `template-${this.generatedID}`;
        this.targetID = `target-${this.generatedID}`;
        this.modalID = `modal-${this.generatedID}`;
        this.startDateTimePickerID = `start-datetimepicker-${this.generatedID}`;
        this.endDateTimePickerID = `end-datetimepicker-${this.generatedID}`;

        // Append the template and other HTML stuff
        this.template = `
        <script id="${this.templateID}" type="text/ractive">
            <div class="modal" id="${this.modalID}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{title}}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
        
                            <!-- Name of the event -->
                            <div class="form-group">
                                <label for="exampleInputEmail1">Name of event</label>
                                <input type="text" class="form-control" value="{{ eventName }}" aria-describedby="emailHelp">
                                <small id="emailHelp" class="form-text text-muted">Enter the name of the event that will be
                                    shown on the calendar.</small>
                            </div>
        
                            <!-- Role -->
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label class="input-group-text" for="roles">Role</label>
                                </div>
                                <select class="custom-select" value="{{ role }}">
                                    {{#each roles:num}}
                                        <option value="{{ roles[num] }}">{{ roles[num] }}</option>
                                    {{/each}}
                                </select>
                            </div>
        
        
        
                            <!-- Employee -->
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label class="input-group-text" for="employees">Employee</label>
                                </div>
                                <select class="custom-select" value="{{ employee }}">
                                    {{#each employees:num}}
                                        <option value="{{ employees[num] }}">{{ employees[num] }}</option>
                                    {{/each}}
                                </select>
                            </div>
        
        
        
                            <!-- Start time -->
                            <div class="input-group date mb-3" id="${this.startDateTimePickerID}">
                                <input type="text" class="form-control" placeholder="Start Date" value="{{ startDate }}" aria-describedby="startTime">
                                <div class="input-group-append input-group-addon">
                                    <button class="btn btn-outline-secondary" type="button" id="startTime"><i
                                            class="fa fa-calendar"></i></button>
                                </div>
                            </div>
        
        
                            <!-- End time -->
                            <div class="input-group date mb-3" id="${this.endDateTimePickerID}">
                                <input type="text" class="form-control" placeholder="End Date" aria-describedby="endTime">
                                <div class="input-group-append input-group-addon">
                                    <button class="btn btn-outline-secondary" type="button" id="endTime"><i
                                            class="fa fa-calendar"></i></button>
                                </div>
                            </div>
            
                            <!-- All day -->
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" checked="{{ allDay }}" id="isAllDay">
                                <label class="form-check-label" for="isAllDay">All day</label>
                            </div>
        
        
        
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" on-click="@.fire('saveNewEvent')">Create</button>
                        </div>
                    </div>
                </div>
            </div>
        </script>
        `;
        this.output = `
            <div id="${this.targetID}"></div>
        `;

        jq("body").append(this.template);
        jq("body").append(this.output);
        console.debug("Template and Target created and appended to body");

        // Initializing instance variables
        this.title = "Create an event";
        this.eventName = "";
        this.roles = cal.roles;     // Get the roles from calendar object
        this.role = this.roles[0];
        this.employees = cal.employees;
        this.employee = this.employees[0];
        this.allDay = false;

        // Initialize with Ractive.js
        this.r = new Ractive({
            target: `#${this.targetID}`,
            template: `#${this.templateID}`,
            data: {
                title: this.title,
                eventName: this.eventName,
                roles: this.roles,
                role: this.role,
                employees: this.employees,
                employee: this.employee,
                allDay: this.allDay,
            }
        });
        console.debug("Initialized Ractive.js");

        this.modalSelector = jq("#" + this.modalID);
        this.startDateTimeSelector = jq("#" + this.startDateTimePickerID);
        this.endDateTimeSelector = jq("#" + this.endDateTimePickerID);
        console.debug("Prepared element selectors");

        this.updateDateTimePicker();

        this.r.on("saveNewEvent", () => this.onSubmit());
    }

    open(): void {
        // Implement functionality to open the modal here
        this.modalSelector.modal("show");
    }

    cleanUp(): void {
        jq("#"+this.targetID).remove();
        jq("#"+this.templateID).remove();
        console.debug("Cleaned up template and target HTML content.");
    }

    close(): void {
        // Implement functionality to close the modal here
        this.modalSelector.modal("hide");
        // perform cleanup, remove HTML element from body
        this.cleanUp();
    }

    clearFields(): void {
        // Implement this function to clear already set data
        this.r.set("eventName", "");
        this.r.set("isAllDay", false);
        this.r.set("role", this.roles[0]);
        this.r.set("employee", this.employees[0]);
    }

    onSubmit(): void {
        // Implement this function to create the schedule event when the form is submitted

        // get the data from modal
        let eventName = this.r.get("eventName");
        let isAllDay = this.r.get("allDay");

        // Get the current date and time that is selected in the datetime picker
        let startDateTime = this.startDateTimeSelector.data().date;
        let endDateTime = this.endDateTimeSelector.data().date;

        // create schedule object
        let schedule = {
            id: String(this.ch.guid()),
            title: eventName,
            isAllDay: isAllDay,
            start: startDateTime,
            end: endDateTime,
            category: isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            // color: calendar.color,
            // bgColor: calendar.bgColor,
            // dragBgColor: calendar.bgColor,
            // borderColor: calendar.borderColor,
            location: '',
            raw: {
                role: this.r.get("role"),
                employee: this.r.get("employee"),
            },
            state: 'busy'
        };

        console.debug("Creating schedule -> ", schedule);

        // Create a schedule in calendar
        cal.createSchedules([schedule]);
        cal.render(true);   // Render the new schedule on calendar.

        // Close the modal once everything is done
        this.close();
        this.clearFields();
    }

    updateDateTimePicker(): void {

        // start Datetime picker instance
        if (this.startDateTimeSelector.data("DateTimePicker")) {
            // Update the datetime picker if it exists
            this.startDateTimeSelector.data("DateTimePicker").date(new Date(this.startDate.getTime()));
        } else {
            // Create a new datetime picker instance
            this.startDateTimeSelector.datetimepicker({
                date: new Date(this.startDate.getTime())
            });
        }

        // end Datetime picker instance
        if (this.endDateTimeSelector.data("DateTimePicker")) {
            // Update the datetime picker if it exists
            this.endDateTimeSelector.data("DateTimePicker").date(new Date(this.endDate.getTime()));
        } else {
            // Create a new datetime picker instance
            this.endDateTimeSelector.datetimepicker({
                date: new Date(this.endDate.getTime())
            });
        }
    }

}

export class DetailModal {

    template: string;
    target: string;
    templateID: string;
    targetID: string;
    generatedID: string;
    modalID: string;
    modalSelector: any;
    ch: any;    // Instance variable for Chance
    schedule: ISchedule;

    r: Ractive;

    constructor(schedule: ISchedule) {

        this.ch = new chance.Chance();
        this.generatedID = this.ch.guid();
        this.templateID = "template-"+this.generatedID;
        this.modalID = "modal-"+this.generatedID;
        this.schedule = schedule;

        this.template = `
        <script id="${this.templateID}" type="text/ractive">
            <div class="modal" id="${this.modalID}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="scheduleTitle">{{ eventName }}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>
                                <b>Start Date: </b> {{ startDate }}
                            </p>
                            <p>
                                <b>End Date: </b> {{ endDate }}
                            </p>
                            <p>
                                <b>Role: </b> {{ role }}
                            </p>
                            <p>
                                <b>Employee: </b> {{ employee }}
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" on-click="@.fire('cloneEvent')">Clone</button>
                            <button type="button" class="btn btn-primary" on-click="@.fire('editEvent')">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
        </script>
        `;

        this.target = `
        <div id="${this.targetID}"></div>
        `;

        jq("body").append(this.template);
        jq("body").append(this.target);

        // Parse startDate and endDate
        let startDateTime = moment((schedule.start as TZDate).toDate()).format("Do MMM, YYYY LT");
        let endDateTime = moment((schedule.end as TZDate).toDate()).format("Do MMM, YYYY LT");

        this.r = new Ractive({
            target: `#${this.targetID}`,
            template: `#${this.templateID}`,
            data: {
                eventName: schedule.title,
                startDate: startDateTime,
                endDate: endDateTime,
                role: schedule.raw.role,
                employee: schedule.raw.employee,
            }
        });
        console.debug("Initialized Ractive.js");

        this.modalSelector = jq("#"+this.modalID);

        // Function to execute for cloning an event
        this.r.on('cloneEvent', () => this.cloneEvent());

        // Function to execute for editing an event
        let outerThis = this;
        function editEvent() {
            let temp = new EditModal(outerThis.schedule);
            temp.open();
            outerThis.close();
        }

        this.r.on('editEvent', () => editEvent());
    }

    open(): void {
        this.modalSelector.modal("show");
    }

    cleanUp(): void {
        jq("#"+this.targetID).remove();
        jq("#"+this.templateID).remove();
        console.debug("Cleaned up template and target HTML content.");
    }

    close(): void {
        this.modalSelector.modal("hide");
        this.cleanUp();
    }

    cloneEvent(): void {
        // Implement the code to clone the selected event
        let newSchedule = this.schedule;
        newSchedule.id = String(this.ch.guid());
        cal.createSchedules([newSchedule]);
        cal.render(true);
        this.close();
    }
}

export class EditModal {
    title: string;
    eventName: string;
    roles: Array<string>;
    role: string;
    employees: Array<string>;
    employee: string;
    startDate: TZDate;
    endDate: TZDate;
    allDay: boolean;

    template: string;
    output: string;
    templateID: string;
    targetID: string;
    generatedID: string;
    startDateTimePickerID: string;
    startDateTimeSelector: any;
    endDateTimePickerID: string;
    endDateTimeSelector: any;
    modalID: string;
    modalSelector: any;
    r: Ractive;
    ch: any;    // Instance variable for Chance
    schedule: ISchedule;

    constructor(schedule: ISchedule) {
        this.schedule = schedule;

        this.startDate = schedule.start as TZDate;
        this.endDate = schedule.end as TZDate;

        // Generate a unique ID here
        this.ch = new chance.Chance();
        this.generatedID = this.ch.guid();
        this.templateID = `template-${this.generatedID}`;
        this.targetID = `target-${this.generatedID}`;
        this.modalID = `modal-${this.generatedID}`;
        this.startDateTimePickerID = `start-datetimepicker-${this.generatedID}`;
        this.endDateTimePickerID = `end-datetimepicker-${this.generatedID}`;

        // Append the template and other HTML stuff
        this.template = `
        <script id="${this.templateID}" type="text/ractive">
            <div class="modal" id="${this.modalID}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">{{title}}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
        
                            <!-- Name of the event -->
                            <div class="form-group">
                                <label for="exampleInputEmail1">Name of event</label>
                                <input type="text" class="form-control" value="{{ eventName }}" aria-describedby="emailHelp">
                                <small id="emailHelp" class="form-text text-muted">Enter the name of the event that will be
                                    shown on the calendar.</small>
                            </div>
        
                            <!-- Role -->
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label class="input-group-text" for="roles">Role</label>
                                </div>
                                <select class="custom-select" value="{{ role }}">
                                    {{#each roles:num}}
                                        <option value="{{ roles[num] }}">{{ roles[num] }}</option>
                                    {{/each}}
                                </select>
                            </div>
        
        
        
                            <!-- Employee -->
                            <div class="input-group mb-3">
                                <div class="input-group-prepend">
                                    <label class="input-group-text" for="employees">Employee</label>
                                </div>
                                <select class="custom-select" value="{{ employee }}">
                                    {{#each employees:num}}
                                        <option value="{{ employees[num] }}">{{ employees[num] }}</option>
                                    {{/each}}
                                </select>
                            </div>
        
        
        
                            <!-- Start time -->
                            <div class="input-group date mb-3" id="${this.startDateTimePickerID}">
                                <input type="text" class="form-control" placeholder="Start Date" value="{{ startDate }}" aria-describedby="startTime">
                                <div class="input-group-append input-group-addon">
                                    <button class="btn btn-outline-secondary" type="button" id="startTime"><i
                                            class="fa fa-calendar"></i></button>
                                </div>
                            </div>
        
        
                            <!-- End time -->
                            <div class="input-group date mb-3" id="${this.endDateTimePickerID}">
                                <input type="text" class="form-control" placeholder="End Date" aria-describedby="endTime">
                                <div class="input-group-append input-group-addon">
                                    <button class="btn btn-outline-secondary" type="button" id="endTime"><i
                                            class="fa fa-calendar"></i></button>
                                </div>
                            </div>
            
                            <!-- All day -->
                            <div class="form-group form-check">
                                <input type="checkbox" class="form-check-input" checked="{{ allDay }}" id="isAllDay">
                                <label class="form-check-label" for="isAllDay">All day</label>
                            </div>
        
        
        
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" class="btn btn-primary" on-click="@.fire('updateEvent')">Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </script>
        `;
        this.output = `
            <div id="${this.targetID}"></div>
        `;

        jq("body").append(this.template);
        jq("body").append(this.output);
        console.debug("Template and Target created and appended to body");

        // Initializing instance variables
        this.title = "Edit event";
        this.eventName = schedule.title;
        this.roles = cal.roles;
        this.role = this.schedule.raw.role as string;      // Get role from schedule
        this.employees = cal.employees;
        this.employee = this.schedule.raw.employee as string;      // Get employee from schedule
        this.allDay = schedule.isAllDay;

        // Initialize with Ractive.js
        this.r = new Ractive({
            target: `#${this.targetID}`,
            template: `#${this.templateID}`,
            data: {
                title: this.title,
                eventName: this.eventName,
                roles: this.roles,
                role: this.role,
                employees: this.employees,
                employee: this.employee,
                allDay: this.allDay,
            }
        });
        console.debug("Initialized Ractive.js");

        this.modalSelector = jq("#" + this.modalID);
        this.startDateTimeSelector = jq("#" + this.startDateTimePickerID);
        this.endDateTimeSelector = jq("#" + this.endDateTimePickerID);
        console.debug("Prepared element selectors");

        this.updateDateTimePicker();

        this.r.on("updateEvent", () => this.onSubmit());
    }

    open(): void {
        // Implement functionality to open the modal here
        this.modalSelector.modal("show");
    }

    cleanUp(): void {
        jq("#"+this.targetID).remove();
        jq("#"+this.templateID).remove();
        console.debug("Cleaned up template and target HTML content.");
    }

    close(): void {
        // Implement functionality to close the modal here
        this.modalSelector.modal("hide");
        this.cleanUp();
    }

    clearFields(): void {
        // Implement this function to clear already set data
        this.r.set("eventName", "");
        this.r.set("isAllDay", false);
        this.r.set("role", this.roles[0]);
        this.r.set("employee", this.employees[0]);
    }

    onSubmit(): void {
        // Implement this function to create the schedule event when the form is submitted

        // get the data from modal
        let eventName = this.r.get("eventName");
        let isAllDay = this.r.get("allDay");

        // Get the current date and time that is selected in the datetime picker
        let startDateTime = this.startDateTimeSelector.data().date;
        let endDateTime = this.endDateTimeSelector.data().date;

        // create schedule object
        let updatedSchedule = {
            id: String(this.ch.guid()),
            title: eventName,
            isAllDay: isAllDay,
            start: startDateTime,
            end: endDateTime,
            category: isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            // color: calendar.color,
            // bgColor: calendar.bgColor,
            // dragBgColor: calendar.bgColor,
            // borderColor: calendar.borderColor,
            location: '',
            raw: {
                role: this.r.get("role"),
                employee: this.r.get("employee"),
            },
            state: 'busy'
        };

        console.debug("Creating schedule -> ", updatedSchedule);

        // Create a schedule in calendar
        cal.updateSchedule(this.schedule.id, this.schedule.calendarId, updatedSchedule);
        cal.render(true);

        // Close the modal once everything is done
        this.close();
        this.clearFields();
    }

    updateDateTimePicker(): void {

        // start Datetime picker instance
        if (this.startDateTimeSelector.data("DateTimePicker")) {
            // Update the datetime picker if it exists
            this.startDateTimeSelector.data("DateTimePicker").date(new Date(this.startDate.getTime()));
        } else {
            // Create a new datetime picker instance
            this.startDateTimeSelector.datetimepicker({
                date: new Date(this.startDate.getTime())
            });
        }

        // end Datetime picker instance
        if (this.endDateTimeSelector.data("DateTimePicker")) {
            // Update the datetime picker if it exists
            this.endDateTimeSelector.data("DateTimePicker").date(new Date(this.endDate.getTime()));
        } else {
            // Create a new datetime picker instance
            this.endDateTimeSelector.datetimepicker({
                date: new Date(this.endDate.getTime())
            });
        }
    }

}

export class InfoModal {

    template: string;
    target: string;
    templateID: string;
    targetID: string;
    generatedID: string;
    modalID: string;
    modalSelector: any;
    ch: any;    // Instance variable for Chance

    r: Ractive;

    constructor() {

        this.ch = new chance.Chance();
        this.generatedID = this.ch.guid();
        this.templateID = "template-"+this.generatedID;
        this.modalID = "modal-"+this.generatedID;

        this.template = `
        <script id="${this.templateID}" type="text/ractive">
            <div class="modal" id="${this.modalID}" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="scheduleTitle">{{ modalTitle }}</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p>
                                {{ modalContent }}
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </script>
        `;

        this.target = `
        <div id="${this.targetID}"></div>
        `;

        jq("body").append(this.template);
        jq("body").append(this.target);


        this.r = new Ractive({
            target: `#${this.targetID}`,
            template: `#${this.templateID}`,
            data: {
                modalTitle: "",
                modalContent: "",
            }
        });
        console.debug("Initialized Ractive.js");

        this.modalSelector = jq("#"+this.modalID);
    }

    open(): void {
        this.modalSelector.modal("show");
    }

    cleanUp(): void {
        jq("#"+this.targetID).remove();
        jq("#"+this.templateID).remove();
        console.debug("Cleaned up template and target HTML content.");
    }

    close(): void {
        this.modalSelector.modal("hide");
        this.cleanUp();
    }

    setTitle(title: string): void {
        this.r.set("modalTitle", title);
    }

    setContent(content: string): void {
        this.r.set("modalContent", content);
    }

}