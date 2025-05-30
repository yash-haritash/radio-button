// 1. Fetch Figma Component JSON
const url = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const data = {
  fileUrl: 'https://www.figma.com/design/4r7C2sI9cktH4T8atJhmrW/Component-Sheet?node-id=1-5781&t=Br3U1RuFVDcShCrR-4',
};

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then(response => response.json())
  .then(figmaJson => {
    console.log('Fetched Figma JSON:\n', JSON.stringify(figmaJson, null, 2));

    // 2. Convert to Unify Format
    const unifyOutput = convertFigmaRadioButtonToUnify(figmaJson, {
      label: "Accept Terms",
      id: "terms-radio-1",
      description: "I agree to the terms and conditions"
    });

    console.log('\nConverted Unify RadioButton JSON:\n', JSON.stringify(unifyOutput, null, 2));
  })
  .catch(error => {
    console.error('Error:', error);
  });


// ----------------------
// 3. Conversion Function
// ----------------------

function convertFigmaRadioButtonToUnify(figmaJson, overrides = {}) {
  const nodes = figmaJson.Result?.nodes || figmaJson.nodes || {};
  const nodeKey = Object.keys(nodes)[0];
  const figmaNode = nodes[nodeKey]?.document || {};
  const props = figmaNode.componentProperties || {};

  const size = getPropertyValue(props, "Size", "md").toLowerCase();
  const isDisabled = getPropertyValue(props, "State") === "Disabled";
  const label = overrides.label || getPropertyValue(props, "Label", "Radio Button");
  const fontSizeVariant = getPropertyValue(props, "FontSize", "body-4").toLowerCase();
  const isChecked = getPropertyValue(props, "Checked") === "True";

  const fills = extractFills(figmaNode);
  const strokes = extractStrokes(figmaNode);
  const textColor = extractTextColor(figmaNode);
  const id = overrides.id || generateId("rb_");

  return {
    [id]: {
      component: {
        componentType: "RadioButton",
        appearance: {
          size: mapUnifySize(size),
          description: {
            color: isDisabled ? '#9E9E9E' : (fills.description || '#757575'),
            variant: 'text-xxs',
            weight: 'regular',
            fontSize: FONT_SIZE_MAP['code-2'] || 11
          },
          label: {
            color: isDisabled ? '#9E9E9E' : (textColor || '#212121'),
            variant: mapTextVariant(size),
            weight: mapFontWeight(getPropertyValue(props, "Weight", "medium")),
            fontSize: FONT_SIZE_MAP[fontSizeVariant] || FONT_SIZE_MAP['body-4'] || 14
          },
          background: {
            color: fills.background || 'transparent',
            borderColor: strokes.border || 'transparent',
            borderRadius: extractCornerRadius(figmaNode) || '0px'
          }
        },
        layout: {
          width: mapDimension('width', getPropertyValue(props, "Width", "auto")),
          height: mapDimension('height', getPropertyValue(props, "Height", "auto")),
          margin: mapSpacing(getPropertyValue(props, "Margin", "none")),
          padding: mapSpacing(getPropertyValue(props, "Padding", "none"))
        },
        content: {
          label,
          description: overrides.description || getPropertyValue(props, "Description", ""),
          checked: isChecked,
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

// ----------------------
// 4. Helper Functions
// ----------------------

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

function mapSpacing(value) {
  const spacingMap = {
    'none': '0px', 'xxs': '4px', 'xs': '8px',
    'sm': '12px', 'md': '16px', 'lg': '24px', 'xl': '32px'
  };
  return spacingMap[value?.toLowerCase()] || '0px';
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

function extractFills(node) {
  const fills = { background: 'transparent', description: null };
  if (node.fills?.length > 0) {
    const bg = node.fills.find(f => f.type === 'SOLID');
    if (bg) fills.background = rgbaToHex(bg.color);
  }
  if (node.children?.length > 0) {
    const textNodes = node.children.filter(c => c.type === 'TEXT');
    const descNode = textNodes.find(t => t.name.toLowerCase().includes('description'));
    if (descNode?.fills?.length > 0) {
      const fill = descNode.fills.find(f => f.type === 'SOLID');
      if (fill) fills.description = rgbaToHex(fill.color);
    }
  }
  return fills;
}

function extractStrokes(node) {
  const strokes = { border: 'transparent' };
  if (node.strokes?.length > 0) {
    const stroke = node.strokes.find(s => s.type === 'SOLID');
    if (stroke) strokes.border = rgbaToHex(stroke.color);
  }
  return strokes;
}

function extractTextColor(node) {
  if (node.children?.length > 0) {
    const textNodes = node.children.filter(c => c.type === 'TEXT');
    const labelNode = textNodes.find(t => t.name.toLowerCase().includes('label'));
    if (labelNode?.fills?.length > 0) {
      const fill = labelNode.fills.find(f => f.type === 'SOLID');
      if (fill) return rgbaToHex(fill.color);
    }
  }
  return null;
}

function extractCornerRadius(node) {
  return node.cornerRadius !== undefined ? `${node.cornerRadius}px` : null;
}

function rgbaToHex(color) {
  if (!color) return '#000000';
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
}

// Font size map
const FONT_SIZE_MAP = {
  'heading-1': 72, 'heading-2': 60, 'heading-3': 48, 'heading-4': 44,
  'subtitle-1': 30, 'subtitle-2': 24, 'body-1': 20, 'body-2': 18,
  'body-3': 16, 'body-4': 14, 'code-1': 12, 'code-2': 11, 'code-3': 10
};

// Size mapping
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
