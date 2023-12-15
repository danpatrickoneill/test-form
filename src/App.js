import React from "react";
import TimeTracker from "./components/TimeTracker.js";

navigator.serviceWorker.register("service-worker.js").then((registration) => {
  return registration.pushManager.getSubscription().then(/* ... */);
});

function askNotificationPermission() {
  // function to actually ask the permissions
  function handlePermission(permission) {
    // set the button to shown or hidden, depending on what the user answers
    // notificationBtn.style.display =
    //   Notification.permission === "granted" ? "none" : "block";
  }

  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
  } else {
    Notification.requestPermission().then((permission) => {
      handlePermission(permission);
    });
  }
}

function createNotification() {
  const n = new Notification("My Great Song");
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      // The tab has become visible so clear the now-stale Notification.
      n.close();
    }
  });
}

function App() {
  return (
    <div className="App">
      <TimeTracker />
      <button id="enable" onClick={() => askNotificationPermission()}>
        Enable notifications
      </button>
      <button id="notify" onClick={() => createNotification()}>
        Get notification right now
      </button>
    </div>
  );
}

export default App;
