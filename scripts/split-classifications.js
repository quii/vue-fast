const fs = require("fs").promises;
const path = require("path");

async function splitClassifications() {
  const fileContent = await fs.readFile(path.join(__dirname, "../src/domain/raw_classifications.js"), "utf8");
  const arrayContent = fileContent.match(/\[([\s\S]*)\]/)[0];
  const rawClassifications = JSON.parse(arrayContent);

  const baseDir = path.join(__dirname, "../public/data/classifications");
  await fs.mkdir(baseDir, { recursive: true });

  const grouped = rawClassifications.reduce((acc, item) => {
    const key = `${item.gender}/${item.bowType}/${item.age}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  for (const [key, items] of Object.entries(grouped)) {
    const filePath = path.join(baseDir, `${key}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(items, null, 2));
  }

  await fs.writeFile(
    path.join(baseDir, "index.json"),
    JSON.stringify(Object.keys(grouped), null, 2)
  );

  console.log("Successfully split classifications into:", baseDir);
}

splitClassifications().catch(console.error);