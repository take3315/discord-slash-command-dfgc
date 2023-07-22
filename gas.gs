function doPost(e) {

  const providedApiKey = e.parameter.api_key;
  const apiKeyReport = getPropertyReport();
  const apiKeyTokenChange = getPropertyTokenChange();
  const currentTimestamp = new Date().toISOString();

  if (!providedApiKey || (providedApiKey !== apiKeyReport && providedApiKey !== apiKeyTokenChange)) {

    return ContentService.createTextOutput('Invalid API Key');
  } else {
    try {
      if (providedApiKey === apiKeyTokenChange) {

        const sheetId = '1yeeA31Em5gOCRIoaZ4gAEU1jaktLf4q-kV-qZ_z5mes';
        const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Sheet1');
        const data = JSON.parse(e.postData.contents);

        // Prepare the data to be inserted into the sheet
        const rowData = [
          currentTimestamp,
          data.userId,
          data.reportToken,
        ];

        // Insert the data into the sheet as a new row
        sheet.appendRow(rowData);

        return ContentService.createTextOutput('Token successfully updated.');
      }
      else if (providedApiKey === apiKeyReport) {

        const sheetId = '19dG_lpXsCCAEFgEY1mQWxSS5LJJtf5_ofZ5jYSklxKg';
        const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Sheet1');
        const data = JSON.parse(e.postData.contents);

        // Prepare the data to be inserted into the sheet
        const rowData = [
          currentTimestamp,
          data.username,
          data.reportMonth,
          data.userId,
          data.activity,
          data.roleId1,
          data.roleId2,
          data.roleId3,
          data.roleId4,
          data.roleId5,
          data.roleId6,
          data.roleId7,
          data.roleId8,
          data.roleId9,
          data.roleId10,
          data.roleId11,
          data.roleId12,
          data.roleId13,
          data.roleId14,
          data.roleId15,
          data.roleId16,
          data.roleId17,
          data.roleId18,
          data.roleId19,
          data.roleId20,
        ];

        // Insert the data into the sheet as a new row
        sheet.appendRow(rowData);

        return ContentService.createTextOutput('Data received and inserted successfully');
      }
      else {
        return ContentService.createTextOutput('Invalid API Key');
      }
    } catch (error) {
      // Handle any potential errors
      return ContentService.createTextOutput('Error: ' + error.message);
    }
  }
}

// Function to set the API keys for "report" and "token change" actions in script properties
function setProperties() {
  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty('apiKeyReport', '');
  scriptProperties.setProperty('apiKeyTokenChange', '');
}

function getPropertyReport() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('apiKeyReport');
}


function getPropertyTokenChange() {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty('apiKeyTokenChange');
}

