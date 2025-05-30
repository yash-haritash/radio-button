/**
 * Converts a Figma radio button component to Unify format
 * @param {Object} figmaJson - The Figma JSON data
 * @param {Object} overrides - Optional overrides for the output
 * @returns {Object} The converted Unify radio button JSON
 */
function convertFigmaRadioButtonToUnify(figmaJson, overrides = {}) {
  try {
    // 1. Validate and extract the Figma node
    const nodes = figmaJson.Result?.nodes || figmaJson.nodes;
    if (!nodes || Object.keys(nodes).length === 0) {
      throw new Error("No nodes found in Figma JSON");
    }

    const firstNodeKey = Object.keys(nodes)[0];
    const figmaNode = nodes[firstNodeKey]?.document;
    if (!figmaNode) {
      throw new Error("Invalid Figma node structure");
    }

    // 2. Extract component properties with defaults
    const props = figmaNode.componentProperties || {};
    const style = extractFigmaStyles(figmaNode);
    const interactions = mapInteractions(figmaNode);

    // 3. Map all properties with proper fallbacks
    const mapping = {
      // State properties
      checked: getPropertyValue(props, "Checked") === "True",
      disabled: getPropertyValue(props, "State") === "Disabled",
      interactive: getPropertyValue(props, "State") !== "Disabled",
      
      // Size properties
      size: mapFigmaSize(getPropertyValue(props, "Size", "md")),
      
      // Color properties
      primaryColor: style.primaryColor || 'text-primary',
      secondaryColor: style.secondaryColor || 'text-secondary',
      disabledColor: style.disabledColor || 'text-disabled',
      hoverColor: style.hoverColor || style.primaryColor || 'text-primary',
      activeColor: style.activeColor || style.primaryColor || 'text-primary',
      
      // Text properties
      labelVariant: mapTextVariant(getPropertyValue(props, "Size", "md")),
      descriptionVariant: 'text-xxs',
      
      // Layout properties
      spacing: style.spacing || 8,
      padding: style.padding || 4,
      
      // Content
      label: overrides.label || getPropertyValue(props, "Label", "Radio Button"),
      description: overrides.description || getPropertyValue(props, "Description", ""),
      
      // Interactions
      dpOn: interactions.length > 0 ? interactions : [{ event: 'click', action: 'toggle' }]
    };

    // 4. Build the Unify component structure
    return {
      component: {
        componentType: "RadioButton",
        appearance: {
          base: {
            size: mapping.size,
            spacing: mapping.spacing,
            padding: mapping.padding
          },
          description: {
            color: mapping.disabled ? mapping.disabledColor : mapping.secondaryColor,
            variant: mapping.descriptionVariant,
            weight: "regular"
          },
          label: {
            color: mapping.disabled ? mapping.disabledColor : mapping.primaryColor,
            variant: mapping.labelVariant,
            weight: mapping.disabled ? "regular" : "medium"
          }
        },
        content: {
          label: mapping.label,
          description: mapping.description,
          checked: mapping.checked,
          disabled: mapping.disabled
        },
        states: {
          hover: {
            color: mapping.hoverColor
          },
          active: {
            color: mapping.activeColor
          }
        }
      },
      visibility: {
        value: !mapping.disabled
      },
      dpOn: mapping.dpOn,
      displayName: overrides.displayName || generateDisplayName("RadioButton"),
      id: overrides.id || generateId("rb_"),
      parentId: overrides.parentId || "root_id"
    };

  } catch (error) {
    console.error("Conversion error:", error);
    return {
      error: "Failed to convert Figma to Unify",
      details: error.message,
      fallback: createFallbackRadioButton(overrides)
    };
  }
}

/**
 * Safely gets a property value with fallback
 */
function getPropertyValue(props, propName, defaultValue = "") {
  if (!props || !propName) return defaultValue;
  return props[propName]?.value ?? defaultValue;
}

/**
 * Extracts styles from Figma node
 */
function extractFigmaStyles(node) {
  const styles = {};
  
  // Extract colors
  if (node.fills?.length > 0) {
    const fill = node.fills.find(f => f.type === 'SOLID');
    if (fill) styles.primaryColor = rgbToColorToken(fill.color);
  }
  
  if (node.strokes?.length > 0) {
    const stroke = node.strokes.find(s => s.type === 'SOLID');
    if (stroke) styles.secondaryColor = rgbToColorToken(stroke.color);
  }

  // Extract layout properties
  if (node.itemSpacing !== undefined) styles.spacing = node.itemSpacing;
  if (node.paddingLeft !== undefined) styles.padding = node.paddingLeft;
  
  // Extract corner radius if available
  if (node.cornerRadius !== undefined) styles.cornerRadius = node.cornerRadius;
  
  return styles;
}

