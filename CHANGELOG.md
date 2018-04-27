# Changelog

## [1.0.2] 2018-04-27

- **[FIXED]**    Date picker runtime error when "other" selected (#1)
- **[FIXED]**    Relative dates sometimes parsed as past dates (#1)
## [1.0.1] 2018-04-26

- **[CHANGED]**  Draft not moved to trash after processing if flagged, or if a task is processed via selected text
- **[CHANGED]**  Updated `date-picker.js` to return value in a `[[when]]` template tag, rather than storing in the clipboard
- **[CHANGED]**  Prevent sending empty task list to Things, if no tasks are found
- **[ADDED]**    Additional autotagger instructions to documentation
- **[FIXED]**    Bring focus to the editor after date picker action has completed
