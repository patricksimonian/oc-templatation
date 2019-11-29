export const action = function(file, options) {
  let jsonData = {};

  let isJson = true;

  if (!/(\.json|.yaml)$/.test(file)) {
    throw new Error('Invalid file format. Only JSON and YAML files allowed.');
  }

  const fileData = getFile(file);
  try {
    // attempt to parse as json
    jsonData = JSON.parse(fileData);
  } catch (e) {
    jsonData = yaml.safeLoad(fileData);
    isJson = false;
  }

  if (!isFileTemplate(jsonData)) {
    console.log('file is not a template!');
    process.exit(1);
  }
};
