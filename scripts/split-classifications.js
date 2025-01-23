const fs = require("fs").promises;
const path = require("path");

async function splitClassifications() {
  const fileContent = await fs.readFile(path.join(__dirname, "../src/domain/raw_classifications.js"), "utf8");
  const arrayContent = fileContent.match(/\[([\s\S]*)\]/)[0];
  const rawClassifications = JSON.parse(arrayContent);

  // Update base directory to src
  const baseDir = path.join(__dirname, "../src/data/classifications");
  await fs.mkdir(baseDir, { recursive: true });

  // Group classifications by gender/bowType/age
  const grouped = rawClassifications.reduce((acc, item) => {
    const key = `${item.gender}/${item.bowType}/${item.age}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  // Write each group to its own .js file with export
  for (const [key, items] of Object.entries(grouped)) {
    const filePath = path.join(baseDir, `${key}.js`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const fileContent = `export default ${JSON.stringify(items, null, 2)}`;
    await fs.writeFile(filePath, fileContent);
  }

  // Create an index file with the available paths
  const index = Object.keys(grouped);
  await fs.writeFile(
    path.join(baseDir, "index.js"),
    `export default ${JSON.stringify(index, null, 2)}`
  );

  console.log("Successfully split classifications into:", baseDir);
}

splitClassifications().catch(console.error);