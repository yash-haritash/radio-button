const FONT_SIZE_MAP = {
  'heading-1': 72, 'heading-2': 60, 'heading-3': 48, 'heading-4': 44,
  'subtitle-1': 30, 'subtitle-2': 24, 'body-1': 20, 'body-2': 18,
  'body-3': 16, 'body-4': 14, 'code-1': 12, 'code-2': 11, 'code-3': 10
};

const SIZE_MAPPINGS = {
  width: {
    'auto': 'auto', 'xxs': '200px', 'xs': '360px', 'sm': '400px',
    'md': '540px', 'lg': '640px', 'xl': '1024px',
    'fill': '100%', 'inherit': 'inherit', 'fit-content': 'fit-content'
  },
height: {
  'auto': 'auto',
  'xxs': '200px',
  'xs': '360px',
  'sm': '400px',
  'mdsets': '540px',
  'lg': '640px',
  'xl': '1024px',
  'fill': '100%'
}
};

function convertFigmaRadioButtonToUnify(figmaJson, overrides = {}) {
  // Helper function to convert RGBA to hex
  function rgbaToHex(r, g, b, a) {
    const toHex = (value) => {
      const hex = Math.round(value * 255).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    };
    const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ""}`;
    return hex.toUpperCase();
  }

  // Extract nodes
  const nodes = figmaJson.Result?.nodes || figmaJson.nodes || {};
  const nodeKey = Object.keys(nodes)[0];
  const figmaNode = nodes[nodeKey]?.document || {};
  const props = figmaNode.componentProperties || {};

  // Find text and supporting text nodes
  const textFrame = figmaNode.children?.find(child => child.name === "Text and supporting text")?.children || [];
  const textNode = textFrame.find(child => child.name === "Text") || {};
  const supportingTextNode = textFrame.find(child => child.name === "Supporting text") || {};

  // Extract colors
  const labelColor = textNode.fills?.[0]?.color || { r: 0.2, g: 0.2, b: 0.2, a: 1 };
  const descriptionColor = supportingTextNode.fills?.[0]?.color || { r: 0.3, g: 0.3, b: 0.3, a: 1 };
  const checkboxBase = figmaNode.children?.find(child => child.name === "Input")?.children?.[0] || {};
  const backgroundColor = checkboxBase.background?.[0]?.color || { r: 1, g: 1, b: 1, a: 1 };

  const labelHex = rgbaToHex(labelColor.r, labelColor.g, labelColor.b, labelColor.a);
  const descriptionHex = rgbaToHex(descriptionColor.r, descriptionColor.g, descriptionColor.b, descriptionColor.a);
  const bgHex = rgbaToHex(backgroundColor.r, backgroundColor.g, backgroundColor.b, backgroundColor.a);

  // Extract properties
  const size = getPropertyValue(props, "Size", "md").toLowerCase();
  const isDisabled = getPropertyValue(props, "State") === "Disabled";
  const label = overrides.label || textNode.characters || getPropertyValue(props, "Label", "Radio Button");
  const description = overrides.description || supportingTextNode.characters || getPropertyValue(props, "Description", "");
  const fontSizeVariant = textNode.style?.fontSize ? Object.keys(FONT_SIZE_MAP).find(key => FONT_SIZE_MAP[key] === textNode.style.fontSize) || 'body-4' : 'body-4';
  const id = overrides.id || generateId("rb_");

  // Map font weight
  const fontWeight = textNode.style?.fontWeight ? mapFontWeightFromNumeric(textNode.style.fontWeight) : 'medium';

  return {
    [id]: {
      component: {
        componentType: "RadioButton",
        appearance: {
          size: mapUnifySize(size),
          description: {
            color: isDisabled ? '#CCCCCC' : descriptionHex,
            variant: 'text-xxs',
            weight: 'regular',
            fontSize: FONT_SIZE_MAP['code-2']
          },
          label: {
            color: isDisabled ? '#CCCCCC' : labelHex,
            variant: mapTextVariant(size),
            weight: fontWeight,
            fontSize: FONT_SIZE_MAP[fontSizeVariant] || FONT_SIZE_MAP['body-4']
          }
        },
        layout: {
          width: mapDimension('width', figmaNode.absoluteBoundingBox?.width ? mapSizeFromPixels(figmaNode.absoluteBoundingBox.width, 'width') : 'auto'),
          height: mapDimension('height', figmaNode.absoluteBoundingBox?.height ? mapSizeFromPixels(figmaNode.absoluteBoundingBox.height, 'height') : 'auto')
        },
        content: {
          label,
          description,
          checked: getPropertyValue(props, "Checked") === "True",
          disabled: isDisabled
        }
      },
      visibility: {
        value: !isDisabled
      },
      dpOn: mapInteractions(figmaNode),
      displayName: overrides.displayName || generateDisplayName("RadioButton"),
      id,
      parentId: overrides.parentId || "root_id"
    }
  };
}

// Helper Functions
function getPropertyValue(props, propName, defaultValue = "") {
  return props[propName]?.value ?? defaultValue;
}

function generateDisplayName(baseName) {
  return `${baseName}_${Math.random().toString(36).substring(2, 7)}`;
}

function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
}

function mapDimension(type, value) {
  const normalized = value?.toLowerCase() || 'auto';
  return SIZE_MAPPINGS[type][normalized] || SIZE_MAPPINGS[type]['auto'];
}

function mapUnifySize(figmaSize) {
  const sizeMap = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' };
  return sizeMap[figmaSize?.toLowerCase()] || 'md';
}

function mapTextVariant(size) {
  const variantMap = { sm: 'text-sm', md: 'text-md', lg: 'text-lg', xl: 'text-xl' };
  return variantMap[size?.toLowerCase()] || 'text-md';
}

function mapFontWeight(weight) {
  const weights = ['light', 'regular', 'medium', 'semi-bold', 'bold'];
  const normalized = weight?.toLowerCase() || 'medium';
  return weights.includes(normalized) ? normalized : 'medium';
}

function mapFontWeightFromNumeric(weight) {
  if (weight <= 300) return 'light';
  if (weight <= 400) return 'regular';
  if (weight <= 500) return 'medium';
  if (weight <= 600) return 'semi-bold';
  return 'bold';
}

function mapInteractions(node) {
  const interactions = [];
  if (node.interactions?.length > 0) {
    node.interactions.forEach(i => {
      if (i.trigger?.type === 'ON_CLICK') {
        interactions.push({ event: 'click', action: 'toggle' });
      } else if (i.trigger?.type === 'ON_HOVER' || i.trigger?.type === 'MOUSE_ENTER') {
        interactions.push({ event: 'hover', action: 'highlight' });
      }
    });
  }
  return interactions.length ? interactions : [{ event: 'click', action: 'toggle' }];
}

function mapSizeFromPixels(pixels, type) {
  const sizes = Object.keys(SIZE_MAPPINGS[type]).filter(key => SIZE_MAPPINGS[type][key].endsWith('px'));
  const pixelValues = sizes.map(key => parseInt(SIZE_MAPPINGS[type][key]));
  const closest = pixelValues.reduce((prev, curr) => 
    Math.abs(curr - pixels) < Math.abs(prev - pixels) ? curr : prev
  );
  return Object.keys(SIZE_MAPPINGS[type]).find(key => SIZE_MAPPINGS[type][key] === `${closest}px`) || 'auto';
}

// Example usage with fetch
const UNIFY_API_URL = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const FIGMA_URL = 'https://www.figma.com/design/4r7C2sI9cktH4T8atJhmrW/Component-Sheet?node-id=1-5776&t=Br3U1RuFVDcShCrR-4';

const data = { fileUrl: FIGMA_URL };

fetch(UNIFY_API_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(response => {
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
  })
  .then(figmaJson => {
    console.log('Figma API Response:');
    console.log(JSON.stringify(figmaJson, null, 2));

    const unifyOutput = convertFigmaRadioButtonToUnify(figmaJson, {
      label: "Accept Terms",
      id: "terms-radio-1"
    });

    console.log('\nConverted Unify Output:');
    console.log(JSON.stringify(unifyOutput, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
  });