import React, { useState, useEffect } from "react";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import TimeTable from "./TimeTable.js";
import "./index.css";

function TimeTracker() {
  const [todaysTimesheet, setTodaysTimesheet] = useState("");
  const [thisMonthsTimesheet, setThisMonthsTimesheet] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [caseName, setCaseName] = useState("");
  const [activity, setActivity] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [loadedDate, setLoadedDate] = useState("");
  // const [isFetching, setIsFetching] = useState(true);

  useEffect(
    () => async () => {
      if (todaysTimesheet.length) {
        console.log(todaysTimesheet)
        const dateString = `${2023}-${11 + 1}-${"TEST"}`;
        const newSheet = `${dateString}\n` + todaysTimesheet;
        console.log(newSheet);
        console.log("HERE NOW");
        setThisMonthsTimesheet(thisMonthsTimesheet + newSheet);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todaysTimesheet]
  );

  // let monthlySheet = "";

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

  const AccessKeyId = process.env.REACT_APP_ACCESS_KEY_ID,
    SecretKey = process.env.REACT_APP_SECRET_KEY;

  const credentials = {
    accessKeyId: AccessKeyId,
    secretAccessKey: SecretKey,
  };

  const fetchSheetFromS3 = async (dateString) => {
    console.log(dateString);
    const dateForKey = dateString?.length
      ? new Date(`${dateString} 12:00`)
      : new Date();
    let timesheetKey = `${
      dateForKey.getMonth() + 1
    }${dateForKey.getDate()}${dateForKey.getFullYear()}_SPO.csv`;

    if (authCode !== "SPO") {
      window.alert("UNAUTHORIZED");
      return;
    }

    const getCommand = new GetObjectCommand({
      Bucket: "timesheets-delta-omega",
      Key: timesheetKey,
    });

    const client = new S3Client({ region: "us-east-2", credentials });

    try {
      const getResponse = await client.send(getCommand);
      const str = await getResponse.Body.transformToString();
      setTodaysTimesheet(str);
      monthlySheet += str;
      monthlySheet += "\n";
      // console.log("Timesheet loaded successfully");
      if (dateString.length) {
        setLoadedDate(dateString);
      } else {
        setLoadedDate("Today");
      }
      return str;
    } catch (e) {
      // console.log(e);
      // console.log("No timesheet found for date");
      window.alert(
        "No timesheet found for date; if you believe this is in error, contact the Danster"
      );
      return;
    }
  };

  const sendFileToS3 = async () => {
    const today = new Date();
    const todaysTimesheetKey = `${
      today.getMonth() + 1
    }${today.getDate()}${today.getFullYear()}_SPO.csv`;

    if (authCode !== "SPO") {
      window.alert("UNAUTHORIZED");
      return;
    }
    if (!startTime || !endTime || !caseName || !activity) {
      window.alert("MISSING DATA");
      return;
    }

    const newData = [startTime, endTime, caseName, activity];
    const row = newData.join(",");
    const newTimesheet = todaysTimesheet + `${row}\n`;

    const putCommand = new PutObjectCommand({
      Bucket: "timesheets-delta-omega",
      Key: todaysTimesheetKey,
      Body: newTimesheet,
    });

    const client = new S3Client({ region: "us-east-2", credentials });

    try {
      const putResponse = await client.send(putCommand);
      console.log(putResponse);
      setTodaysTimesheet(newTimesheet);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSheetForDate = async (date) => {
    return fetchSheetFromS3(date);
  };

  function getDaysInMonth(month) {
    const thirties = [3, 5, 8, 10];
    const twentyEight = 1;
    let days = 31;
    if (month === twentyEight) {
      days = 28;
    } else if (thirties.includes(month)) {
      days--;
    }
    return days;
  }

  async function fetchTimesheetsForMonth(month) {
    // const monthRegex = new RegExp(`${month}.+SPO`);
    const days = getDaysInMonth(month);
    let date = 18;
    while (date <= days) {
      const currentYear = 2023;
      const dateString = `${currentYear}-${month + 1}-${date}`;
      const dailySheet = await fetchSheetForDate(dateString);
      console.log(dailySheet);
      console.log(thisMonthsTimesheet);
      date++;
    }
  }

  const downloadCurrentTimesheet = () => {
    console.log(185, todaysTimesheet, thisMonthsTimesheet);
    if (!todaysTimesheet.length && !thisMonthsTimesheet.length) {
      return;
    }
    let csvContentForDownload = "data:text/csv;charset=utf-8,";
    csvContentForDownload += thisMonthsTimesheet.length
      ? thisMonthsTimesheet
      : todaysTimesheet;
    const dateToUse = loadedDate?.length
      ? new Date(`${loadedDate} 12:00`)
      : new Date();
    csvContentForDownload += "\n";
    csvContentForDownload += `Downloaded ${dateToUse.toDateString()}`;
    const encodedUri = encodeURI(csvContentForDownload);
    window.open(encodedUri);
  };

  return (
    <div className="container">
      Currently loaded timesheet: {loadedDate || "Today"}
      <form>
        <label>
          Start time:
          <input
            type="time"
            name="Start time"
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label>
          End time:
          <input
            type="time"
            name="End time"
            onChange={(e) => setEndTime(e.target.value)}
          />
        </label>
        <label>
          Case name:
          <input
            type="text"
            name="Case name"
            onChange={(e) => setCaseName(e.target.value)}
          />
        </label>
        <label>
          Activity:
          <input
            type="text"
            name="Activity"
            onChange={(e) => setActivity(e.target.value)}
          />
        </label>
        <label>
          User initials:
          <input
            type="text"
            name="User initials"
            onChange={(e) => setAuthCode(e.target.value)}
          />
        </label>
      </form>
      <button onClick={() => downloadCurrentTimesheet()}>
        Download currently loaded timesheet
      </button>
      <button onClick={() => sendFileToS3()}>Submit new activity</button>
      <label>
        Desired date:
        <input
          type="date"
          name="Desired date"
          onChange={(e) => setDesiredDate(e.target.value)}
        />
      </label>
      <button onClick={() => fetchSheetForDate(desiredDate)}>
        Fetch timesheet for preceding date
      </button>
      <button onClick={() => fetchTimesheetsForMonth(11)}>
        Fetch timesheet for December
      </button>
      <button id="enable" onClick={() => askNotificationPermission()}>
        Enable notifications
      </button>
      <button id="notify" onClick={() => createNotification()}>
        Get notification right now
      </button>
      <TimeTable date={loadedDate} timesheet={todaysTimesheet} />
    </div>
  );
}

export default TimeTracker;
