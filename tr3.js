/**
 * Dynamic Figma to Unify Radio Button Converter
 * Handles all properties and adapts to styling changes
 */
class FigmaUnifyConverter {
  // Default configuration based on Unify App properties
  constructor() {
    this.unifyDefaults = {
      componentType: 'RadioButton',
      name: 'RadioButton',
      content: {
        label: 'Radio Button',
        description: '',
        checked: false,
        disabled: false
      },
      appearance: {
        base: {
          size: 'md',
          spacing: 8,
          padding: 4
        },
        label: {
          variant: 'body-4',
          weight: 'medium',
          fontSize: 14
        },
        description: {
          variant: 'code-2',
          weight: 'regular',
          fontSize: 11
        }
      },
      layout: {
        width: 'auto',
        height: 'auto',
        margin: 'none',
        padding: 'none'
      },
      background: {
        color: 'transparent'
      },
      border: {
        width: 'none',
        color: 'transparent',
        radius: 'none'
      },
      visibility: {
        value: true
      },
      dpOn: [{ event: 'click', action: 'toggle' }]
    };

    // Figma to Unify property mappings
    this.propertyMappings = {
      // Component properties
      'Checked': { path: 'content.checked', transform: val => val === 'True' },
      'State': { 
        path: 'content.disabled', 
        transform: val => val === 'Disabled',
        additional: (val, output) => {
          output.visibility.value = val !== 'Disabled';
        }
      },
      'Size': { 
        path: 'appearance.base.size',
        transform: this.mapSize.bind(this)
      },
      'Label': { path: 'content.label' },
      'Description': { path: 'content.description' },
      'Weight': { 
        path: 'appearance.label.weight',
        transform: this.mapFontWeight.bind(this)
      },
      
      // Style properties
      'Fills': { 
        path: 'background.color',
        transform: this.mapColor.bind(this)
      },
      'Strokes': { 
        path: 'border.color',
        transform: this.mapColor.bind(this)
      },
      'StrokeWeight': { 
        path: 'border.width',
        transform: val => val > 0 ? `${val}px` : 'none'
      },
      'CornerRadius': {
        path: 'border.radius',
        transform: val => val > 0 ? `${val}px` : 'none'
      },
      'ItemSpacing': {
        path: 'appearance.base.spacing'
      },
      'Padding': {
        path: 'layout.padding',
        transform: val => val > 0 ? `${val}px` : 'none'
      },
      'FontSize': {
        path: 'appearance.label.fontSize',
        transform: val => this.getClosestFontSize(val),
        additional: (val, output) => {
          output.appearance.label.variant = this.pxToVariant(val);
        }
      }
    };

    // Font size mapping from Unify properties
    this.fontSizeMap = {
      'heading-1': 72,
      'heading-2': 60,
      'heading-3': 48,
      'heading-4': 44,
      'subtitle-1': 30,
      'subtitle-2': 24,
      'body-1': 20,
      'body-2': 18,
      'body-3': 16,
      'body-4': 14,
      'code-1': 12,
      'code-2': 11,
      'code-3': 10
    };

    // Create reverse mapping from px to variant
    this.pxToVariant = (px) => {
      const sizes = Object.entries(this.fontSizeMap);
      const closest = sizes.reduce((closest, [variant, size]) => {
        const diff = Math.abs(px - size);
        return diff < closest.diff ? { variant, diff } : closest;
      }, { variant: 'body-4', diff: Infinity }).variant;
      
      return closest;
    };
  }

  // Convert Figma JSON to Unify format
  convert(figmaJson, overrides = {}) {
    try {
      // 1. Extract Figma data
      const figmaData = this.extractFigmaData(figmaJson);
      
      // 2. Start with Unify defaults
      const unifyOutput = JSON.parse(JSON.stringify(this.unifyDefaults));
      
      // 3. Apply property mappings
      this.applyPropertyMappings(figmaData, unifyOutput);
      
      // 4. Apply interactions
      unifyOutput.dpOn = this.mapInteractions(figmaData.node);
      
      // 5. Apply overrides
      this.applyOverrides(overrides, unifyOutput);
      
      // 6. Add identifiers
      unifyOutput.id = overrides.id || this.generateId('rb_');
      unifyOutput.name = overrides.name || `RadioButton_${unifyOutput.id}`;
      unifyOutput.parentId = overrides.parentId || 'root';
      
      return unifyOutput;
      
    } catch (error) {
      console.error('Conversion error:', error);
      return this.createFallback(overrides);
    }
  }

  // Extract data from Figma JSON
  extractFigmaData(figmaJson) {
    const result = { properties: {}, styles: {} };
    
    // Find the main component node
    const nodes = figmaJson.Result?.nodes || figmaJson.nodes || {};
    const nodeKey = Object.keys(nodes)[0];
    result.node = nodes[nodeKey]?.document || {};
    
    // Extract component properties
    const props = result.node.componentProperties || {};
    for (const [key, value] of Object.entries(props)) {
      result.properties[key] = value.value;
    }
    
    // Extract style properties
    const styleProps = ['fills', 'strokes', 'strokeWeight', 'cornerRadius', 
                        'itemSpacing', 'padding', 'fontSize'];
    
    for (const prop of styleProps) {
      if (result.node[prop] !== undefined) {
        result.styles[prop] = result.node[prop];
      }
    }
    
    // Extract from children if needed
    if (result.node.children) {
      const textNode = result.node.children.find(c => c.type === 'TEXT');
      if (textNode) {
        if (!result.styles.fontSize && textNode.style?.fontSize) {
          result.styles.fontSize = textNode.style.fontSize;
        }
      }
    }
    
    return result;
  }

