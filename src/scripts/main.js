import Calendar from 'tui-calendar';
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