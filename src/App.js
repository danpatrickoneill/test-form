import React from 'react';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
const AccessKeyId = process.env.ACCESS_KEY_ID,
      SecretKey = process.env.SECRET_KEY

const credentials = {
    accessKeyId: AccessKeyId,
    secretAccessKey: SecretKey,
};

const client = new S3Client({region: 'us-east-2', credentials});

const sendFileToS3 = async () => {
  const todaysTimesheetKey = `${new Date().getMonth()}${new Date().getDate()}${new Date().getFullYear()}_SPO.csv`;
  console.log(14, todaysTimesheetKey);
  const getCommand = new GetObjectCommand({
    Bucket: 'timesheets-delta-omega',
    Key: todaysTimesheetKey,
  });
  let response;
  let existingFileResponse;
  try {
    response = await client.send(getCommand);
    // The Body object also has 'transformToByteArray' and 'transformToWebStream' methods.
    existingFileResponse = await response.Body?.transformToString();
    console.log(existingFileResponse);
  } catch (err) {
    console.error(err);
  }
  // if file, append to file; else generate fresh for today
  let csvCopy = await response?.Body?.transformToString();
  let csvContent = 'data:text/csv;charset=utf-8,';
  if (false) {
    const row = ['10', '12', '1000000000'].join(',');
    if (csvCopy.length) {
      csvCopy += `${row}\r\n`;
    }
  } else {
    const rows = [
      ['start_time', 'end_time', 'case_number'],
      ['10', '12', '1000000000'],
    ];

    rows.forEach(function (rowArray) {
      const row = rowArray.join(',');
      csvContent += `${row}\r\n`;
    });
  }

  const putCommand = new PutObjectCommand({
    Bucket: 'timesheets-delta-omega',
    Key: todaysTimesheetKey,
    Body: csvCopy || csvContent,
  });

  try {
    const putResponse = await client.send(putCommand);
    console.log(putResponse);
  } catch (err) {
    console.error(err);
  }
};

function App() {
  return (
    <div className="App">
    <form>
      <label>
        Start time:
        <input type="text" name="Start time" />
      </label>
      <label>
        End time:
        <input type="text" name="End time" />
      </label>
      <label>
        Case number:
        <input type="text" name="Case number" />
      </label>
      <label>
        Auth code:
        <input type="text" name="Auth code" />
      </label>
    </form>
    <button onClick={() => sendFileToS3()}>Submit</button>
    </div>
  );
}

export default App;
