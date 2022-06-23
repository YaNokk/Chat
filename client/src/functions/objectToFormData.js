export const ObjectToFormData = (obj) => {
  if (!obj) {
    return;
  }
  const form = new FormData();
  for (const key in obj) {
    form.append(key, obj[key]);
  }
  return form;
};
