self.onmessage = async ({ data: { gender, bowType, age } }) => {
  const classifications = await fetch(`/data/classifications/${gender}/${bowType}/${age}.json`);
  self.postMessage(await classifications.json());
};
