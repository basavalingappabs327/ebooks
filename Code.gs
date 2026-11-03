// ====== CONFIG ======
const SHEET_NAME = 'Sheet1';   // tab that has TYPE | AUTHOR | NAME | DOWNLOAD

// Returns the book list as JSON (used by the GitHub-hosted page)
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  rows.shift(); // remove header row

  const books = rows
    .filter(r => String(r[2]).trim() !== '')
    .map(r => ({
      type:     String(r[0]).trim(),
      author:   String(r[1]).trim(),
      name:     String(r[2]).trim(),
      download: String(r[3]).trim()
    }));

  return ContentService
    .createTextOutput(JSON.stringify(books))
    .setMimeType(ContentService.MimeType.JSON);
}
