/*
  Usage: set GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json node scripts/setAdminClaim.js <userEmail>
  This will set custom claim { admin: true } for the specified user in the Firebase project.
*/

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/setAdminClaim.js <userEmail>');
  process.exit(1);
}

admin.initializeApp({ credential: admin.credential.applicationDefault() });

(async () => {
  try {
    const u = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(u.uid, { admin: true });
    console.log('Admin claim set for', email);
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err);
    process.exit(1);
  }
})();