  // Apply property mappings to Unify output
  applyPropertyMappings(figmaData, unifyOutput) {
    // Apply component property mappings
    for (const [figmaProp, mapping] of Object.entries(this.propertyMappings)) {
      const value = figmaData.properties[figmaProp] ?? figmaData.styles[figmaProp.toLowerCase()];
      
      if (value !== undefined) {
        // Apply transformation if needed
        const transformedValue = mapping.transform 
          ? mapping.transform(value) 
          : value;
        
        // Set value at path
        this.setValueAtPath(unifyOutput, mapping.path, transformedValue);
        
        // Apply additional mappings if defined
        if (mapping.additional) {
          mapping.additional(value, unifyOutput);
        }
      }
    }
    
    // Special handling for disabled state
    if (unifyOutput.content.disabled) {
      unifyOutput.appearance.label.weight = 'regular';
      unifyOutput.visibility.value = false;
    }
  }

  // Apply user overrides
  applyOverrides(overrides, unifyOutput) {
    for (const [key, value] of Object.entries(overrides)) {
      // Handle nested objects with dot notation
      if (key.includes('.')) {
        this.setValueAtPath(unifyOutput, key, value);
      } 
      // Handle top-level properties
      else if (unifyOutput.hasOwnProperty(key)) {
        unifyOutput[key] = value;
      }
      // Handle content properties
      else if (unifyOutput.content.hasOwnProperty(key)) {
        unifyOutput.content[key] = value;
      }
      // Handle appearance properties
      else if (unifyOutput.appearance.hasOwnProperty(key)) {
        unifyOutput.appearance[key] = value;
      }
      // Handle nested appearance properties
      else {
        const appearanceKeys = Object.keys(unifyOutput.appearance);
        for (const section of appearanceKeys) {
          if (unifyOutput.appearance[section].hasOwnProperty(key)) {
            unifyOutput.appearance[section][key] = value;
            break;
          }
        }
      }
    }
  }

  // Helper to set value at object path
  setValueAtPath(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }

  // Mappings and transformations
  mapSize(size) {
    const validSizes = ['sm', 'md', 'lg', 'xl'];
    const normalized = size.toLowerCase();
    return validSizes.includes(normalized) ? normalized : 'md';
  }

  mapFontWeight(weight) {
    const weights = ['light', 'regular', 'medium', 'semi-bold', 'bold'];
    const normalized = weight.toLowerCase();
    return weights.includes(normalized) ? normalized : 'medium';
  }

  mapColor(colorData) {
    if (!colorData) return 'transparent';
    if (colorData === 'transparent') return 'transparent';
    
    // Handle Figma color objects
    if (typeof colorData === 'object') {
      if (colorData.type === 'SOLID') {
        // Convert to hex for mapping
        const toHex = (val) => Math.round(val * 255).toString(16).padStart(2, '0');
        const hex = `#${toHex(colorData.color.r)}${toHex(colorData.color.g)}${toHex(colorData.color.b)}`.toLowerCase();
        
        // Map to Unify color tokens
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
    }
    
    return 'transparent';
  }

  getClosestFontSize(pxSize) {
    const sizes = Object.values(this.fontSizeMap);
    return sizes.reduce((closest, size) => 
      Math.abs(size - pxSize) < Math.abs(closest - pxSize) ? size : closest
    );
  }

  mapInteractions(node) {
    if (node.interactions?.length > 0) {
      return node.interactions.map(i => ({
        event: i.trigger.type.toLowerCase().replace('on_', ''),
        action: i.actions[0]?.type.toLowerCase() || 'toggle'
      }));
    }
    return this.unifyDefaults.dpOn;
  }

  // Utility functions
  generateId(prefix = '') {
    return `${prefix}${Math.random().toString(36).substring(2, 9)}`;
  }

  createFallback(overrides = {}) {
    return {
      ...this.unifyDefaults,
      name: overrides.name || 'FallbackRadio',
      id: overrides.id || this.generateId('fallback_'),
      error: 'Conversion failed'
    };
  }
}

// API Integration Example
async function convertFigmaToUnify(figmaUrl) {
  const converter = new FigmaUnifyConverter();
  
  try {
    // 1. Fetch Figma data from your API
    const response = await fetch('https://api.qa.unifyapps.com/api-endpoint/figma/Fetch-Figma-Details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileUrl: figmaUrl })
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    // 2. Convert to Unify format
    const figmaJson = await response.json();
    return converter.convert(figmaJson, {
      name: 'ConvertedRadioButton'
    });
    
  } catch (error) {
    console.error('Conversion failed:', error);
    return converter.createFallback();
  }
}

// Example Usage
const figmaUrl = 'https://www.figma.com/design/huI2r4FfZauzyQRfwb2sTs/Untitled?node-id=1-62&t=nafiDHsCG1ytZJ0d-4';

convertFigmaToUnify(figmaUrl)
  .then(unifyConfig => {
    console.log('Converted Unify Config:', JSON.stringify(unifyConfig, null, 2));
    // Use the config in your Unify application
  });