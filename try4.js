const UNIFY_API_URL = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const FIGMA_URL = 'https://www.figma.com/design/huI2r4FfZauzyQRfwb2sTs/Untitled?node-id=1-62&t=nafiDHsCG1ytZJ0d-4';

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
    'auto': 'auto', 'xxs': '200px', 'xs': '360px', 'sm': '400px',
    'md': '540px', 'lg': '640px', 'xl': '1024px', 'fill': '100%'
  }
};

// Main Conversion Function
function convertFigmaRadioButtonToUnify(figmaJson, overrides = {}) {
  const nodes = figmaJson.Result?.nodes || figmaJson.nodes || {};
  const nodeKey = Object.keys(nodes)[0];
  const figmaNode = nodes[nodeKey]?.document || {};
  const props = figmaNode.componentProperties || {};

  const size = getPropertyValue(props, "Size", "md").toLowerCase();
  const isDisabled = getPropertyValue(props, "State") === "Disabled";
  const label = overrides.label || getPropertyValue(props, "Label", "Radio Button");
  const fontSizeVariant = getPropertyValue(props, "FontSize", "body-4").toLowerCase();

  const id = overrides.id || generateId("rb_");

  return {
    [id]: {
      component: {
        componentType: "RadioButton",
        appearance: {
          size: mapUnifySize(size),
          description: {
            color: isDisabled ? 'text-disabled' : 'text-secondary',
            variant: 'text-xxs',
            weight: 'regular',
            fontSize: FONT_SIZE_MAP['code-2']
          },
          label: {
            color: isDisabled ? 'text-disabled' : 'text-primary',
            variant: mapTextVariant(size),
            weight: mapFontWeight(getPropertyValue(props, "Weight", "medium")),
            fontSize: FONT_SIZE_MAP[fontSizeVariant] || FONT_SIZE_MAP['body-4']
          }
        },
        layout: {
          width: mapDimension('width', getPropertyValue(props, "Width", "auto")),
          height: mapDimension('height', getPropertyValue(props, "Height", "auto"))
        },
        content: {
          label,
          description: overrides.description || getPropertyValue(props, "Description", ""),
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

// Fetch and Convert Logic
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

// Helper Functions (same as before)
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

function mapInteractions(node) {
  const interactions = [];
  if (node.interactions?.length > 0) {
    node.interactions.forEach(i => {
      if (i.trigger?.type === 'ON_CLICK') {
        interactions.push({ event: 'click', action: 'toggle' });
      } else if (i.trigger?.type === 'ON_HOVER') {
        interactions.push({ event: 'hover', action: 'highlight' });
      }
    });
  }
  return interactions.length ? interactions : [{ event: 'click', action: 'toggle' }];
}
