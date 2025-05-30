const url = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const data = {
  fileUrl: 'https://www.figma.com/design/4r7C2sI9cktH4T8atJhmrW/Component-Sheet?node-id=1-5780&t=Br3U1RuFVDcShCrR-4',
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