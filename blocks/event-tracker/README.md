# Event Tracker Block

This block fetches data from a JSON file (typically an Excel file published from SharePoint) and displays it in a table format.

## Features

- Fetches data from JSON endpoints
- Supports column filtering (display only specific columns)
- Responsive table design
- Loading and error states
- Displays record count

## Usage in Word Document

### Option 1: Display All Columns

Create a table in your Word document with the block name and the JSON file path:

```
| Event Tracker                    |
|----------------------------------|
| /aem-event-tracker-form.json     |
```

### Option 2: Display Specific Columns

Create a table with configuration rows:

```
| Event Tracker |                                                          |
|---------------|----------------------------------------------------------|
| Source        | /aem-event-tracker-form.json                             |
| Columns       | Customer Name, Event Name (if applicable), Event Details |
```

### Option 3: Advanced Configuration with Filtering

Create a table with all configuration options:

```
| Event Tracker |                                                          |
|---------------|----------------------------------------------------------|
| Source        | /aem-event-tracker-form.json                             |
| Columns       | Customer Name, Event Name (if applicable), Event Details |
| Filter Past Events | true                                                |
| Date Column   | Event End Date                                          |
| Time Column   | Event End Time                                          |
```

### Option 4: Using Full URL

You can also use a full URL to fetch data from external sources:

```
| Event Tracker |                                                    |
|---------------|---------------------------------------------------|
| Source        | https://example.com/data.json                      |
```

## JSON Format

The block expects JSON in the following format:

```json
{
  "data": [
    {
      "Column1": "Value1",
      "Column2": "Value2",
      "Column3": "Value3"
    },
    {
      "Column1": "Value4",
      "Column2": "Value5",
      "Column3": "Value6"
    }
  ]
}
```

Or a simple array:

```json
[
  {
    "Column1": "Value1",
    "Column2": "Value2"
  }
]
```

## Configuration Options

| Option             | Description                                      | Required | Default          |
| ------------------ | ------------------------------------------------ | -------- | ---------------- |
| Source             | Path or URL to the JSON file                     | Yes      | -                |
| Columns            | Comma-separated list of column names to display  | No       | All columns      |
| Filter Past Events | Hide events that have already ended (true/false) | No       | true             |
| Date Column        | Name of the column containing event end dates    | No       | "Event End Date" |
| Time Column        | Name of the column containing event end times    | No       | "Event End Time" |

## Examples

### Example 1: Basic Usage

In your Word document:

```
| Event Tracker                    |
|----------------------------------|
| /aem-event-tracker-form.json     |
```

This will display all columns from the JSON file.

### Example 2: Filtered Columns

In your Word document:

```
| Event Tracker |                                                                      |
|---------------|----------------------------------------------------------------------|
| Source        | /aem-event-tracker-form.json                                         |
| Columns       | Name, Customer Name, Event Name (if applicable), Event Start Date    |
```

This will display only the specified columns.

### Example 3: Disable Past Event Filtering

In your Word document:

```
| Event Tracker |                                                          |
|---------------|----------------------------------------------------------|
| Source        | /aem-event-tracker-form.json                             |
| Filter Past Events | false                                             |
```

This will show all events, including past ones.

### Example 4: Custom Date/Time Column Names

If your Excel file uses different column names:

```
| Event Tracker |                                                          |
|---------------|----------------------------------------------------------|
| Source        | /aem-event-tracker-form.json                             |
| Date Column   | End Date                                                  |
| Time Column   | End Time                                                  |
```

This will use "End Date" and "End Time" columns for filtering instead of the defaults.

## Styling

The block includes basic styling with:

- Sticky header that stays visible when scrolling
- Alternating row colors for better readability
- Hover effects on rows
- Responsive design for mobile devices
- Dark header with light text

You can customize the styling by modifying `event-tracker.css`.

## How Excel Files Work in AEM EDS

1. Upload your Excel file to SharePoint (same location as your Word documents)
2. The file will be automatically converted to JSON when published
3. Access it at: `https://your-site.com/path-to-file.json`
4. Use this path in your Event Tracker block

## Troubleshooting

### "Error loading data" message

- Check that the JSON file path is correct
- Ensure the file has been published
- Check browser console for detailed error messages

### Empty table

- Verify the JSON structure matches the expected format
- Check that the `data` property exists in your JSON
- Ensure the JSON file contains data

### Columns not showing

- Verify column names match exactly (case-sensitive)
- Check for typos in the column names
- Ensure the columns exist in your JSON data
