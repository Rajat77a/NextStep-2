# Local Storage Behavior

NextStep.AI currently stores application data in the browser using localStorage helpers.

This is expected for the current version.

Implications:

- Data is tied to the browser and device.
- Clearing browser storage clears app data.
- There is no shared database between users or devices.
- This behavior is suitable for demos and prototypes, not production persistence.

Future backend work should preserve the existing type shapes where possible.

