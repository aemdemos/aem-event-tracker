# AEM Event Tracker

An event tracking system built on AEM Edge Delivery Services that displays event data from Excel files (published as JSON) in an interactive, sortable, and paginated table.

## Environments

- Preview: https://main--aem-event-tracker--aemdemos.aem.page/event-tracker
- Live: https://main--aem-event-tracker--aemdemos.aem.live/event-tracker

## Features

- Fetches data from Excel files published as JSON from SharePoint
- Automatic Excel serial date conversion (MM/DD/YYYY)
- Configurable column selection
- Multi-column sorting (click headers to sort)
- Pagination (10, 25, 50, 100 items per page)
- Automatic past event filtering (enabled by default)
- Responsive design with full-width layout

## Usage

### Basic Usage

Create a table in your Word document with the block name "event-tracker":

```
| Event Tracker                    |
|----------------------------------|
| /aem-event-tracker-form.json     |
```

### Advanced Configuration

```
| Event Tracker              |                                                          |
|----------------------------|----------------------------------------------------------|
| Source                     | /aem-event-tracker-form.json                             |
| Columns                    | Name, Customer Name, Event Name (if applicable)         |
| Filter Past Events         | false                                                    |
| Date Column                | Custom Date Column                                       |
| Time Column                | Custom Time Column                                       |
```

### Configuration Options

- **Source** (required): Path to the JSON file
- **Columns** (optional): Comma-separated list of column names to display. If omitted, all columns are shown.
- **Filter Past Events** (optional): Set to `false` to disable filtering. Default is `true`.
- **Date Column** (optional): Column name for event end dates. Default is `Event End Date`.
- **Time Column** (optional): Column name for event end times. Default is `Event End Time`.

## Documentation

Before using the aem-boilerplate, we recommend you to go through the documentation on https://www.aem.live/docs/ and more specifically:

1. [Developer Tutorial](https://www.aem.live/developer/tutorial)
2. [The Anatomy of a Project](https://www.aem.live/developer/anatomy-of-a-project)
3. [Web Performance](https://www.aem.live/developer/keeping-it-100)
4. [Markup, Sections, Blocks, and Auto Blocking](https://www.aem.live/developer/markup-sections-blocks)

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)
