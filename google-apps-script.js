/**
 * JSL Cleaning Services — Google Apps Script
 * ─────────────────────────────────────────────────────────────
 * DEPLOY INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Delete the default code, paste this ENTIRE file, Save
 * 4. Deploy → Manage deployments → edit the active deployment → Deploy
 *    (re-deploying is required for changes to take effect)
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. The first run will ask you to re-authorize — it now needs Drive
 *    access to save uploaded photos. Approve it.
 *
 * NOTE: This version adds: a 2nd notification email, the "Pets" field,
 * uploaded photo links (saved to Google Drive), and handles the
 * Special Request form (labeled separately from quotes).
 *
 * If your Sheet has old test rows with the previous column layout,
 * either clear them or delete the "Leads" tab so it regenerates with
 * the new columns below.
 * ─────────────────────────────────────────────────────────────
 *
 * Sheet ID: 18aB3NxGE67Qsr8tWzxNDE2KlhBwa0hn0WYY8LQ2HYuc
 */

const SHEET_NAME    = 'Leads';
const SHEET_ID      = '18aB3NxGE67Qsr8tWzxNDE2KlhBwa0hn0WYY8LQ2HYuc';
const NOTIFY_EMAIL  = 'jlopez@jslcleaningservices.com, drecreatedit@gmail.com';
const PHOTO_FOLDER  = 'JSL Quote Photos';

