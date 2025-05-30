function convertFigmaToUnifyRadioButton(figmaJson) {
  // Extract relevant data from Figma JSON
  const figmaNode = figmaJson.Result.nodes[Object.keys(figmaJson.Result.nodes)[0]];
  const figmaDoc = figmaNode.document;
  
  // Get text content and styles
  const textChild = figmaDoc.children.find(child => child.type === 'TEXT');
  const textContent = textChild ? textChild.characters : 'Option';
  
  // Get color from text or icon (default to purple from your example)
  let color = { r: 0.305, g: 0.149, b: 0.858, a: 1 };
  if (textChild && textChild.fills && textChild.fills[0].color) {
    color = textChild.fills[0].color;
  }
  
  // Convert RGBA to HEX
  const toHex = (value) => Math.round(value * 255).toString(16).padStart(2, '0');
  const hexColor = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  
  // Create Unify radio button component
  const unifyRadioButton = {
    cursor: {
      previous: "eyJmaWx0ZXIiOnsiZmllbGQiOiJwcm9wZXJ0aWVzLm5hbWUiLCJvcCI6IkxUIiwidmFsdWVzIjpbIlJhZGlvQnV0dG9uIl19LCJyZXZlcnNlIjp0cnVlfQ=="
    },
    hasMore: false,
    objects: [{
      createdTime: Date.now(),
      deleted: false,
      entityType: "e_component",
      id: `e_${Math.random().toString(16).substr(2, 24)}`,
      lastModifiedBy: 522,
      modifiedTime: Date.now(),
      ownerUserId: 522,
      properties: {
        layout: {
          footer: "footer_id",
          header: "header_id",
          body: "root_id"
        },
        interfaceType: "application",
        componentType: "PAGE",
        blocks: {
          header_id: {
            component: {
              componentType: "Stack",
              appearance: {
                alignItems: "stretch",
                reverseOrder: false,
                styles: {
                  padding: { all: "p-xl" },
                  flexWrap: "flex-nowrap",
                  gap: { all: "gap-xl" },
                  width: "w-full"
                },
                theme: "inherit",
                justifyContent: "flex-start",
                direction: "row"
              },
              content: {
                blockIds: ["__PLACEHOLDER__"]
              }
            },
            dpOn: [],
            visibility: { value: false },
            displayName: "Header",
            additional: { isRootBlock: true },
            dataSourceIds: [],
            id: "header_id"
          },
          root_id: {
            component: {
              componentType: "Stack",
              appearance: {
                alignItems: "center",
                reverseOrder: false,
                styles: {
                  padding: { all: "p-md" },
                  flexWrap: "flex-nowrap",
                  gap: { all: "gap-md" },
                  width: "w-full"
                },
                theme: "inherit",
                justifyContent: "flex-start",
                direction: "row"
              },
              content: {
                blockIds: ["radio_button", "label"]
              }
            },
            dpOn: [],
            visibility: { value: true },
            displayName: "Radio Button Group",
            additional: { isRootBlock: true },
            dataSourceIds: [],
            id: "root_id"
          },
          radio_button: {
            component: {
              componentType: "RadioButton",
              appearance: {
                styles: {
                  color: hexColor,
                  size: "md" // Convert from Figma's 'xs' to Unify's size scale
                }
              },
              content: {},
              properties: {
                checked: false,
                disabled: false,
                name: "radio_group"
              }
            },
            dpOn: [],
            visibility: { value: true },
            displayName: "Radio Button",
            additional: {},
            dataSourceIds: [],
            id: "radio_button"
          },
          label: {
            component: {
              componentType: "Text",
              appearance: {
                styles: {
                  color: hexColor,
                  fontSize: "text-md",
                  fontWeight: textChild.style.fontWeight >= 600 ? "font-bold" : "font-normal"
                }
              },
              content: {
                text: textContent
              }
            },
            dpOn: [],
            visibility: { value: true },
            displayName: "Label",
            additional: {},
            dataSourceIds: [],
            id: "label"
          }
        },
        name: "RadioButton",
        flags: {
          shouldUseBuiltDependencies: true
        },
        interfaceId: "radiobutton",
        dataSources: {},
        slug: "radiobutton",
        pageVariables: {}
      },
      standard: false,
      version: 0
    }],
    type: "HITS"
  };
  
  return unifyRadioButton;
}

