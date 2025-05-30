const url = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const data = {
  fileUrl: 'https://www.figma.com/design/huI2r4FfZauzyQRfwb2sTs/Untitled?node-id=5-67&t=nafiDHsCG1ytZJ0d-4',
};
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then(response => response.json())
  .then(json => {
    console.log('Beautified Response:\n');
    console.log(JSON.stringify(json, null, 2)); // Beautify with indentation
  })
  .catch(error => {
    console.error('Error:', error);
  });