/**
 * Maps Figma size to Unify size tokens
 */
function mapFigmaSize(figmaSize) {
  const sizeMap = {
    'sm': 'text-sm',
    'md': 'text-md',
    'lg': 'text-lg',
    'xl': 'text-xl'
  };
  return sizeMap[figmaSize.toLowerCase()] || 'text-md';
}

/**
 * Maps text variants
 */
function mapTextVariant(figmaSize) {
  return mapFigmaSize(figmaSize); // Uses same mapping as sizes
}

/**
 * Converts RGB color to color token
 */
function rgbToColorToken(rgb) {
  if (!rgb) return 'text-primary';
  
  // Convert to hex for easier matching
  const toHex = (val) => Math.round(val * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toLowerCase();
  
  // Match common colors
  const colorMap = {
    '#000000': 'text-primary',
    '#333333': 'text-primary',
    '#666666': 'text-secondary',
    '#999999': 'text-disabled',
    '#ffffff': 'text-on-primary',
    '#007aff': 'text-interactive'
  };
  
  return colorMap[hex] || 'text-primary';
}

/**
 * Maps Figma interactions to Unify dpOn events
 */
function mapInteractions(node) {
  const interactions = [];
  
  if (node.interactions?.length > 0) {
    node.interactions.forEach(interaction => {
      if (interaction.trigger.type === 'ON_CLICK') {
        interactions.push({
          event: 'click',
          action: 'toggle'
        });
      } else if (interaction.trigger.type === 'ON_HOVER') {
        interactions.push({
          event: 'hover',
          action: 'highlight'
        });
      }
    });
  }
  
  return interactions;
}

/**
 * Creates a fallback radio button when conversion fails
 */
function createFallbackRadioButton(overrides = {}) {
  return {
    component: {
      componentType: "RadioButton",
      appearance: {
        base: {
          size: 'text-md',
          spacing: 8,
          padding: 4
        },
        description: {
          color: 'text-secondary',
          variant: 'text-xxs',
          weight: "regular"
        },
        label: {
          color: 'text-primary',
          variant: 'text-md',
          weight: "medium"
        }
      },
      content: {
        label: overrides.label || "Radio Button",
        description: overrides.description || "",
        checked: false,
        disabled: false
      },
      states: {
        hover: {
          color: 'text-interactive'
        },
        active: {
          color: 'text-primary'
        }
      }
    },
    visibility: {
      value: true
    },
    dpOn: [{ event: 'click', action: 'toggle' }],
    displayName: overrides.displayName || generateDisplayName("RadioButton"),
    id: overrides.id || generateId("rb_"),
    parentId: overrides.parentId || "root_id"
  };
}

/**
 * Generates a random display name
 */
function generateDisplayName(baseName) {
  return `${baseName}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Generates a random ID
 */
function generateId(prefix) {
  return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Watches for Figma changes and triggers conversion
 */
function watchForFigmaChanges(figmaJson, callback) {
  let previousJson = JSON.stringify(figmaJson);
  
  const checkInterval = setInterval(() => {
    const currentJson = JSON.stringify(figmaJson);
    if (currentJson !== previousJson) {
      previousJson = currentJson;
      try {
        const unifyJson = convertFigmaRadioButtonToUnify(JSON.parse(currentJson));
        callback(unifyJson);
      } catch (error) {
        console.error("Change detection error:", error);
        callback({ error: "Change detection failed", details: error.message });
      }
    }
  }, 500);

  return () => clearInterval(checkInterval);
}

// Export the functions if using in a module system
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    convertFigmaRadioButtonToUnify,
    watchForFigmaChanges
  };
}

const url = 'https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details';
const data = {
  fileUrl: 'https://www.figma.com/design/huI2r4FfZauzyQRfwb2sTs/Untitled?node-id=1-62&t=nafiDHsCG1ytZJ0d-4',
};

// First fetch the Figma JSON from your API
fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
})
  .then(response => response.json())
  .then(figmaJson => {
    console.log('Figma API Response:');
    console.log(JSON.stringify(figmaJson, null, 2)); // Beautified Figma JSON
    
    // Now convert to Unify format
    try {
      const unifyOutput = convertFigmaRadioButtonToUnify(figmaJson);
      
      console.log('\nConverted Unify Output:');
      console.log(JSON.stringify(unifyOutput, null, 2)); // Beautified Unify JSON
      
      // You can now use the unifyOutput as needed
      // For example, send it to another API or use it in your application
      
    } catch (error) {
      console.error('Conversion error:', error);
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
