import React, { useState, useEffect } from "react";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function TimeTracker() {
  const [todaysTimesheet, setTodaysTimesheet] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [caseName, setCaseName] = useState("");
  const [activity, setActivity] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [desiredDate, setDesiredDate] = useState("");
  const [loadedDate, setLoadedDate] = useState("");
  const [isFetching, setIsFetching] = useState(true);

  useEffect(
    () => async () => {
      if (isFetching) {
        const test = await fetchSheetFromS3(desiredDate);
        console.log(test);
      }
      setIsFetching(false);
    },
    []
  );

  const AccessKeyId = process.env.REACT_APP_ACCESS_KEY_ID,
    SecretKey = process.env.REACT_APP_SECRET_KEY;

  const credentials = {
    accessKeyId: AccessKeyId,
    secretAccessKey: SecretKey,
  };

  const client = new S3Client({ region: "us-east-2", credentials });

  const fetchSheetFromS3 = async (dateString) => {
    const dateForKey = dateString?.length
      ? new Date(`${dateString} 12:00`)
      : new Date();
    let timesheetKey = `${
      dateForKey.getMonth() + 1
    }${dateForKey.getDate()}${dateForKey.getFullYear()}_SPO.csv`;

    const getCommand = new GetObjectCommand({
      Bucket: "timesheets-delta-omega",
      Key: timesheetKey,
    });

    try {
      const getResponse = await client.send(getCommand);
      const str = await getResponse.Body.transformToString();
      setTodaysTimesheet(str);
      console.log("Timesheet loaded successfully");
      if (dateString.length) {
        setLoadedDate(dateString);
      }
      return str;
    } catch (e) {
      console.log(e);
      console.log("No timesheet found for date");
      if (!dateString?.length) {
        const header = ["start_time", "end_time", "case_name", "activity"];
        const csvHeader = header.join(",");
        setTodaysTimesheet(csvHeader);
        return csvHeader;
      } else {
        console.log("No timesheet found for date");
        window.alert("No timesheet found for date; please try another");
        return;
      }
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
    const newTimesheet = todaysTimesheet + `\n${row}`;
    const putCommand = new PutObjectCommand({
      Bucket: "timesheets-delta-omega",
      Key: todaysTimesheetKey,
      Body: newTimesheet,
    });

    try {
      const putResponse = await client.send(putCommand);
      console.log(putResponse);
      // setSheetSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSheetForDate = async (date) => {
    if (date) {
      await fetchSheetFromS3(date);
    }
  };

  const downloadCurrentTimesheet = () => {
    console.log(todaysTimesheet);
    if (!todaysTimesheet.length) {
      return;
    }
    let csvContentForDownload = "data:text/csv;charset=utf-8,";
    csvContentForDownload += todaysTimesheet;
    const dateToUse = loadedDate?.length
    ? new Date(`${loadedDate} 12:00`)
    : new Date();
    csvContentForDownload += "\n";
    csvContentForDownload += dateToUse.toDateString();
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
      <button onClick={() => sendFileToS3()}>Submit</button>
      <button onClick={() => downloadCurrentTimesheet()}>
        Download currently loaded timesheet
      </button>
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
    </div>
  );
}

export default TimeTracker;
