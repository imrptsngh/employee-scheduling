import Calendar from 'tui-calendar'; /* ES6 */
import "tui-calendar/dist/tui-calendar.css";

// If you use the default popups, use this.
import 'tui-date-picker/dist/tui-date-picker.css';
import 'tui-time-picker/dist/tui-time-picker.css';


var calendar = new Calendar('#calendar', {
  defaultView: 'month',
  taskView: true,
  useCreationPopup: true,
  useDetailPopup: true,
  // template: {
  //   monthDayname: function(dayname) {
  //     return '<span class="calendar-week-dayname-name">' + dayname.label + '</span>';
  //   }
  // }
});

calendar.createSchedules([
  {
      id: '1',
      calendarId: '1',
      title: 'Talk to Developer',
      category: 'time',
      dueDateClass: '',
      start: '2020-10-15T22:30:00+09:00',
      end: '2020-10-19T02:30:00+09:00'
  },
  {
      id: '2',
      calendarId: '1',
      title: 'Deploy Delta 2 Framework',
      category: 'time',
      dueDateClass: '',
      start: '2020-10-18T17:30:00+09:00',
      end: '2020-10-19T17:31:00+09:00',
      isReadOnly: false    // schedule is read-only
  }
]);