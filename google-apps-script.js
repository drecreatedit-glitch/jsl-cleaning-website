/**
 * JSL Cleaning Services — Google Apps Script
 * ─────────────────────────────────────────────────────────────
 * DEPLOY INSTRUCTIONS:
 * 1. Open your Google Sheet
 * 2. Extensions → Apps Script
 * 3. Delete default code, paste this entire file
 * 4. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL → paste into QuoteForm.jsx (GOOGLE_SCRIPT_URL)
 * ─────────────────────────────────────────────────────────────
 *
 * Sheet ID: 18aB3NxGE67Qsr8tWzxNDE2KlhBwa0hn0WYY8LQ2HYuc
 */

const SHEET_NAME = 'Leads';
const NOTIFY_EMAIL = 'jlopez@jslcleaningservices.com';
const SHEET_HEADERS = [
  'Timestamp (ET)', 'Full Name', 'Email', 'Phone', 'Service Address',
  'Service Type', 'Frequency', 'Bedrooms', 'Bathrooms', 'Sq Ft',
  'Property Type', 'Add-Ons', 'Start Date', 'Preferred Time',
  'Estimated $', 'Notes', 'Status',
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

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
      sheet.setColumnWidth(2, 140);  // Name
      sheet.setColumnWidth(3, 200);  // Email
      sheet.setColumnWidth(4, 130);  // Phone
      sheet.setColumnWidth(5, 250);  // Address
    }

    // ── Append the lead row ──────────────────────────────────
    sheet.appendRow([
      new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }),
      `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      data.email || '',
      data.phone || '',
      data.address || '',
      data.service || '',
      data.frequency || '',
      data.bedrooms || '',
      data.bathrooms || '',
      data.sqft || '',
      data.propertyType || '',
      (data.addons || []).join(', '),
      data.startDate || '',
      data.preferredTime || '',
      data.estimate ? `$${data.estimate}` : 'Custom',
      data.notes || '',
      'New',            // Default status column — manually update to Booked/Declined etc.
    ]);

    // ── Color new rows alternately for readability ───────────
    const lastRow = sheet.getLastRow();
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, SHEET_HEADERS.length)
        .setBackground('#F4F9FF');
    }

    // ── Email notification to Josh ───────────────────────────
    const estimateStr = data.estimate ? `$${data.estimate} / clean` : 'Custom quote needed';
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `🧹 New Quote — ${data.firstName} ${data.lastName || ''} | ${data.service}`,
      htmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <div style="background: #1578E5; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="color: white; margin: 0;">New Quote Request</h2>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">JSL Cleaning Services</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; width: 140px;">Name</td><td style="padding: 8px;">${data.firstName} ${data.lastName || ''}</td></tr>
              <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Phone</td><td style="padding: 8px;"><a href="tel:${data.phone}">${data.phone}</a></td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Email</td><td style="padding: 8px;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
              <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Address</td><td style="padding: 8px;">${data.address}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Service</td><td style="padding: 8px;">${data.service}</td></tr>
              <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Frequency</td><td style="padding: 8px;">${data.frequency}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Property</td><td style="padding: 8px;">${data.bedrooms} bed / ${data.bathrooms} bath — ${(data.sqft || 0).toLocaleString()} sq ft</td></tr>
              <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Estimate</td><td style="padding: 8px; color: #1578E5; font-weight: bold; font-size: 18px;">${estimateStr}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold;">Start Date</td><td style="padding: 8px;">${data.startDate || 'TBD'}</td></tr>
              <tr style="background: #fff;"><td style="padding: 8px; font-weight: bold;">Notes</td><td style="padding: 8px;">${data.notes || '—'}</td></tr>
            </table>
          </div>
          <div style="background: #0B1220; padding: 16px; border-radius: 0 0 8px 8px; text-align: center;">
            <a href="https://docs.google.com/spreadsheets/d/18aB3NxGE67Qsr8tWzxNDE2KlhBwa0hn0WYY8LQ2HYuc" 
               style="color: #1578E5; font-weight: bold; text-decoration: none;">
              📊 View All Leads in Google Sheets →
            </a>
          </div>
        </div>
      `,
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Log error but don't expose internals to client
    console.error('JSL Form Error:', err);
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function — run this manually in Apps Script to verify email works
function testEmail() {
  doPost({
    postData: {
      contents: JSON.stringify({
        firstName: 'Test', lastName: 'Client',
        email: NOTIFY_EMAIL, phone: '(347) 555-1234',
        address: '123 Test St, Miami FL 33101',
        service: 'basic', frequency: 'biweekly',
        bedrooms: 3, bathrooms: 2, sqft: 1600,
        propertyType: 'House', addons: ['windows', 'laundry'],
        startDate: '2026-04-01', preferredTime: 'morning',
        estimate: 230, notes: 'Test submission — please ignore',
      })
    }
  });
}
