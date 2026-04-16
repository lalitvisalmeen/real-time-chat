import EchoClass from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const Echo = new EchoClass({
    broadcaster: "reverb",
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: false,
    enabledTransports: ["ws", "wss"],
});

export default Echo;