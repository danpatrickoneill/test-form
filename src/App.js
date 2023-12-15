import React from "react";
import TimeTracker from "./components/TimeTracker.js";

navigator.serviceWorker.register("service-worker.js").then((registration) => {
  return registration.pushManager.getSubscription().then(/* ... */);
});

function App() {
  return (
    <div className="App">
      <TimeTracker />
    </div>
  );
}

export default App;
