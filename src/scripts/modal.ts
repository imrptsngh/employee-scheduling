import {cal} from './calendar';
import * as moment from 'moment';
import * as chance from 'chance';
import Ractive from "ractive";
import 'pc-bootstrap4-datetimepicker/build/js/bootstrap-datetimepicker.min.js';
import * as jq from 'jquery';
import {ISchedule, TZDate} from "tui-calendar";

export function getListOfRoles() {
    // TODO Send a request to the server to get the list of roles
    // fetch('http://example.com/movies.json')
    //     .then(response => response.json())
    //     .then(function(data) {
    //         console.log("Received data from server: ");
    //         console.log(data);

    //         cal.createSchedules(data);
    //         cal.render(true);
    //     });

    let roles = ['Role A', 'Role B', 'Role C', 'Role D'];

    return roles;
}

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

export function updateRolesInModal() {
    let roles = getListOfRoles();
    roles.forEach(function (value, index) {
        let template = `<option value="${index}">${value}</option>`;
        $("#roles").append(template);
    });
    console.log("Roles fetched -> ", roles);
}

export function updateEmployeesInModal() {
    let employees = getListOfEmployees();
    employees.forEach(function (value, index) {
        let template = `<option value="${index}">${value}</option>`;
        $("#employees").append(template);
    });
    console.log("Employees fetched -> ", employees);
}

export function createDatetimePicker(selector, defaultDate) {
    ($(selector) as any).datetimepicker(
        {
            sideBySide: true,
            // defaultDate: defaultDate,
            icons: {
                time: "fa fa-clock-o",
                date: "fa fa-calendar",
                up: "fa fa-arrow-up",
                down: "fa fa-arrow-down",
                previous: "fa fa-chevron-left",
                next: "fa fa-chevron-right",
                today: "fa fa-clock-o",
                clear: "fa fa-trash-o"
            }
        }
    );
}

export function scheduleCreationModal(startDate, endDate) {
    ($("#scheduleCreationModal") as any).modal("show");

    // start Datetime picker instance
    if ($('#startDatetimePicker').data("DateTimePicker")) {
        // Update the datetime picker if it exists
        $('#startDatetimePicker').data("DateTimePicker").date(new Date(startDate.getTime()));
    } else {
        // Create a new datetime picker instance
        ($('#startDatetimePicker') as any).datetimepicker({
            date: new Date(startDate.getTime())
        });
    }

    // end Datetime picker instance
    if ($('#endDatetimePicker').data("DateTimePicker")) {
        // Update the datetime picker if it exists
        $('#endDatetimePicker').data("DateTimePicker").date(new Date(endDate.getTime()));
    } else {
        // Create a new datetime picker instance
        ($('#endDatetimePicker') as any).datetimepicker({
            date: new Date(endDate.getTime())
        });
    }


    function clearModalData() {
        $("#eventName").val("");
        $("#roles").val("");
        $("#employees").val("");
    }

    function submitHandler() {

        let ch = new chance.Chance()

        // get the data from modal
        let name = $("#eventName").val();
        let role = $("#roles").val();
        let employee = $("#employees").val();
        let isAllDay = $("#isAllDay").is(":checked");

        // create schedule object
        var schedule = {
            id: String(ch.guid()),
            title: name,
            isAllDay: isAllDay,
            start: startDate,
            end: endDate,
            category: isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            // color: calendar.color,
            // bgColor: calendar.bgColor,
            // dragBgColor: calendar.bgColor,
            // borderColor: calendar.borderColor,
            location: '',
            // raw: {
            //     class: scheduleData.raw['class']
            // },
            state: 'busy'
        };

        console.log("Creating schedule -> ", schedule);

        // Create a schedule in calednar
        cal.createSchedules([schedule]);
        cal.render(true);   // Render the new schedule on calendar.

        // Close the modal once everything is done
        ($("#scheduleCreationModal") as any).modal("hide");

        clearModalData();
    }

    // Add event handler for taking values from Creation Modal and creating a schedule
    $("#createScheduleButton").off('click');
    $("#createScheduleButton").on("click", submitHandler);
}

export function scheduleDetailPopup(schedule) {
    ($("#scheduleDetailModal") as any).modal("show");

    let ch = new chance.Chance();

    let start = moment.utc(schedule.start.toUTCString()).format("Do MMM, YYYY LT");
    let end = moment.utc(schedule.end.toUTCString()).format("Do MMM, YYYY LT");

    let template = `<p>Schedule Details</p><p><b>Start date</b>: ${start}</p><p><b>End date</b>: ${end}</p>`;

    // Set the title
    $("#scheduleTitle").text(schedule.title);
    $("#scheduleDetailModalBody").html(template);

    function cloneSchedule() {
        let newSchedule = schedule;
        newSchedule.id = String(ch.guid());
        cal.createSchedules([newSchedule]);
        cal.render(true);
        ($("#scheduleDetailModal") as any).modal("hide");
    }

    $("#cloneScheduleButton").off("click");
    $("#cloneScheduleButton").on("click", cloneSchedule);

}

document.addEventListener("DOMContentLoaded", function () {
    updateRolesInModal();
    updateEmployeesInModal();
});

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
        this.roles = ["Role A", "Role B", "Role C", "Role D"];
        this.role = this.roles[0];
        this.employees = ["Emp A", "Emp B"];
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

    close(): void {
        // Implement functionality to close the modal here
        this.modalSelector.modal("hide");
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
            // raw: {
            //     class: scheduleData.raw['class']
            // },
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
            }
        });
        console.debug("Initialized Ractive.js");

        this.modalSelector = jq("#"+this.modalID);

        this.r.on('cloneEvent', () => this.cloneEvent());
        this.r.on('editEvent', () => console.log("Edit event under construction"));
    }

    open(): void {
        this.modalSelector.modal("show");
    }

    close(): void {
        this.modalSelector.modal("hide");
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