export class EventTheme {
  static load(slug) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `./events/${slug}/event.css`;
    link.dataset.eventTheme = slug;
    document.head.appendChild(link);
  }
}