// Usage example
const figmaJson = {
  "Result": {
    "name": "Untitled",
    "lastModified": "2025-05-30T08:31:43Z",
    "thumbnailUrl": "https://s3-alpha.figma.com/thumbnails/cc57c49c-6b2d-4593-b2b8-ce8201086480?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAQ4GOSFWCULRAZSF5%2F20250529%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20250529T000000Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=991c68ee5f21803a5ce09392d45e79b2c68204cee685da725d641fa555e0b9bb",
    "version": "2223857478588171592",
    "role": "viewer",
    "editorType": "figma",
    "linkAccess": "view",
    "nodes": {
      "1:62": {
        "document": {
          "id": "1:62",
          "name": "Radio buttons",
          "type": "INSTANCE",
          "scrollBehavior": "SCROLLS",
          "componentId": "1:31",
          "componentProperties": {
            "Selected": {
              "value": "True",
              "type": "VARIANT",
              "boundVariables": {}
            },
            "State": {
              "value": "Enabled",
              "type": "VARIANT",
              "boundVariables": {}
            }
          },
          "overrides": [
            {
              "id": "1:62",
              "overriddenFields": [
                "height",
                "transitionDuration",
                "transitionEasing",
                "transitionNodeID",
                "width"
              ]
            },
            {
              "id": "I1:62;51739:4612;54616:25474",
              "overriddenFields": [
                "fills",
                "inheritFillStyleId"
              ]
            }
          ],
          "children": [
            {
              "id": "I1:62;51740:4720",
              "name": "container",
              "type": "FRAME",
              "scrollBehavior": "SCROLLS",
              "children": [
                {
                  "id": "I1:62;51740:4710",
                  "name": "state-layer",
                  "type": "FRAME",
                  "scrollBehavior": "SCROLLS",
                  "children": [
                    {
                      "id": "I1:62;51739:4612",
                      "name": "icon",
                      "type": "INSTANCE",
                      "scrollBehavior": "SCROLLS",
                      "componentId": "1:15",
                      "overrides": [
                        {
                          "id": "I1:62;51739:4612;54616:25474",
                          "overriddenFields": [
                            "fills",
                            "inheritFillStyleId"
                          ]
                        }
                      ],
                      "children": [
                        {
                          "id": "I1:62;51739:4612;54616:25474",
                          "name": "icon",
                          "type": "VECTOR",
                          "scrollBehavior": "SCROLLS",
                          "boundVariables": {
                            "fills": [
                              {
                                "type": "VARIABLE_ALIAS",
                                "id": "VariableID:9ca10123c3a0ebba42df4c7970a810759709c8d5/57299:22397"
                              }
                            ]
                          },
                          "blendMode": "PASS_THROUGH",
                          "fills": [
                            {
                              "blendMode": "NORMAL",
                              "type": "SOLID",
                              "color": {
                                "r": 1,
                                "g": 0.8470588326454163,
                                "b": 0.8941176533699036,
                                "a": 1
                              },
                              "boundVariables": {
                                "color": {
                                  "type": "VARIABLE_ALIAS",
                                  "id": "VariableID:9ca10123c3a0ebba42df4c7970a810759709c8d5/57299:22397"
                                }
                              }
                            }
                          ],
                          "fillOverrideTable": {},
                          "strokes": [],
                          "strokeWeight": 0.02500000037252903,
                          "strokeAlign": "INSIDE",
                          "styles": {
                            "fill": "1:80"
                          },
                          "absoluteBoundingBox": {
                            "x": 39,
                            "y": -71,
                            "width": 20,
                            "height": 20
                          },
                          "absoluteRenderBounds": {
                            "x": 39,
                            "y": -71,
                            "width": 20,
                            "height": 20
                          },
                          "constraints": {
                            "vertical": "SCALE",
                            "horizontal": "SCALE"
                          },
                          "effects": [],
                          "interactions": []
                        }
                      ],
                      "blendMode": "PASS_THROUGH",
                      "clipsContent": false,
                      "background": [],
                      "fills": [],
                      "strokes": [],
                      "strokeWeight": 1,
                      "strokeAlign": "INSIDE",
                      "backgroundColor": {
                        "r": 0,
                        "g": 0,
                        "b": 0,
                        "a": 0
                      },
                      "absoluteBoundingBox": {
                        "x": 37,
                        "y": -73,
                        "width": 24,
                        "height": 24
                      },
                      "absoluteRenderBounds": {
                        "x": 37,
                        "y": -73,
                        "width": 24,
                        "height": 24
                      },
                      "constraints": {
                        "vertical": "TOP",
                        "horizontal": "LEFT"
                      },
                      "layoutAlign": "INHERIT",
                      "layoutGrow": 0,
                      "layoutSizingHorizontal": "FIXED",
                      "layoutSizingVertical": "FIXED",
                      "effects": [],
                      "interactions": []
                    }
                  ],
                  "blendMode": "PASS_THROUGH",
                  "clipsContent": false,
                  "background": [],
                  "fills": [],
                  "strokes": [],
                  "strokeWeight": 1,
                  "strokeAlign": "INSIDE",
                  "backgroundColor": {
                    "r": 0,
                    "g": 0,
                    "b": 0,
                    "a": 0
                  },
                  "layoutMode": "HORIZONTAL",
                  "counterAxisAlignItems": "CENTER",
                  "primaryAxisAlignItems": "CENTER",
                  "paddingLeft": 8,
                  "paddingRight": 8,
                  "paddingTop": 8,
                  "paddingBottom": 8,
                  "layoutWrap": "NO_WRAP",
                  "absoluteBoundingBox": {
                    "x": 29,
                    "y": -81,
                    "width": 40,
                    "height": 40
                  },
                  "absoluteRenderBounds": {
                    "x": 29,
                    "y": -81,
                    "width": 40,
                    "height": 40
                  },
                  "constraints": {
                    "vertical": "TOP",
                    "horizontal": "LEFT"
                  },
                  "layoutAlign": "INHERIT",
                  "layoutGrow": 0,
                  "layoutSizingHorizontal": "HUG",
                  "layoutSizingVertical": "HUG",
                  "effects": [],
                  "interactions": []
                }
              ],
              "blendMode": "PASS_THROUGH",
              "clipsContent": true,
              "background": [],
              "fills": [],
              "strokes": [],
              "cornerRadius": 100,
              "cornerSmoothing": 0,
              "strokeWeight": 1,
              "strokeAlign": "INSIDE",
              "backgroundColor": {
                "r": 0,
                "g": 0,
                "b": 0,
                "a": 0
              },
              "layoutMode": "HORIZONTAL",
              "counterAxisAlignItems": "CENTER",
              "primaryAxisAlignItems": "CENTER",
              "layoutWrap": "NO_WRAP",
              "absoluteBoundingBox": {
                "x": 29,
                "y": -81,
                "width": 40,
                "height": 40
              },
              "absoluteRenderBounds": {
                "x": 29,
                "y": -81,
                "width": 40,
                "height": 40
              },
              "constraints": {
                "vertical": "TOP",
                "horizontal": "LEFT"
              },
              "layoutAlign": "INHERIT",
              "layoutGrow": 0,
              "layoutSizingHorizontal": "HUG",
              "layoutSizingVertical": "HUG",
              "effects": [],
              "interactions": []
            }
          ],
          "blendMode": "PASS_THROUGH",
          "clipsContent": false,
          "background": [],
          "fills": [],
          "strokes": [],
          "strokeWeight": 1,
          "strokeAlign": "INSIDE",
          "backgroundColor": {
            "r": 0,
            "g": 0,
            "b": 0,
            "a": 0
          },
          "layoutMode": "HORIZONTAL",
          "counterAxisSizingMode": "FIXED",
          "primaryAxisSizingMode": "FIXED",
          "counterAxisAlignItems": "CENTER",
          "primaryAxisAlignItems": "CENTER",
          "layoutWrap": "NO_WRAP",
          "absoluteBoundingBox": {
            "x": -24,
            "y": -122,
            "width": 146,
            "height": 122
          },
          "absoluteRenderBounds": {
            "x": -24,
            "y": -122,
            "width": 146,
            "height": 122
          },
          "constraints": {
            "vertical": "TOP",
            "horizontal": "LEFT"
          },
          "layoutSizingHorizontal": "FIXED",
          "layoutSizingVertical": "FIXED",
          "effects": [],
          "transitionNodeID": "1:30",
          "transitionDuration": 200,
          "transitionEasing": "CUSTOM_BEZIER",
          "interactions": [
            {
              "trigger": {
                "type": "ON_HOVER"
              },
              "actions": [
                {
                  "type": "NODE",
                  "destinationId": "1:30",
                  "navigation": "CHANGE_TO",
                  "transition": {
                    "type": "SMART_ANIMATE",
                    "easing": {
                      "type": "CUSTOM_CUBIC_BEZIER",
                      "easingFunctionCubicBezier": {
                        "x1": 0.20000000298023224,
                        "y1": 0,
                        "x2": 0,
                        "y2": 1
                      }
                    },
                    "duration": 0.20000000298023224
                  },
                  "resetVideoPosition": false,
                  "resetScrollPosition": false,
                  "preserveScrollPosition": false
                }
              ]
            }
          ]
        },
        "components": {
          "1:31": {
            "key": "42846d2e6f4e95af728187cd232e1e288009051c",
            "name": "Selected=True, State=Enabled",
            "description": "",
            "remote": true,
            "componentSetId": "1:21",
            "documentationLinks": []
          },
          "1:15": {
            "key": "4c148a7c0d43909dabe83776e5e923d62b326a42",
            "name": "radio_button_checked",
            "description": "",
            "remote": true,
            "documentationLinks": []
          }
        },
        "componentSets": {
          "1:21": {
            "key": "aa0134adaa6451053bf3b6e00a2adcb99f92ba1e",
            "name": "Radio buttons",
            "description": "Radio buttons are the recommended way to allow users to make a single selection from a list of options.",
            "remote": true
          }
        },
        "schemaVersion": 0,
        "styles": {
          "1:80": {
            "key": "2ada25b21ca9d909d5dbd28ea54a94661fb557ad",
            "name": "M3/sys/light/tertiary-fixed",
            "styleType": "FILL",
            "remote": true,
            "description": ""
          }
        }
      }
    }
  }
}
const unifyRadioButton = convertFigmaToUnifyRadioButton(figmaJson);
console.log(JSON.stringify(unifyRadioButton, null, 2));