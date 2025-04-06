export const loadClassificationsByCategory = async (gender, bowType, age) => {
  const path = `/data/classifications/${gender}/${bowType}/${age}.json`;
  return await fetch(path).json();
};
