import {cal} from './calendar';

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
    $(selector).datetimepicker(
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
    $("#scheduleCreationModal").modal("show");

    // start Datetime picker instance
    if ($('#startDatetimePicker').data("DateTimePicker")) {
        // Update the datetime picker if it exists
        $('#startDatetimePicker').data("DateTimePicker").date(new Date(startDate.getTime()));
    }
    else {
        // Create a new datetime picker instance
        $('#startDatetimePicker').datetimepicker({
            date: new Date(startDate.getTime())
        });
    }

    // end Datetime picker instance
    if ($('#endDatetimePicker').data("DateTimePicker")) {
        // Update the datetime picker if it exists
        $('#endDatetimePicker').data("DateTimePicker").date(new Date(endDate.getTime()));
    }
    else {
        // Create a new datetime picker instance
        $('#endDatetimePicker').datetimepicker({
            date: new Date(endDate.getTime())
        });
    }


    function clearModalData() {
        $("#eventName").val("");
        $("#roles").val("");
        $("#employees").val("");
    }

    function submitHandler() {

        // get the data from modal
        let name = $("#eventName").val();
        let role = $("#roles").val();
        let employee = $("#employees").val();
        let isAllDay = $("#isAllDay").is(":checked");

        // create schedule object
        var schedule = {
            id: String(chance.guid()),
            title: name,
            isAllDay: isAllDay,
            start: startDate,
            end: endDate,
            category: isAllDay ? 'allday' : 'time',
            dueDateClass: '',
            color: calendar.color,
            bgColor: calendar.bgColor,
            dragBgColor: calendar.bgColor,
            borderColor: calendar.borderColor,
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
        $("#scheduleCreationModal").modal("hide");

        clearModalData();
    }

    // Add event handler for taking values from Creation Modal and creating a schedule
    $("#createScheduleButton").off('click');
    $("#createScheduleButton").on("click", submitHandler);
}

export function scheduleDetailPopup(schedule) {
    $("#scheduleDetailModal").modal("show");

    let start = moment.utc(schedule.start.toUTCString()).format("Do MMM, YYYY LT");
    let end = moment.utc(schedule.end.toUTCString()).format("Do MMM, YYYY LT");

    let template = `<p>Schedule Details</p><p><b>Start date</b>: ${start}</p><p><b>End date</b>: ${end}</p>`;

    // Set the title
    $("#scheduleTitle").text(schedule.title);
    $("#scheduleDetailModalBody").html(template);

    function cloneSchedule() {
        let newSchedule = schedule;
        newSchedule.id = String(chance.guid());
        cal.createSchedules([newSchedule]);
        cal.render(true);
        $("#scheduleDetailModal").modal("hide");
    }

    $("#cloneScheduleButton").off("click");
    $("#cloneScheduleButton").on("click", cloneSchedule);

}

document.addEventListener("DOMContentLoaded", function () {
    updateRolesInModal();
    updateEmployeesInModal();
});