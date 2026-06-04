import { initializeApp as initAdminApp } from "firebase-admin/app";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";
import { initializeApp as initClientApp } from "firebase/app";
import { getFirestore as getClientFirestore, collection, getDocs } from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

async function runTest() {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (!fs.existsSync(configPath)) {
    console.log("No config found!");
    process.exit(0);
  }
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const dbId = config.firestoreDatabaseId;

  console.log("Database ID:", dbId);

  // Test admin
  try {
    const adminApp = initAdminApp({ projectId: config.projectId });
    const adminDb = getAdminFirestore(adminApp, dbId);
    const snap = await adminDb.collection("authority_doctrine").limit(1).get();
    console.log("Admin OK! Docs:", snap.size);
  } catch (err: any) {
    console.log("Admin Error:", err.message);
  }

  // Test client
  try {
    const clientApp = initClientApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      storageBucket: config.storageBucket,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId
    });
    const clientDb = getClientFirestore(clientApp, dbId);
    const snap = await getDocs(collection(clientDb, "authority_doctrine"));
    console.log("Client OK! Docs:", snap.size);
    
    try {
      const snapMsg = await getDocs(collection(clientDb, "copilot_messages"));
      console.log("Copilot messages read success! Count:", snapMsg.size);
    } catch (msgErr: any) {
      console.log("Copilot messages read Error:", msgErr.message);
    }
  } catch (err: any) {
    console.log("Client Error:", err.message);
  }

  process.exit(0);
}

runTest().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
