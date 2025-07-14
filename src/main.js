import { renderRoute } from "./router";
import './style.css';

document.addEventListener("DOMContentLoaded" , renderRoute)
window.addEventListener("hashchange" , renderRoute)
