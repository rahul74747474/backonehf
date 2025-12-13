import mongoose from "mongoose";

const DB_NAME = "PRISM"; // <---- CHANGE THIS
const MONGO_URI = `mongodb+srv://humanity:founders@cluster0.pmkgakt.mongodb.net/mohammadziya`;

const COLLECTIONS_TO_CONVERT_IDS = ["users", "projects", "reports", "tasks"];

const isValidId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const toObjectId = (value) => {
  try {
    if (isValidId(value)) return new mongoose.Types.ObjectId(value);
    return value;
  } catch {
    return value;
  }
};

// Recursively convert strings → ObjectId
const deepConvert = (obj) => {
  if (Array.isArray(obj)) return obj.map((v) => deepConvert(v));

  if (obj && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      newObj[key] = deepConvert(obj[key]);
    }
    return newObj;
  }

  return toObjectId(obj);
};

const run = async () => {
  console.log("Connecting...");
  await mongoose.connect(MONGO_URI);
  console.log("Connected ✔");

  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();

  // For reference fixing later
  const idMap = {};

  console.log("\n===============================");
  console.log(" PHASE 1: Convert `_id` fields");
  console.log("===============================\n");

  for (const col of collections) {
    const name = col.name;

    const shouldConvert =
      COLLECTIONS_TO_CONVERT_IDS.includes(name.toLowerCase());

    const collection = db.collection(name);
    const docs = await collection.find({}).toArray();

    console.log(`\n➡ Processing Collection: ${name} (${docs.length} docs)`);

    for (const doc of docs) {
      const oldId = doc._id;

      let newId = oldId;
      if (shouldConvert && typeof oldId === "string" && isValidId(oldId)) {
        newId = new mongoose.Types.ObjectId(oldId);
      }

      idMap[oldId] = newId; // store for reference fixing

      const convertedDoc = deepConvert(doc);
      convertedDoc._id = newId;

      // delete old doc
      await collection.deleteOne({ _id: oldId });

      // insert updated doc
      await collection.insertOne(convertedDoc);
    }

    console.log(`✔ Completed: ${name}`);
  }

  console.log("\n==========================================");
  console.log(" PHASE 2: Update references across DB");
  console.log("==========================================\n");

  for (const col of collections) {
    const name = col.name;
    const collection = db.collection(name);
    const docs = await collection.find({}).toArray();

    for (const doc of docs) {
      const updated = JSON.parse(JSON.stringify(doc));

      const fixRefs = (obj) => {
        if (Array.isArray(obj)) return obj.map(fixRefs);
        if (obj && typeof obj === "object") {
          for (const key in obj) obj[key] = fixRefs(obj[key]);
          return obj;
        }
        return idMap[obj] || obj;
      };

      const fixed = fixRefs(updated);

      delete fixed._id;

      await collection.updateOne({ _id: doc._id }, { $set: fixed });
    }

    console.log(`✔ References fixed for: ${name}`);
  }

  console.log("\n🎉 ALL DONE! All IDs converted + references updated!");
  process.exit();
};

run().catch((err) => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});
