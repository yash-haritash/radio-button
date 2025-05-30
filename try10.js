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

  // Find checkbox base node
  const checkboxBase = figmaNode.children?.find(child => child.name === "Input")?.children?.find(child => child.name === "_Checkbox base") || {};

  // Extract colors
  const labelColor = textNode.fills?.[0]?.color || { r: 0.20392157137393951, g: 0.250980406999588, b: 0.3294117748737335, a: 1 }; // #344054
  const descriptionColor = supportingTextNode.fills?.[0]?.color || { r: 0.27843138575553894, g: 0.3294117748737335, b: 0.40392157435417175, a: 1 }; // #475467
  const radioButtonColor = checkboxBase.background?.[0]?.color || { r: 0.3607843220233917, g: 0.21568627655506134, b: 0.9215686321258545, a: 1 }; // #5C37EB
  const strokeColor = checkboxBase.strokes?.[0]?.color || undefined;

  const labelHex = rgbaToHex(labelColor.r, labelColor.g, labelColor.b, labelColor.a);
  const descriptionHex = rgbaToHex(descriptionColor.r, descriptionColor.g, descriptionColor.b, descriptionColor.a);
  const radioButtonHex = rgbaToHex(radioButtonColor.r, radioButtonColor.g, radioButtonColor.b, radioButtonColor.a);
  const borderHex = strokeColor ? rgbaToHex(strokeColor.r, strokeColor.g, strokeColor.b, strokeColor.a) : radioButtonHex;

  // Extract properties
  const size = getPropertyValue(props, "Size", "md").toLowerCase();
  const isDisabled = getPropertyValue(props, "State") === "Disabled";
  const label = overrides.label || textNode.characters || getPropertyValue(props, "Label", "");
  const description = overrides.description || supportingTextNode.characters || getPropertyValue(props, "Description", "");
  const id = overrides.id || generateId("b_");

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
            weight: 'regular'
          },
          styles: {
            borderColor: isDisabled ? '#CCCCCC' : borderHex
          },
          label: {
            color: isDisabled ? '#CCCCCC' : labelHex,
            variant: mapTextVariant(size),
            weight: fontWeight
          }
        },
        content: {
          description,
          label
        }
      },
      visibility: {
        value: !isDisabled
      },
      dpOn: mapInteractions(figmaNode),
      displayName: overrides.displayName || generateDisplayName("RadioButton"),
      dataSourceIds: [],
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

function mapUnifySize(figmaSize) {
  const sizeMap = { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' };
  return sizeMap[figmaSize?.toLowerCase()] || 'md';
}

function mapTextVariant(size) {
  const variantMap = { sm: 'text-sm', md: 'text-md', lg: 'text-lg', xl: 'text-xl' };
  return variantMap[size?.toLowerCase()] || 'text-sm';
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
  return interactions.length ? interactions : [];
}

// Example usage with fetch
const UNIFY_API_URL = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const FIGMA_URL = 'https://www.figma.com/design/huI2r4FfZauzyQRfwb2sTs/Untitled?node-id=1-62&t=nafiDHsCG1ytZJ0d-4';

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
      id: "terms-radio-1"
    });

    console.log('\nConverted Unify Output:');
    console.log(JSON.stringify(unifyOutput, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
  });