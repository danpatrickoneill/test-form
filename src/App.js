import React from "react";
import TimeTracker from "./components/TimeTracker.js";

try {
  navigator.serviceWorker.register("service-worker.js").then((registration) => {
    return registration.pushManager.getSubscription().then(/* ... */);
  });
} catch (e) {
  console.log(e);
}

function App() {
  return (
    <div className="App">
      <TimeTracker />
    </div>
  );
}

export default App;