const SHEET_HEADERS = [
  'Timestamp (ET)', 'Type', 'Full Name', 'Email', 'Phone', 'Service Address',
  'Service Type', 'Frequency', 'Bedrooms', 'Bathrooms', 'Sq Ft',
  'Property Type', 'Pets', 'Add-Ons', 'Start Date', 'Preferred Time',
  'Estimated $', 'Photos', 'Notes / Summary', 'Status',
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const isSpecial = data.type === 'special-request';

    // ── Resolve a single display name across both form types ──
    const fullName = isSpecial
      ? (data.name || '').trim()
      : `${data.firstName || ''} ${data.lastName || ''}`.trim();

    // ── Save uploaded photos to Drive, collect shareable links ──
    const photoLinks = savePhotosToDrive(data.photos, fullName);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // ── Create & format sheet on first run ───────────────────
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headerRow = sheet.getRange(1, 1, 1, SHEET_HEADERS.length);
      headerRow.setValues([SHEET_HEADERS]);
      headerRow.setFontWeight('bold');
      headerRow.setBackground('#1578E5');
      headerRow.setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
      sheet.setColumnWidth(1, 160);  // Timestamp
      sheet.setColumnWidth(3, 140);  // Name
      sheet.setColumnWidth(4, 200);  // Email
      sheet.setColumnWidth(5, 130);  // Phone
      sheet.setColumnWidth(6, 250);  // Address
      sheet.setColumnWidth(18, 220); // Photos
      sheet.setColumnWidth(19, 280); // Notes / Summary
    }

    // ── Append the lead row (order matches SHEET_HEADERS) ────
    sheet.appendRow([
      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      isSpecial ? 'Special Request' : 'Quote',
      fullName,
      data.email || '',
      data.phone || '',
      data.address || '',
      data.service || '',
      data.frequency || '',
      data.bedrooms || '',
      data.bathrooms || '',
      data.sqft || '',
      data.propertyType || '',
      data.pets || '',
      (data.addons || []).join(', '),
      data.startDate || '',
      data.preferredTime || '',
      data.estimate ? `$${data.estimate}` : (isSpecial ? '' : 'Custom'),
      photoLinks.join('\n'),
      isSpecial ? (data.summary || '') : (data.notes || ''),
      'New',            // Status — manually update to Booked/Declined etc.
    ]);

    // ── Color new rows alternately for readability ───────────
    const lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, SHEET_HEADERS.length).setBackground('#F4F9FF');
    }

    // ── Email notification ───────────────────────────────────
    if (isSpecial) {
      sendSpecialRequestEmail(data, fullName, photoLinks);
    } else {
      sendQuoteEmail(data, fullName, photoLinks);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error('JSL Form Error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/* ─────────────────────────────────────────────────────────────
   Save base64 photos to a Drive folder → return shareable links
   ───────────────────────────────────────────────────────────── */
function savePhotosToDrive(photos, leadName) {
  const links = [];
  if (!photos || !photos.length) return links;

  const folder = getOrCreateFolder(PHOTO_FOLDER);
  const stamp = new Date().toISOString().slice(0, 10);

  photos.forEach((p, i) => {
    try {
      const dataUrl = String(p.base64 || '');
      const m = dataUrl.match(/^data:(.+?);base64,(.*)$/);
      if (!m) return;
      const contentType = m[1];
      const bytes = Utilities.base64Decode(m[2]);
      const safeName = (leadName || 'lead').replace(/[^\w]+/g, '_');
      const ext = contentType.split('/')[1] || 'jpg';
      const blob = Utilities.newBlob(bytes, contentType, `${stamp}_${safeName}_${i + 1}.${ext}`);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      links.push(file.getUrl());
    } catch (err) {
      console.error('Photo save failed:', err);
    }
  });
  return links;
}

function getOrCreateFolder(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

/* ─────────────────────────────────────────────────────────────
   Email: full quote request
   ───────────────────────────────────────────────────────────── */
function sendQuoteEmail(data, fullName, photoLinks) {
  const estimateStr = data.estimate ? `$${data.estimate} / clean` : 'Custom quote needed';
  const photosHtml = photoLinks.length
    ? photoLinks.map((u, i) => `<a href="${u}">Photo ${i + 1}</a>`).join(' &nbsp;•&nbsp; ')
    : '—';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `🧹 New Quote — ${fullName} | ${data.service}`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #1578E5; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">New Quote Request</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">JSL Cleaning Services</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Name</td><td style="padding: 8px;">${fullName}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Address</td><td style="padding: 8px;">${data.address}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Service</td><td style="padding: 8px;">${data.service}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Frequency</td><td style="padding: 8px;">${data.frequency}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Property</td><td style="padding: 8px;">${data.bedrooms} bed / ${data.bathrooms} bath — ${(data.sqft || 0).toLocaleString()} sq ft (${data.propertyType || '—'})</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Pets</td><td style="padding: 8px;">${data.pets || 'No'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Add-Ons</td><td style="padding: 8px;">${(data.addons || []).join(', ') || '—'}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Estimate</td><td style="padding: 8px; color: #1578E5; font-weight: bold; font-size: 18px;">${estimateStr}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Start Date</td><td style="padding: 8px;">${data.startDate || 'TBD'}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Photos</td><td style="padding: 8px;">${photosHtml}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Notes</td><td style="padding: 8px;">${data.notes || '—'}</td></tr>
          </table>
        </div>
        ${sheetFooter()}
      </div>
    `,
  });
}

/* ─────────────────────────────────────────────────────────────
   Email: special request (short contact form)
   ───────────────────────────────────────────────────────────── */
function sendSpecialRequestEmail(data, fullName, photoLinks) {
  const photosHtml = photoLinks.length
    ? photoLinks.map((u, i) => `<a href="${u}">Photo ${i + 1}</a>`).join(' &nbsp;•&nbsp; ')
    : '—';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: `✉️ Special Request — ${fullName}`,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <div style="background: #0B1220; padding: 20px; border-radius: 8px 8px 0 0;">
          <h2 style="color: white; margin: 0;">New Special Request</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">JSL Cleaning Services</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Name</td><td style="padding: 8px;">${fullName}</td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;"><a href="tel:${data.phone}">${data.phone || '—'}</a></td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Photos</td><td style="padding: 8px;">${photosHtml}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; vertical-align: top;">Request</td><td style="padding: 8px; white-space: pre-wrap;">${data.summary || '—'}</td></tr>
          </table>
        </div>
        ${sheetFooter()}
      </div>
    `,
  });
}

function sheetFooter() {
  return `
    <div style="background: #0B1220; padding: 16px; border-radius: 0 0 8px 8px; text-align: center;">
      <a href="https://docs.google.com/spreadsheets/d/${SHEET_ID}"
         style="color: #1578E5; font-weight: bold; text-decoration: none;">
        📊 View All Leads in Google Sheets →
      </a>
    </div>`;
}

/* ─────────────────────────────────────────────────────────────
   Test functions — run manually in the Apps Script editor
   ───────────────────────────────────────────────────────────── */
function testQuoteEmail() {
  doPost({ postData: { contents: JSON.stringify({
    firstName: 'Test', lastName: 'Client',
    email: 'test@example.com', phone: '(347) 555-1234',
    address: '123 Test St, Boca Raton FL 33432',
    service: 'Deep Cleaning', frequency: 'Bi-Weekly',
    bedrooms: 3, bathrooms: 2, sqft: 1600,
    propertyType: 'House', pets: 'Yes', addons: ['Interior Windows', 'Laundry (wash + fold)'],
    startDate: '2026-07-01', preferredTime: 'morning',
    estimate: 352, notes: 'Test submission — please ignore', photos: [],
  }) } });
}

function testSpecialRequest() {
  doPost({ postData: { contents: JSON.stringify({
    type: 'special-request',
    name: 'Test Person', email: 'test@example.com', phone: '(347) 555-9999',
    summary: 'Need a one-time post-renovation clean for a 2-car garage. Lots of dust.',
    photos: [],
  }) } });
}
