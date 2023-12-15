import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function TimeTable(props) {
  const { date, timesheet } = props;
  const columns = ["Start Time", "End Time", "Case Name", "Activity"];

  const getTimesheetArray = () => {
    const rowLength = 4;
    console.log(timesheet);
    let elementsToSplit = timesheet;

    if (timesheet.slice(1, timesheet.length).includes("\n")) {
      elementsToSplit = timesheet.split("\n");
      elementsToSplit = elementsToSplit.join();
    }
    const elements = elementsToSplit.split(",");

    let a = 0;
    let b = 4;
    const returnArray = [];
    while (b <= elements.length) {
      returnArray.push(elements.slice(a, b));
      a += rowLength;
      b += rowLength;
    }
    return returnArray;
  };
  const timesheetArray = getTimesheetArray();

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: {
          sm: "80%", // theme.breakpoints.up('sm')
          md: "50%", // theme.breakpoints.up('md')
        },
      }}
    >
      <h2>{date}</h2>
      <Table size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell>{col}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {timesheetArray.map((row) => {
            return (
              <TableRow>
                <TableCell>{row[0]}</TableCell>
                <TableCell>{row[1]}</TableCell>
                <TableCell>{row[2]}</TableCell>
                <TableCell>{row[3]}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TimeTable;
