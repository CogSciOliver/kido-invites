export class Calendar {
  static bind(data) {
    const btn = document.getElementById("calendarBtn");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const cal = data.calendar || {};
      const ics = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${cal.title || data.event?.title || "Event"}
DTSTART:${cal.start || ""}
DTEND:${cal.end || ""}
LOCATION:${cal.location || ""}
DESCRIPTION:${cal.description || ""}
END:VEVENT
END:VCALENDAR`;

      const blob = new Blob([ics], { type: "text/calendar" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = cal.filename || "event.ics";
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
