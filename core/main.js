import { EventApp } from "./EventApp.js";
import { EventData } from "./EventData.js";

const root = document.getElementById("app");
const slug = EventData.getSlug("ladies-night");

new EventApp({ root, slug }).init();
