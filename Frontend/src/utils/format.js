export const isRecent = (timestampIso, minutes = 60) => {
  const created = new Date(timestampIso);
  const diff = (Date.now() - created.getTime()) / (1000 * 60);
  return diff <= minutes;
};

export const formatDate = (ts) => {
  const d = new Date(ts);
  return d.toLocaleString();
};
