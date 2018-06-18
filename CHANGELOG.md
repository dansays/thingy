# Changelog

## [1.3.2] 2018-06-18

- **[ADDED]**    Multi-line notes (thanks, [edgauthier](https://github.com/edgauthier)!)
- **[FIXED]**    Remove task order reversal step after Things bug fix
- **[FIXED]**    Various refactors and general code clean-up

## [1.3.1] 2018-05-03

- **[FIXED]**		 Fix premature reminder time-based "This Evening" filing

## [1.3.0] 2018-04-30

- **[ADDED]**    Template tag processing
- **[ADDED]**    Simple date offset notation

## [1.2.0] 2018-04-29

- **[ADDED]**    Ability to create a new project

## [1.1.0] 2018-04-29

- **[CHANGED]**  Autotagger rules are now defined in a Draft note, rather than as regular expressions in code
- **[ADDED]**    Ability to assign a header to a task

## [1.0.2] 2018-04-27

- **[FIXED]**    Date picker runtime error when "other" selected (#1)
- **[FIXED]**    Relative dates sometimes parsed as past dates (#1)
## [1.0.1] 2018-04-26

- **[CHANGED]**  Draft not moved to trash after processing if flagged, or if a task is processed via selected text
- **[CHANGED]**  Updated `date-picker.js` to return value in a `[[when]]` template tag, rather than storing in the clipboard
- **[CHANGED]**  Prevent sending empty task list to Things, if no tasks are found
- **[ADDED]**    Additional autotagger instructions to documentation
- **[FIXED]**    Bring focus to the editor after date picker action has completed
