const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");
const { SCOPES, TOKEN_PATH, SPREADSHEET_ID } = require("./settings");

// If modifying these scopes, delete token.json.
// const SCOPES = [
//   "https://www.googleapis.com/auth/spreadsheets",
//   "https://www.googleapis.com/auth/drive.file",
// ];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
// const TOKEN_PATH = "token.json";
// const spreadsheetId = "1UcZ47-kYD5OzMZKuyKh4TfiFfhlnf3ooyI5R6u8PRbM";

async function connect(func) {
  // Load client secrets from a local file.
  // fs.readFile("credentials.json", (err, content) => {
  //   if (err) return console.log("Error loading client secret file:", err);
  //   // Authorize a client with credentials, then call the Google Sheets API.
  //   authorize(JSON.parse(content), func);
  // });

  try {
    let response = await fs.readFileSync("credentials.json");
    return await authorize(JSON.parse(response), func);
  } catch (err) {
    return console.log("Error loading client secret file:", err);
  }
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  // fs.readFile(TOKEN_PATH, async (err, token) => {
  //   if (err) return getNewToken(oAuth2Client, callback);
  //   oAuth2Client.setCredentials(JSON.parse(token));
  //   return await callback(oAuth2Client);
  // });

  try {
    let response = await fs.readFileSync(TOKEN_PATH);
    oAuth2Client.setCredentials(JSON.parse(response));
    return await callback(oAuth2Client);
  } catch (err) {
    return getNewToken(oAuth2Client, callback);
  }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Enter the code from that page here: ", (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err)
        return console.error(
          "Error while trying to retrieve access token",
          err
        );
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log("Token stored to", TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

// export functions

async function update(req, res) {
  return await connect(async (auth) => {
    const sheets = await google.sheets({ version: "v4", auth });
    return sheets.spreadsheets.values.update(
      {
        spreadsheetId: SPREADSHEET_ID,
        ...req,
      },
      (err, result) => {
        if (err) {
          // Handle error
          console.log(err);
        } else {
          // console.log("%d cells updated.", result.updatedCells);
          res && res.json(200);
        }
      }
    );
  });
}

async function append(req, res) {
  return await connect(async (auth) => {
    const sheets = await google.sheets({ version: "v4", auth });
    return sheets.spreadsheets.values.append(
      {
        spreadsheetId: SPREADSHEET_ID,
        ...req,
      },
      (err, result) => {
        if (err) {
          // Handle error
          console.log(err);
        } else {
          // console.log("%d cells updated.", result.updatedCells);
          res && res.json(200);
        }
      }
    );
  });
}

async function get(req) {
  return await connect(async (auth) => {
    const sheets = await google.sheets({ version: "v4", auth });
    const response = (
      await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        ...req,
      })
    ).data;

    return response;
  });
}

async function batchGet(req) {
  return await connect(async (auth) => {
    const sheets = await google.sheets({ version: "v4", auth });
    const response = (
      await sheets.spreadsheets.values.batchGet({
        spreadsheetId: SPREADSHEET_ID,
        ...req,
      })
    ).data;

    return response;
  });
}

function uploadScreenshot(reqData) {
  connect((auth) => {
    const drive = google.drive({ version: "v3", auth });
    var fileMetadata = {
      name: `${reqData.name}.png`,
    };
    var media = {
      mimeType: "image/png",
      body: fs.createReadStream(`screenshot/${reqData.name}.png`),
    };
    drive.files.create(
      {
        resource: fileMetadata,
        media: media,
        fields: "id",
      },
      function (err, file) {
        if (err) {
          // Handle error
          console.error(err);
        } else {
          console.log("File Id: ", file.id);
        }
      }
    );
  });
}

exports.update = update;
exports.append = append;
exports.get = get;
exports.batchGet = batchGet;
exports.uploadScreenshot = uploadScreenshot;
