import React, { useState } from "react";
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

  const getTodaysSheetFromS3 = async () => {
    const AccessKeyId = process.env.REACT_APP_ACCESS_KEY_ID,
      SecretKey = process.env.REACT_APP_SECRET_KEY;

    const credentials = {
      accessKeyId: AccessKeyId,
      secretAccessKey: SecretKey,
    };

    const client = new S3Client({ region: "us-east-2", credentials });

    const todaysTimesheetKey = `${new Date().getMonth()}${new Date().getDate()}${new Date().getFullYear()}_SPO.csv`;
    console.log(14, todaysTimesheetKey);
    const getCommand = new GetObjectCommand({
      Bucket: "timesheets-delta-omega",
      Key: todaysTimesheetKey,
    });

    try {
      const getResponse = await client.send(getCommand);
      // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
      const str = await getResponse.Body.transformToString();
      console.log(44, str);
      setTodaysTimesheet(str);
      console.warn("Timesheet loaded successfully");
    } catch (e) {
      console.log(e);
      console.warn("No timesheet found, starting new sheet for the day");
      const header = ["start_time", "end_time", "case_name", "activity"];
      const csvHeader = header.join(",");
      setTodaysTimesheet(csvHeader);
    }
  };

  const sendFileToS3 = async () => {
    const AccessKeyId = process.env.REACT_APP_ACCESS_KEY_ID,
      SecretKey = process.env.REACT_APP_SECRET_KEY;

    const credentials = {
      accessKeyId: AccessKeyId,
      secretAccessKey: SecretKey,
    };

    const client = new S3Client({ region: "us-east-2", credentials });

    const todaysTimesheetKey = `${new Date().getMonth()}${new Date().getDate()}${new Date().getFullYear()}_SPO.csv`;

    if (authCode !== "SPO") {
      throw new Error("UNAUTHORIZED, UNACCEPTABLE");
    }
    if (!startTime || !endTime || !caseName || !activity) {
      throw new Error("MISSING DATA, UNACCEPTABLE");
    }

    const newData = [startTime, endTime, caseName, activity];
    console.log(newData);
    const row = newData.join(",");
    console.log(row);
    const newTimesheet = todaysTimesheet + `\n${row}`;
    console.log(newTimesheet);
    const putCommand = new PutObjectCommand({
      Bucket: "timesheets-delta-omega",
      Key: todaysTimesheetKey,
      Body: newTimesheet,
    });

    try {
      const putResponse = await client.send(putCommand);
      console.log(putResponse);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadTimesheet = () => {
    // to download
    let csvContentForDownload = "data:text/csv;charset=utf-8,";
    csvContentForDownload += todaysTimesheet;
    var encodedUri = encodeURI(csvContentForDownload);
    window.open(encodedUri);
  };

  console.log(startTime);
  return (
    <div className="container">
      <button onClick={() => getTodaysSheetFromS3()}>
        Get Today's Timesheet
      </button>

      <form>
        <label>
          Start time:
          <input
            type="text"
            name="Start time"
            onChange={(e) => setStartTime(e.target.value)}
          />
        </label>
        <label>
          End time:
          <input
            type="text"
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
          Auth code:
          <input
            type="text"
            name="Auth code"
            onChange={(e) => setAuthCode(e.target.value)}
          />
        </label>
      </form>
      <button onClick={() => sendFileToS3()}>Submit</button>
      <button onClick={() => downloadTimesheet()}>
        Download what I think the current timesheet is
      </button>
    </div>
  );
}

export default TimeTracker;
