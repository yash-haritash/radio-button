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
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ""}`.toUpperCase();
  }

  // Extract nodes
  const nodes = figmaJson.Result?.nodes || figmaJson.nodes || {};
  const nodeKey = Object.keys(nodes)[0];
  const figmaNode = nodes[nodeKey]?.document || {};
  // Find radio button instance
  const radioInstance = figmaNode.children?.find(child => child.name === "Radio Buttons" && child.type === "INSTANCE") || {};
  const props = radioInstance.componentProperties || {};

  // Find text and supporting text nodes within radio instance
  const textFrame = radioInstance.children?.find(child => child.name === "Text and supporting text")?.children || [];
  const textNode = textFrame.find(child => child.name === "Text") || {};
  const supportingTextNode = textFrame.find(child => child.name === "Supporting text") || {};

  // Find external text node (e.g., "Text is best") in parent frame
  const externalTextNode = figmaNode.children?.find(child => child.type === "TEXT" && child.characters) || {};

  // Find radio button base or icon node
  const checkboxBase = radioInstance.children?.find(child => child.name === "Input")?.children?.find(child => child.name === "_Checkbox base") || {};
  const iconNode = findIconNode(radioInstance);

  // Helper to extract solid color from fills array
  function getSolidColorFromFills(fills) {
    if (Array.isArray(fills)) {
      const solid = fills.find(f => f.type === 'SOLID' && (f.visible === undefined || f.visible === true));
      if (solid && solid.color) return solid.color;
    }
    return null;
  }

  // Helper to extract solid color from strokes array
  function getSolidColorFromStrokes(strokes) {
    if (Array.isArray(strokes)) {
      const solid = strokes.find(f => f.type === 'SOLID' && (f.visible === undefined || f.visible === true));
      if (solid && solid.color) return solid.color;
    }
    return null;
  }

  // Helper to recursively find first VECTOR node with a solid fill
  function findVectorSolidColor(node) {
    if (!node) return null;
    if (node.type === 'VECTOR' && Array.isArray(node.fills)) {
      const solid = node.fills.find(f => f.type === 'SOLID' && (f.visible === undefined || f.visible === true));
      if (solid && solid.color) return solid.color;
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = findVectorSolidColor(child);
        if (found) return found;
      }
    }
    return null;
  }

  // Helper to recursively find a TEXT node by name
  function findTextNodeByName(node, name) {
    if (!node) return null;
    if (node.type === 'TEXT' && node.name === name) return node;
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = findTextNodeByName(child, name);
        if (found) return found;
      }
    }
    return null;
  }
  // Helper to recursively find a FRAME or ELLIPSE node by name
  function findShapeNodeByName(node, name) {
    if (!node) return null;
    if ((node.type === 'FRAME' || node.type === 'ELLIPSE') && node.name === name) return node;
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = findShapeNodeByName(child, name);
        if (found) return found;
      }
    }
    return null;
  }

  // Find label and description text nodes
  const labelTextNode = findTextNodeByName(figmaNode, 'Label');
  const descriptionTextNode = findTextNodeByName(figmaNode, 'Description');
  // Find radio shape node for border color
  const radioShapeNode = findShapeNodeByName(figmaNode, 'Radio');

  // Extract label color from Figma fills or fallback to vector color
  let labelColorObj = getSolidColorFromFills(labelTextNode?.fills) || getSolidColorFromFills(textNode.fills) || getSolidColorFromFills(externalTextNode.fills);
  if (!labelColorObj) {
    labelColorObj = findVectorSolidColor(figmaNode) || { r: 0.20392157137393951, g: 0.250980406999588, b: 0.3294117748737335, a: 1 };
  }
  const labelHex = rgbaToHex(labelColorObj.r, labelColorObj.g, labelColorObj.b, labelColorObj.a);

  // Extract description color from Figma fills or fallback to vector color
  let descriptionColorObj = getSolidColorFromFills(descriptionTextNode?.fills) || getSolidColorFromFills(supportingTextNode.fills);
  if (!descriptionColorObj) {
    descriptionColorObj = findVectorSolidColor(figmaNode) || { r: 0.27843138575553894, g: 0.3294117748737335, b: 0.40392157435417175, a: 1 };
  }
  const descriptionHex = rgbaToHex(descriptionColorObj.r, descriptionColorObj.g, descriptionColorObj.b, descriptionColorObj.a);

  // Extract border color from Figma strokes or fallback to radio shape node
  let borderHex = '#000000'; // fallback
  let borderColorObj = getSolidColorFromStrokes(radioShapeNode?.strokes) || getSolidColorFromStrokes(checkboxBase.strokes);
  if (borderColorObj) {
    borderHex = rgbaToHex(borderColorObj.r, borderColorObj.g, borderColorObj.b, borderColorObj.a);
  } else if (checkboxBase.background?.[0]?.color) {
    const c = checkboxBase.background[0].color;
    borderHex = rgbaToHex(c.r, c.g, c.b, c.a);
  } else {
    const vectorColor = findVectorSolidColor(figmaNode);
    if (vectorColor) {
      borderHex = rgbaToHex(vectorColor.r, vectorColor.g, vectorColor.b, vectorColor.a);
    } else {
      borderHex = '#CCCCCC';
    }
  }

  // Extract properties
  const size = getPropertyValue(props, "Size", "md").toLowerCase();
  const isDisabled = getPropertyValue(props, "State") === "Disabled";
  const checked = getPropertyValue(props, "Checked") === "True" || getPropertyValue(props, "Selected") === "True";
  // Helper to recursively collect all non-empty text nodes
  function collectAllTextNodes(node, arr = []) {
    if (!node) return arr;
    if (node.type === 'TEXT' && node.characters && node.characters.trim()) {
      arr.push(node.characters.trim());
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) {
        collectAllTextNodes(child, arr);
      }
    }
    return arr;
  }

  // Collect text nodes from both radioInstance and figmaNode
  const allTexts = [...collectAllTextNodes(radioInstance), ...collectAllTextNodes(figmaNode)];
  let label = overrides.label || allTexts[0] || getPropertyValue(props, "Label") || externalTextNode.characters;
  let description = overrides.description || (allTexts.length > 1 ? allTexts[1] : '') || getPropertyValue(props, "Description") || supportingTextNode?.characters;
  if (label && description && label === description) description = '';

  const defaultValue = overrides.defaultValue || getPropertyValue(props, "DefaultValue");
  const id = overrides.id || generateId("b_");

  // Map font weight
  const fontWeight = textNode.style?.fontWeight || externalTextNode.style?.fontWeight ? mapFontWeightFromNumeric(textNode.style?.fontWeight || externalTextNode.style?.fontWeight) : 'medium';

  // Map layout properties
  const padding = {
    all: figmaNode.paddingLeft ? `p-${Math.round(figmaNode.paddingLeft / 4)}xl` : 'p-3xl'
  };
  const margin = {
    all: figmaNode.margin ? `m-${Math.round(figmaNode.margin / 4)}lg` : 'm-lg'
  };
  const borderWidth = {
    all: checkboxBase.strokeWeight ? `border-${Math.round(checkboxBase.strokeWeight)}` : 'border-2'
  };
  const width = figmaNode.absoluteBoundingBox?.width ? `w-[${figmaNode.absoluteBoundingBox.width}px]` : SIZE_MAPPINGS.width[size] || 'w-[360px]';
  const height = figmaNode.absoluteBoundingBox?.height ? `h-[${figmaNode.absoluteBoundingBox.height}px]` : SIZE_MAPPINGS.height[size] || 'h-[360px]';

  // Build content object, omitting empty label and description
  const content = {};
  if (label) content.label = label;
  if (description) content.description = description;
  if (defaultValue) content.defaultValue = defaultValue;
  content.checked = checked;

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
            padding,
            margin,
            borderColor: isDisabled ? '#CCCCCC' : borderHex,
            borderWidth,
            width,
            height
          },
          label: {
            color: isDisabled ? '#CCCCCC' : labelHex,
            variant: mapTextVariant(size),
            weight: fontWeight
          }
        },
        content
      },
      visibility: {
        value: !isDisabled
      },
      dpOn: mapInteractions(radioInstance),
      displayName: overrides.displayName || generateDisplayName("RadioButton"),
      dataSourceIds: [],
      id,
      parentId: "root_id"
    }
  };
}

// Helper Functions
function getPropertyValue(props, propName, defaultValue = undefined) {
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
  return variantMap[size?.toLowerCase()] || 'text-md';
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

function findIconNode(node) {
  if (node.type === 'VECTOR' && node.name === 'icon') {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findIconNode(child);
      if (found) return found;
    }
  }
  return null;
}

// Example usage with fetch
const UNIFY_API_URL = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const FIGMA_URL = 'https://www.figma.com/design/huI2r4FfZauzyQRfwb2sTs/Untitled?node-id=15-92&t=kOCv1WOjWdUgrurr-4';

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

    // Save unifyOutput to unify.json
    const fs = require('fs');
    fs.writeFileSync('unify.json', JSON.stringify(unifyOutput, null, 2), 'utf8');
    console.log('Unify output saved to unify.json');
  })
  .catch(error => {
    console.error('Error:', error);
  });